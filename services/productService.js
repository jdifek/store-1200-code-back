const prisma = require('../lib/prisma');

class ProductService {
  async getAllProducts({ page, limit, filters = {}, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (page - 1) * limit;
    const where = {};

    // Применяем фильтры
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true, // ✅ Добавляем изображения
        },
        // skip,
        // take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        // page,
        // limit,
        total,
        // pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: { include: { parent: true } },
        images: true, // ✅ Добавляем изображения
      },
    });
  }
  async getRandomProducts(limit = 3) {
    const products = await prisma.product.findMany({
      include: { category: true, images: true },
      orderBy: { createdAt: 'desc' }, // нужно для Prisma, потом рандомизируем в JS
    });

    // Перемешиваем массив случайным образом
    const shuffled = products.sort(() => 0.5 - Math.random());

    // Берём первые `limit` элементов
    return shuffled.slice(0, limit);
  }

  async getProductsFromCart(ids) {
    const products = await prisma.product.findMany({
      include: { images: true },
      where: { id: { in: ids } }
    })
    return products
  }


  async searchProducts(query, page, limit) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

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

  async getSimilarProducts(productId, limit) {
    // Получаем товар для определения его категории
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true }
    });

    if (!product) return [];

    return await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: productId }
      },
      include: { category: true },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new ProductService();
