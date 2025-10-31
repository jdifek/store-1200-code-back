const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');

class ChatService {
  async startChat(sessionId) {
    // Если sessionId не предоставлен, создаем новый
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Проверяем, есть ли уже чат для этой сессии
    const existingChat = await prisma.chat.findFirst({
      where: { sessionId }
    });

    if (existingChat) {
      return existingChat;
    }

    return await prisma.chat.create({
      data: { sessionId }
    });
  }

  async sendMessage(chatId, content, fromAdmin) {
    const message = await prisma.message.create({
      data: {
        content,
        fromAdmin,
        chatId
      }
    });

    // Обновляем время последнего обновления чата
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  async getMessages(chatId, page, limit) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }
      }),
      prisma.message.count({ where: { chatId } })
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getChatById(id) {
    return await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100 // Последние 100 сообщений
        },
        _count: { select: { messages: true } }
      }
    });
  }
}

module.exports = new ChatService();
