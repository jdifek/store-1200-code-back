const categoryService = require('../services/categoryService');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({
        success: true,
        categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Категорію не знайдено'
        });
      }
      
      res.json({
        success: true,
        category
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryProducts(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const result = await categoryService.getCategoryProducts(
        id, 
        {
          page: parseInt(page),
          limit: parseInt(limit),
          sortBy,
          sortOrder
        }
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubcategories(req, res, next) {
    try {
      const { id } = req.params;
      const subcategories = await categoryService.getSubcategories(id);
      
      res.json({
        success: true,
        subcategories
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();