const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/jwt');

exports.authGuard = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).end();

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).end();
  }
};
