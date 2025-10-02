module.exports = (err, req, res, next) => {
  console.error('🔴 Помилка:', err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ 
      success: false,
      error: 'Запис з такими даними вже існує',
      code: 'DUPLICATE_ENTRY'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ 
      success: false,
      error: 'Запис не знайдено',
      code: 'NOT_FOUND'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ 
      success: false,
      error: 'Помилка зв\'язку між записами',
      code: 'FOREIGN_KEY_CONSTRAINT'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false,
      error: 'Помилка валідації', 
      details: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Недійсний токен',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Термін дії токена закінчився',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Custom application errors
  if (err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'APPLICATION_ERROR'
    });
  }

  // Default error
  res.status(500).json({ 
    success: false,
    error: 'Внутрішня помилка сервера',
    code: 'INTERNAL_SERVER_ERROR'
  });
};