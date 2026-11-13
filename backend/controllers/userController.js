const User = require('../models/User');

async function getUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load users.', error: error.message });
  }
}

module.exports = { getUsers };
