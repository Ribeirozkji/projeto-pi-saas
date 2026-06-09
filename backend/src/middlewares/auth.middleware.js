const jwt = require('jsonwebtoken');

const { pool } = require('../config/database');
const { AUTH_COOKIE_NAME } = require('./security.middleware');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] || null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  req.authenticatedByCookie = Boolean(cookieToken && !bearerToken);

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'estoque-vendas-api',
      audience: process.env.JWT_AUDIENCE || 'estoque-vendas-web'
    });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }

  try {
    const [users] = await pool.execute(
      `SELECT id, nome, email, perfil, status, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário do token não encontrado.' });
    }

    const user = users[0];

    if (user.status !== 'ativo') {
      return res.status(403).json({ message: 'Usuário inativo.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!roles.includes(req.user.perfil)) {
      return res.status(403).json({ message: 'Acesso negado para este perfil de usuário.' });
    }

    return next();
  };
}

module.exports = {
  authMiddleware,
  authorizeRoles
};
