const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CategoryService {
  async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        children: {
          include: {
            children: true,
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      },
      where: { parentId: null },
      orderBy: { name: 'asc' }
    });
  }

  async getCategoryById(id) {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { products: true } }
          }
        },
        _count: { select: { products: true } }
      }
    });
  }

  async getCategoryProducts(categoryId, options) {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId },
        include: { category: true },
        skip,
        take: limit,
        orderBy
      }),
      prisma.product.count({ where: { categoryId } })
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

  async getSubcategories(parentId) {
    return await prisma.category.findMany({
      where: { parentId },
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
  }
}

module.exports = new CategoryService();