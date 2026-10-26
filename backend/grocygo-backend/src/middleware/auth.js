// Firebase Auth middleware for Express
const { admin } = require('../config/firebase');

module.exports = async (req, res, next) => {
  // Firebase Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[Auth Middleware] No token provided:', authHeader);
    return res.status(401).json({ error: 'No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
};
