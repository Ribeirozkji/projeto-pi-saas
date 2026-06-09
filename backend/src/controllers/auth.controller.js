const bcrypt = require('bcrypt');

const { pool } = require('../config/database');
const generateToken = require('../utils/generateToken');
const { clearAuthCookie, setAuthCookie } = require('../middlewares/security.middleware');

const DUMMY_PASSWORD_HASH = '$2b$10$3jWm9tsstbmBUF1bO4P5h.lYdgPolII0bCDjiEURWFZFGss1WNRhe';

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

  const user = users[0];
  const passwordMatches = await bcrypt.compare(senha, user?.senha || DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches || user.status !== 'ativo') {
    return res.status(401).json({ message: 'Email ou senha inválidos.' });
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  return res.json({
    user: removePassword(user),
    ...(process.env.RETURN_TOKEN_IN_BODY === 'true' && { token })
  });
}

async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Sessão encerrada com sucesso.' });
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  login,
  logout,
  me
};
