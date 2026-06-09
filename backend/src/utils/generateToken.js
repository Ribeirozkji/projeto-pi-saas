const jwt = require('jsonwebtoken');

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
  }

  return jwt.sign(
    {
      id: user.id,
      perfil: user.perfil
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: process.env.JWT_ISSUER || 'estoque-vendas-api',
      audience: process.env.JWT_AUDIENCE || 'estoque-vendas-web'
    }
  );
}

module.exports = generateToken;
