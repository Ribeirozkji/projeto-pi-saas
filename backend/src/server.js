require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor:', error.message);
  process.exit(1);
});
