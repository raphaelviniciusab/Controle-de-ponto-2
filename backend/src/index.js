const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const timeRoutes = require('./routes/timeRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Configuração CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // URLs do frontend Vite
  credentials: true, // Permite envio de cookies
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/time', timeRoutes);
app.use('/reports', reportRoutes);

if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
