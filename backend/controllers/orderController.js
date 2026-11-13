const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Payment = require('../models/Payment');

async function getOrders(req, res) {
  try {
    const query = req.user.role === 'customer' ? { customer: req.user.id } : {};

    const orders = await Order.find(query).populate('customer', 'name email').populate('table').sort({ createdAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const items = await OrderItem.find({ order: { $in: orderIds } }).populate('menuItem');

    const itemMap = items.reduce((acc, item) => {
      const list = acc[item.order.toString()] || [];
      list.push(item);
      acc[item.order.toString()] = list;
      return acc;
    }, {});

    const enriched = orders.map((order) => ({
      ...order.toObject(),
      items: itemMap[order._id.toString()] || [],
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load orders.', error: error.message });
  }
}

async function createOrder(req, res) {
  try {
    const { items, tableId, notes, customerId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one menu item is required.' });
    }

    const menuItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItemId);
        return { menuItem, quantity: item.quantity, specialInstructions: item.specialInstructions || '' };
      })
    );

    const validItems = menuItems.filter((entry) => entry.menuItem);
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'No valid menu items were selected.' });
    }

    const subtotal = validItems.reduce((sum, entry) => sum + entry.menuItem.price * entry.quantity, 0);
    const gst = subtotal * 0.08;
    const serviceCharge = subtotal * 0.1;
    const discount = 0;
    const total = subtotal + gst + serviceCharge - discount;

    const customer = customerId || req.user.id;
    const order = await Order.create({
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      customer,
      table: tableId || null,
      notes: notes || '',
      subtotal,
      gst,
      serviceCharge,
      discount,
      total,
      status: 'order received',
    });

    const orderItems = await Promise.all(
      validItems.map(async (entry) => {
        const orderItem = await OrderItem.create({
          order: order._id,
          menuItem: entry.menuItem._id,
          quantity: entry.quantity,
          unitPrice: entry.menuItem.price,
          specialInstructions: entry.specialInstructions,
        });

        return { ...orderItem.toObject(), menuItem: entry.menuItem };
      })
    );

    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
    }

    await Payment.create({
      order: order._id,
      customer,
      amount: total,
      method: 'card',
      status: 'pending',
    });

    const payload = {
      ...order.toObject(),
      items: orderItems,
    };

    req.io.emit('order:updated', { order: payload, message: 'A new order has been submitted.' });
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed.', error: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    req.io.emit('order:updated', { order, message: `Order ${order.orderNumber} is now ${status}.` });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status.', error: error.message });
  }
}

module.exports = { getOrders, createOrder, updateOrderStatus };
