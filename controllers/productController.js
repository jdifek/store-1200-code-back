const productService = require('../services/productService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
      // Разбираем фильтры из query
      const filters = {};
      if (req.query['filters[categoryId]']) filters.categoryId = req.query['filters[categoryId]'];
      if (req.query['filters[search]']) filters.search = req.query['filters[search]'];
      if (req.query['filters[minPrice]']) filters.minPrice = parseFloat(req.query['filters[minPrice]']);
      if (req.query['filters[maxPrice]']) filters.maxPrice = parseFloat(req.query['filters[maxPrice]']);
  
      const result = await productService.getAllProducts({
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        sortBy,
        sortOrder
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
      const product = await productService.getProductById(id);
      
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

  async searchProducts(req, res, next) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Пошуковий запит обов\'язковий'
        });
      }
      
      const result = await productService.searchProducts(
        q, 
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

  async getSimilarProducts(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 4 } = req.query;
      
      const products = await productService.getSimilarProducts(id, parseInt(limit));
      
      res.json({
        success: true,
        products
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();