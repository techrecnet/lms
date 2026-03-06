const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};
