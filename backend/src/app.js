const express = require('express');
const cors = require('cors');

const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { authMiddleware, authorizeRoles } = require('./middlewares/auth.middleware');
const {
  parseCookies,
  requestId,
  requireCookieCsrfHeader,
  securityHeaders
} = require('./middlewares/security.middleware');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const productsRoutes = require('./routes/products.routes');
const categoriesRoutes = require('./routes/categories.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const stockRoutes = require('./routes/stock.routes');
const salesRoutes = require('./routes/sales.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.set('trust proxy', 1);

app.use(requestId);
app.use(securityHeaders);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(parseCookies);

app.get('/', (req, res) => {
  res.json({
    message: 'Backend do sistema de controle de estoque e vendas em execução.',
    api: '/api',
    health: '/api/health',
    documentation: 'Consulte o README.md para rotas e instruções de uso.'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API do sistema de controle de estoque e vendas',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, requireCookieCsrfHeader, authorizeRoles('admin'), usersRoutes);
app.use('/api/products', authMiddleware, requireCookieCsrfHeader, productsRoutes);
app.use('/api/categories', authMiddleware, requireCookieCsrfHeader, categoriesRoutes);
app.use('/api/suppliers', authMiddleware, requireCookieCsrfHeader, suppliersRoutes);
app.use('/api/stock', authMiddleware, requireCookieCsrfHeader, stockRoutes);
app.use('/api/sales', authMiddleware, requireCookieCsrfHeader, salesRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/reports', authMiddleware, authorizeRoles('admin', 'gerente'), reportsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
