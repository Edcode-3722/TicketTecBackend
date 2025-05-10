const jwt = require('jsonwebtoken');

const verifyToken = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'No tienes permiso para esta acción' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Token inválido' });
    }
  };
};

module.exports = verifyToken;
