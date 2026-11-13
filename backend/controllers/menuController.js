const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load categories.', error: error.message });
  }
}

async function getMenu(req, res) {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const items = await MenuItem.find(query).populate('category').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load menu items.', error: error.message });
  }
}

async function createMenuItem(req, res) {
  try {
    const { name, description, price, category, image, prepTime, available } = req.body;

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      image,
      prepTime,
      available: available !== false,
    });

    const populatedItem = await item.populate('category');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item.', error: error.message });
  }
}

async function updateMenuItem(req, res) {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item.', error: error.message });
  }
}

async function deleteMenuItem(req, res) {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item.', error: error.message });
  }
}

module.exports = { getCategories, getMenu, createMenuItem, updateMenuItem, deleteMenuItem };
