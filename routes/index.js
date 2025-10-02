const express = require('express');
const router = express.Router();

// Import route modules
const adminRoutes = require('./admin');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const chatRoutes = require('./chat');
const reviewRoutes = require('./reviews');

// Mount routes
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/chat', chatRoutes);
router.use('/reviews', reviewRoutes);

// Health check for API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API працює коректно',
    timestamp: new Date().toISOString()
  });
});

// API info
router.get('/info', (req, res) => {
  res.json({
    name: 'Ukrainian E-commerce API',
    version: '1.0.0',
    description: 'API для українського інтернет-магазину',
    endpoints: {
      admin: '/api/admin/*',
      categories: '/api/categories',
      products: '/api/products',
      chat: '/api/chat',
      reviews: '/api/reviews'
    }
  });
});

module.exports = router;