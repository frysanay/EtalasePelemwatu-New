const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Expect 'Bearer <token>'
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Malformed token' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid token' });
    }
    // Attach user info to request for downstream use
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;

