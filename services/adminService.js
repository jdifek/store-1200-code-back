const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const path = require('path');
const supabase = require('../lib/supabase');
const prisma = require('../lib/prisma');


class AdminService {
  async login(email, password) {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new Error('Адміністратора не знайдено');
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      throw new Error('Невірний пароль');
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    };
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
        include: { category: true ,   images: true,},
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
          include: { parent: true,   images: true, }
        }
      }
    });
  }
  async createProduct(data, files) {
    const imageUrls = [];

    // Загружаем изображения в Supabase
    for (const file of files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw new Error('Ошибка загрузки изображения');

      // Получаем публичный URL
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      imageUrls.push(publicData.publicUrl);
    }

    // Сохраняем товар в базе
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: { connect: { id: data.categoryId } }, // привязка по UUID
        images: { createMany: { data: imageUrls.map(url => ({ url })) } },
      },
      include: { images: true },
    });

    return product;
  }

  async updateProduct(id, data, files) {
    let imageUrls = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw new Error('Ошибка загрузки изображения');

        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrls.push(publicData.publicUrl);
      }
    }

    // Обновляем товар
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: { connect: { id: data.categoryId } },
        ...(imageUrls.length > 0
          ? { images: { createMany: { data: imageUrls.map(url => ({ url })) } } }
          : {}),
      },
      include: { images: true },
    });

    return updated;
  }
  async deleteProduct(id) {
    // Удаляем все изображения продукта
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });
  
    // Потом удаляем сам продукт
    return await prisma.product.delete({
      where: { id },
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