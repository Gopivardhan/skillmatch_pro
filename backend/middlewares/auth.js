const jwt = require('jsonwebtoken');

// Middleware to authenticate requests using JSON Web Tokens.
// It expects the Authorization header to be set as "Bearer <token>".
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing access token' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Attach the decoded user information to the request object.
    req.user = user;
    next();
  });
}

// Middleware factory to enforce that the authenticated user has one of the allowed roles.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const { user } = req;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};