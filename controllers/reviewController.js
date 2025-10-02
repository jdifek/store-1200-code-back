const reviewService = require('../services/reviewService');

class ReviewController {
  async getAllReviews(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const result = await reviewService.getAllReviews(
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
      
      const review = await reviewService.createReview({
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

  async getReviewById(req, res, next) {
    try {
      const { id } = req.params;
      const review = await reviewService.getReviewById(id);
      
      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Відгук не знайдено'
        });
      }
      
      res.json({
        success: true,
        review
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
