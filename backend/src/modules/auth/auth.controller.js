const authService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    // Returns { token, user: { id, name, email } }
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    // Returns { token, user: { id, name, email } }
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body; // The 'ya29...' token from frontend

    if (!access_token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const result = await authService.googleAuth(access_token);
    
    // Returns { token, user: { id, name, email } }
    res.status(200).json(result);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  }
};