const orderService = require("../services/orderService.js");

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.json({ success: true, orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Замовлення не знайдено' });
      }

      res.json({ success: true, order });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      await orderService.deleteOrder(id);
      res.json({ success: true, message: 'Замовлення видалено' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
