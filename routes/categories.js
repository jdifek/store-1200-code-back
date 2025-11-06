const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Получить все категории (иерархическая структура)
router.get('/', categoryController.getAllCategories);
router.get('/getTopFourCategories', categoryController.getTopFourCategories);

// Получить категорию по ID
router.get('/:id', categoryController.getCategoryById);

// Получить товары категории с пагинацией
router.get('/:id/products', categoryController.getCategoryProducts);

// Получить подкатегории
router.get('/:id/subcategories', categoryController.getSubcategories);

module.exports = router;