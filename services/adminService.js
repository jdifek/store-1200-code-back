const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

class AdminService {
  async login(email, password) {
    // В реальном проекте админы должны быть в БД
    // Здесь для демонстрации используем переменные окружения
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', role: 'admin', email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: {
          id: 'admin',
          email,
          role: 'admin'
        }
      };
    }
    
    throw new Error('Невірні дані для входу');
  }

  // === КАТЕГОРИИ ===
  async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(data) {
    return await prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } }
      }
    });
  }

  async updateCategory(id, data) {
    return await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } }
      }
    });
  }

  async deleteCategory(id) {
    // Проверяем, есть ли товары в категории
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      throw new Error('Неможливо видалити категорію з товарами');
    }

    // Проверяем, есть ли подкатегории
    const childrenCount = await prisma.category.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      throw new Error('Неможливо видалити категорію з підкатегоріями');
    }

    return await prisma.category.delete({
      where: { id }
    });
  }

  // === ТОВАРЫ ===
  async getAllProducts({ page, limit, categoryId, search }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: { parent: true }
        }
      }
    });
  }

  async createProduct(data) {
    return await prisma.product.create({
      data,
      include: { category: true }
    });
  }

  async updateProduct(id, data) {
    return await prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async deleteProduct(id) {
    return await prisma.product.delete({
      where: { id }
    });
  }

  // === ЧАТЫ ===
  async getAllChats(page, limit) {
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: { select: { messages: true } }
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.chat.count()
    ]);

    return {
      chats,
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
          take: 50
        },
        _count: { select: { messages: true } }
      }
    });
  }

  async getChatMessages(chatId, page, limit) {
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

  // === ОТЗЫВЫ ===
  async getAllReviews(page, limit) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count()
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createReview(data) {
    return await prisma.review.create({ data });
  }

  async updateReview(id, data) {
    return await prisma.review.update({
      where: { id },
      data
    });
  }

  async deleteReview(id) {
    return await prisma.review.delete({
      where: { id }
    });
  }

  // === СТАТИСТИКА ===
  async getStats() {
    const [
      totalProducts,
      totalCategories,
      totalChats,
      totalReviews,
      totalMessages,
      recentProducts,
      recentChats
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.chat.count(),
      prisma.review.count(),
      prisma.message.count(),
      prisma.product.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 дней назад
          }
        }
      }),
      prisma.chat.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 дней назад
          }
        }
      })
    ]);

    return {
      totals: {
        products: totalProducts,
        categories: totalCategories,
        chats: totalChats,
        reviews: totalReviews,
        messages: totalMessages
      },
      recent: {
        products: recentProducts,
        chats: recentChats
      }
    };
  }
}

module.exports = new AdminService();