require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes and middleware
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const socketHandler = require('./services/socketService');

// Initialize express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_FRONT],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io available in req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Український інтернет-магазин API працює!',
    version: '1.0.0',
    status: 'OK'
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});
// Error handling middleware (должен быть последним)
app.use(errorHandler);

// Socket.IO handling
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
  console.log(`🌍 API доступне за адресою: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket сервер активний`);
  console.log(`📊 Середовище: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM отримано, закриваю сервер...');
  server.close(() => {
    console.log('Сервер закрито');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT отримано, закриваю сервер...');
  server.close(() => {
    console.log('Сервер закрито');
    process.exit(0);
  });
});