// server/middleware/role.js
// Restrict access based on user role(s)
const authorize = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: `Forbidden: requires ${roles.join(' or ')} role` });
    }
    next();
  };
};

authorize.authorize = authorize;
module.exports = authorize;
