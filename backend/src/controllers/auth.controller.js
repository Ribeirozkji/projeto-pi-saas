const bcrypt = require('bcrypt');

const { pool } = require('../config/database');
const generateToken = require('../utils/generateToken');

function removePassword(user) {
  const { senha, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  const [users] = await pool.execute(
    `SELECT id, nome, email, senha, perfil, status, created_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({ message: 'Email ou senha inválidos.' });
  }

  const user = users[0];

  if (user.status !== 'ativo') {
    return res.status(403).json({ message: 'Usuário inativo.' });
  }

  const passwordMatches = await bcrypt.compare(senha, user.senha);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Email ou senha inválidos.' });
  }

  const token = generateToken(user);

  return res.json({
    user: removePassword(user),
    token
  });
}

async function me(req, res) {
  return res.json({
    user: {
      id: 1,
      nome: 'Usuário Local',
      email: 'sistema@local.com',
      perfil: 'admin',
      status: 'ativo'
    }
  });
}

module.exports = {
  login,
  me
};
