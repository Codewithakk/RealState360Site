const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

dotenv.config();

const connectDB = require('./src/config/db');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Change if your frontend port is different
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, 'uploads')));
console.log('✅ Uploads folder served from:', path.join(__dirname, 'uploads'));
// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/houses', require('./src/routes/houses'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/api/websetting', require('./src/routes/webSettingRoutes'));
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});