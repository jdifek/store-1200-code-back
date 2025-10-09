const adminService = require('../services/adminService');
const supabase = require('../lib/supabase');

class AdminController {
  // === АУТЕНТИФИКАЦИЯ ===
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Електронна пошта та пароль обов\'язкові' 
        });
      }

      const result = await adminService.login(email, password);
      res.json({
        success: true,
        message: 'Успішно авторизовано',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // === КАТЕГОРИИ ===
  async getAllCategories(req, res, next) {
    try {
      const categories = await adminService.getAllCategories();
      res.json({
        success: true,
        categories
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name, parentId } = req.body;
      const category = await adminService.createCategory({ name, parentId });
      
      res.status(201).json({
        success: true,
        message: 'Категорію створено',
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, parentId } = req.body;
      
      const category = await adminService.updateCategory(id, { name, parentId });
      res.json({
        success: true,
        message: 'Категорію оновлено',
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteCategory(id);
      
      res.json({
        success: true,
        message: 'Категорію видалено'
      });
    } catch (error) {
      next(error);
    }
  }

  // === ТОВАРЫ ===
  async getAllProducts(req, res, next) {
    try {
      const { page = 1, limit = 20, categoryId, search } = req.query;
      const result = await adminService.getAllProducts({
        page: parseInt(page),
        limit: parseInt(limit),
        categoryId,
        search
      });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await adminService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Товар не знайдено'
        });
      }
      
      res.json({
        success: true,
        product
      });
    } catch (error) {
      next(error);
    }
  }
  async createProduct(req, res, next) {
    try {
      // multer уже распарсил multipart/form-data
      const files = req.files || [];
      const body = req.body;
  
      // multer всё приводит к строкам, поэтому числа нужно парсить
      const productData = {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price) || 0,
        categoryId: body.categoryId ? body.categoryId : null,
      };
  
      const product = await adminService.createProduct(productData, files);
  
      res.status(201).json({
        success: true,
        message: 'Товар успішно створено',
        product,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const files = req.files || [];
      const body = req.body;
  
      const productData = {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price) || 0,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        stock: body.stock ? parseInt(body.stock) : 0,
      };
  
      const product = await adminService.updateProduct(id, productData, files);
  
      res.json({
        success: true,
        message: 'Товар успішно оновлено',
        product,
      });
    } catch (error) {
      next(error);
    }
  }
  

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Товар видалено'
      });
    } catch (error) {
      next(error);
    }
  }

  // === ЧАТЫ ===
  async getAllChats(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getAllChats(
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

  async getChatById(req, res, next) {
    try {
      const { id } = req.params;
      const chat = await adminService.getChatById(id);
      
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

  async getChatMessages(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const result = await adminService.getChatMessages(
        id,
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

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const message = await adminService.sendMessage(id, content, true);
      
      // Отправить через WebSocket всем в чате
      req.io.to(id).emit('new-message', message);
      
      res.status(201).json({
        success: true,
        message: 'Повідомлення відправлено',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  // === ОТЗЫВЫ ===
  async getAllReviews(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getAllReviews(
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

  async createReview(req, res, next) {
    try {
      const { content, rating, avatar, author } = req.body;
      const review = await adminService.createReview({
        content,
        rating: parseInt(rating),
        avatar,
        author
      });
      
      res.status(201).json({
        success: true,
        message: 'Відгук створено',
        review
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {};
      
      const { content, rating, avatar, author } = req.body;
      
      if (content !== undefined) updateData.content = content;
      if (rating !== undefined) updateData.rating = parseInt(rating);
      if (avatar !== undefined) updateData.avatar = avatar;
      if (author !== undefined) updateData.author = author;

      const review = await adminService.updateReview(id, updateData);
      res.json({
        success: true,
        message: 'Відгук оновлено',
        review
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteReview(id);
      
      res.json({
        success: true,
        message: 'Відгук видалено'
      });
    } catch (error) {
      next(error);
    }
  }

  // === СТАТИСТИКА ===
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();