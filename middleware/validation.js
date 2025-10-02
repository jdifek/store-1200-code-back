const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Помилка валідації',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Назва категорії повинна бути від 1 до 100 символів')
    .matches(/^[\u0400-\u04FF\s\w\-.,!?()]+$/)
    .withMessage('Назва категорії містить недозволені символи'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('parentId повинен бути валідним UUID'),
  handleValidationErrors
];

const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Назва товару повинна бути від 1 до 200 символів')
    .matches(/^[\u0400-\u04FF\s\w\-.,!?()]+$/)
    .withMessage('Назва товару містить недозволені символи'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Опис не повинен перевищувати 2000 символів'),
  body('price')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Ціна повинна бути позитивним числом до 1,000,000'),
  body('categoryId')
    .isUUID()
    .withMessage('categoryId повинен бути валідним UUID'),
  handleValidationErrors
];

const validateReview = [
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Зміст відгуку повинен бути від 10 до 1000 символів'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг повинен бути від 1 до 5'),
  body('avatar')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Аватар обов\'язковий та не більше 10 символів'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ім\'я автора повинно бути від 2 до 50 символів')
    .matches(/^[\u0400-\u04FF\s\w\-.']+$/)
    .withMessage('Ім\'я автора містить недозволені символи'),
  handleValidationErrors
];

const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Зміст повідомлення повинен бути від 1 до 1000 символів')
    .not()
    .isEmpty()
    .withMessage('Повідомлення не може бути порожнім'),
  handleValidationErrors
];

const validateChatStart = [
  body('sessionId')
    .optional()
    .isLength({ min: 10, max: 100 })
    .withMessage('sessionId повинен бути від 10 до 100 символів'),
  handleValidationErrors
];

module.exports = {
  validateCategory,
  validateProduct,
  validateReview,
  validateMessage,
  validateChatStart,
  handleValidationErrors
};