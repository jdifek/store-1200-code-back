const productService = require('../services/productService');

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        search,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const filters = {};
      if (categoryId) filters.categoryId = categoryId;
      if (search) filters.search = search;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
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