const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { JWT_SECRET } = require('../../config/jwt');
const { OAuth2Client } = require('google-auth-library');

// 👇 CRITICAL: Import your Wallet Service to initialize funds
// Adjust the path if your wallet service is in a different folder
const walletService = require('../wallet/wallet.service'); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (token) => {
  // 1. Verify the ID Token (Correct method for @react-oauth/google)
  let ticket;
  try {
     ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    console.error("Google Verify Error:", error);
    throw new Error('Invalid Google Token'); // This handles the 401
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, name } = payload;

  // 2. Find or Create User
  let user = await User.findOne({ 
    $or: [{ googleId }, { email }] 
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // 🆕 New User? Create them.
    user = await User.create({ 
      name, 
      email, 
      googleId,
      passwordHash: "" // Handle empty password for Google users
    });

    // 💰 CRITICAL: Initialize their Wallet in Redis!
    // Assuming your wallet service has an init function like this:
    if (walletService.initWallet) {
        await walletService.initWallet(user.id);
    } else {
        // Fallback if you haven't exported initWallet yet
        // You might need to manually set Redis key here if walletService is missing
        console.warn("⚠️ Wallet initialization skipped! Ensure wallet exists.");
    }
  }

  // 3. Generate System JWT
  const jwtToken = signToken(user.id);

  return {
    token : jwtToken,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email 
    }
  };
};

exports.register = async ({ name, email, password }) => {
  // Check if user exists first to avoid Mongo duplicate key errors
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name, 
    email,
    passwordHash: hash
  });

  // 💰 Initialize Wallet for Email/Pass users too
  if (walletService.initWallet) {
      await walletService.initWallet(user.id);
  }

  const token = signToken(user.id);
  
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

// ... login remains the same ...
exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  // Handle Google-only users who have no password
  if (!user.passwordHash) throw new Error('Please login with Google');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: '24h' 
  });
}