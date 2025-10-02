const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { validateMessage } = require('../middleware/validation');

// Начать новый чат
router.post('/start', chatController.startChat);

// Получить чат по ID
router.get('/:chatId', chatController.getChatById);

// Отправить сообщение в чат
router.post('/:chatId/messages', validateMessage, chatController.sendMessage);

// Получить сообщения чата с пагинацией
router.get('/:chatId/messages', chatController.getMessages);

module.exports = router;