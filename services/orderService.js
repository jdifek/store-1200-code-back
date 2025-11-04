const prisma = require('../lib/prisma');

class OrderService {
  // Создание нового заказа
  async createOrder(data) {
    const { name, phoneNumber, products } = data;

    // если заказ может содержать несколько товаров
    return await prisma.order.create({
      data: {
        name,
        phoneNumber,
        products: {
          create: products.map(p => ({
            product: { connect: { id: p.id } },
            quantity: p.quantity || 1
          }))
        }
      },
      include: {
        products: {
          include: { product: true }
        }
      }
    });
  }

  // Получить все заказы
  async getAllOrders() {
    return await prisma.order.findMany({
      include: {
        products: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Получить заказ по ID
  async getOrderById(id) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: true }
        }
      }
    });
  }

  // Удалить заказ
  async deleteOrder(id) {
    return await prisma.order.delete({
      where: { id }
    });
  }
}

module.exports = new OrderService();
