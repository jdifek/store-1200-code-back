const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { validateCategory, validateProduct, validateReview, validateMessage } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Публичные маршруты (без аутентификации)
router.post('/login', adminController.login);

// Middleware для всех остальных админских маршрутов
router.use(authMiddleware);
router.use(adminMiddleware);

// === УПРАВЛЕНИЕ КАТЕГОРИЯМИ ===
router.get('/categories', adminController.getAllCategories);
router.post('/categories', validateCategory, adminController.createCategory);
router.put('/categories/:id', validateCategory, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// === УПРАВЛЕНИЕ ТОВАРАМИ ===
router.get('/products', adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products',  upload.array('images', 10), adminController.createProduct);
router.put(
  '/products/:id',
  upload.array('images', 10),
  adminController.updateProduct
);router.delete('/products/:id', adminController.deleteProduct);

// === УПРАВЛЕНИЕ ЧАТАМИ ===
router.get('/chats', adminController.getAllChats);
router.get('/chats/:id', adminController.getChatById);
router.get('/chats/:id/messages', adminController.getChatMessages);
router.post('/chats/:id/messages', validateMessage, adminController.sendMessage);

// === УПРАВЛЕНИЕ ОТЗЫВАМИ ===
router.get('/reviews', adminController.getAllReviews);
router.post('/reviews', validateReview, adminController.createReview);
router.put('/reviews/:id', adminController.updateReview);
router.delete('/reviews/:id', adminController.deleteReview);

// === СТАТИСТИКА ===
router.get('/stats', adminController.getStats);

module.exports = router;