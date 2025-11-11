function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado' });
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado' });
}

function isApproved(req, res, next) {
  if (req.session && req.session.user && req.session.user.status === 'aprobado') {
    return next();
  }
  return res.status(403).json({ error: 'Usuario pendiente de aprobación' });
}

module.exports = { isAuthenticated, isAdmin, isApproved };
