const bcrypt = require('bcryptjs');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const User = require('../models/User');

async function seedDatabase() {
  const restaurant = await Restaurant.findOne();
  if (!restaurant) {
    await Restaurant.create({
      name: 'Cinder & Cedar',
      tagline: 'Modern dining with a warm local touch',
      location: 'Downtown Avenue, Kathmandu',
      description: 'A premium restaurant blending modern dining with traditional flavours.',
      phone: '+977-9800000000',
      email: 'hello@cinderandcedar.com',
      rating: 4.8,
      cuisine: 'Contemporary Fusion',
    });
  }

  const categoryNames = ['Starters', 'Main Course', 'Indian Cuisine', 'Chinese Cuisine', 'Beverages', 'Desserts'];
  const categoryMap = {};

  for (const categoryName of categoryNames) {
    const existing = await Category.findOne({ name: categoryName });
    if (!existing) {
      const category = await Category.create({
        name: categoryName,
        description: `${categoryName} selections`,
      });
      categoryMap[categoryName] = category._id;
    } else {
      categoryMap[categoryName] = existing._id;
    }
  }

  const itemSeed = [
    { name: 'Crispy Chili Corn', description: 'Sweet corn tossed with chili glaze and crunchy shallots.', price: 320, category: 'Starters', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80', prepTime: 12 },
    { name: 'Paneer Tikka', description: 'Char-grilled cottage cheese with smoky spices and mint chutney.', price: 420, category: 'Indian Cuisine', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80', prepTime: 15 },
    { name: 'Herb Chicken Supreme', description: 'Roasted chicken breast with herb butter and seasonal vegetables.', price: 680, category: 'Main Course', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80', prepTime: 20 },
    { name: 'Veg Hakka Noodles', description: 'Wok tossed noodles with peppers, vegetables, and soy sesame seasoning.', price: 390, category: 'Chinese Cuisine', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80', prepTime: 18 },
    { name: 'Mango Mojito', description: 'Fresh lime, mint, soda, and ripe mango blended to perfection.', price: 240, category: 'Beverages', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80', prepTime: 7 },
    { name: 'Chocolate Lava Cake', description: 'Warm dark chocolate center with vanilla bean cream.', price: 280, category: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80', prepTime: 10 },
  ];

  if ((await MenuItem.countDocuments()) === 0) {
    await Promise.all(
      itemSeed.map((item) =>
        MenuItem.create({
          ...item,
          category: categoryMap[item.category],
          available: true,
          featured: item.name === 'Chocolate Lava Cake',
        })
      )
    );
  }

  if ((await Table.countDocuments()) === 0) {
    const tableSeed = [
      { tableNumber: 1, capacity: 2, location: 'Window View', status: 'available' },
      { tableNumber: 2, capacity: 2, location: 'Window View', status: 'available' },
      { tableNumber: 3, capacity: 4, location: 'Main Hall', status: 'reserved' },
      { tableNumber: 4, capacity: 4, location: 'Main Hall', status: 'available' },
      { tableNumber: 5, capacity: 6, location: 'Garden Side', status: 'occupied' },
      { tableNumber: 6, capacity: 6, location: 'Garden Side', status: 'available' },
      { tableNumber: 7, capacity: 8, location: 'Private Dining', status: 'cleaning' },
      { tableNumber: 8, capacity: 8, location: 'Private Dining', status: 'available' },
    ];

    await Table.insertMany(tableSeed.map((table) => ({ ...table, qrCode: `table-${table.tableNumber}` })));
  }

  const users = [
    { name: 'Admin Manager', email: 'admin@restaurant.com', password: 'Admin@123', role: 'admin' },
    { name: 'Waiter Sam', email: 'waiter@restaurant.com', password: 'Waiter@123', role: 'waiter' },
    { name: 'Kitchen Lead', email: 'kitchen@restaurant.com', password: 'Kitchen@123', role: 'kitchen' },
    { name: 'Customer User', email: 'customer@restaurant.com', password: 'Customer@123', role: 'customer' },
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (!existingUser) {
      await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
        password: await bcrypt.hash(userData.password, 10),
        phone: '+9779800000000',
      });
    }
  }
}

module.exports = { seedDatabase };
