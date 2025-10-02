const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Получить все товары с фильтрацией и пагинацией
router.get('/', productController.getAllProducts);

// Поиск товаров
router.get('/search', productController.searchProducts);

// Получить товар по ID
router.get('/:id', productController.getProductById);

// Получить похожие товары
router.get('/:id/similar', productController.getSimilarProducts);

module.exports = router;