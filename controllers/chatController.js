const chatService = require('../services/chatService');

class ChatController {
  async startChat(req, res, next) {
    try {
      const { sessionId } = req.body;
      const chat = await chatService.startChat(sessionId);
      
      res.status(201).json({
        success: true,
        message: 'Чат створено',
        chat
      });
    } catch (error) {
      next(error);
    }
  }

  async getChatById(req, res, next) {
    try {
      const { chatId } = req.params;
      const chat = await chatService.getChatById(chatId);
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          error: 'Чат не знайдено'
        });
      }
      
      res.json({
        success: true,
        chat
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      
      const message = await chatService.sendMessage(chatId, content, false);
      
      // Отправить через WebSocket
      req.io.to(chatId).emit('new-message', message);
      
      // Уведомить админов
      req.io.to('admins').emit('admin-notification', {
        type: 'new-message',
        chatId,
        message
      });
      
      res.status(201).json({
        success: true,
        message: 'Повідомлення відправлено',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const result = await chatService.getMessages(
        chatId, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
