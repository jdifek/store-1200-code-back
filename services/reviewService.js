const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewService {
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

  async getReviewById(id) {
    return await prisma.review.findUnique({
      where: { id }
    });
  }
}

module.exports = new ReviewService();