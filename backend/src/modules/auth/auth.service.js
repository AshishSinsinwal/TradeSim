const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { JWT_SECRET } = require('../../config/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (token) => {
  const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!googleResponse.ok) {
    const error = new Error('Invalid Google token');
    error.status = 401;
    throw error;
  }

  const payload = await googleResponse.json();
  const { sub: googleId, email, name } = payload;

  let user = await User.findOne({ 
    $or: [{ googleId }, { email }] 
  });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = await User.create({ 
      name, 
      email, 
      googleId 
    });
  }

  // 4. GENERATE SYSTEM JWT
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
  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name, // Added name to the model
    email,
    passwordHash: hash
  });

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

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

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