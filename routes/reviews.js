const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { validateReview } = require('../middleware/validation');

// Получить все отзывы с пагинацией
router.get('/', reviewController.getAllReviews);

// Создать новый отзыв
router.post('/', validateReview, reviewController.createReview);

// Получить отзыв по ID
router.get('/:id', reviewController.getReviewById);

module.exports = router;