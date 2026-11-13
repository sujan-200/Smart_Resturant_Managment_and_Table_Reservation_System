const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'restaurant-secret',
    { expiresIn: '7d' }
  );
}

function normalizeUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

async function findOrCreateSupabaseUser({ email, name, phone, role }) {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const generatedPassword = `${normalizedEmail}-${Date.now()}`;
    user = await User.create({
      name: name || email.split('@')[0],
      email: normalizedEmail,
      password: await bcrypt.hash(generatedPassword, 10),
      phone: phone || '',
      role: role || 'customer',
    });
  } else {
    if (name && user.name !== name) {
      user.name = name;
    }
    if (phone) {
      user.phone = phone;
    }
    if (role && user.role !== role) {
      user.role = role;
    }
    await user.save();
  }

  return user;
}

async function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user.', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
}

async function supabaseRegister(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const user = await findOrCreateSupabaseUser({ email, name, phone, role });
    const token = generateToken(user);

    if (password) {
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    res.status(201).json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync Supabase registration.', error: error.message });
  }
}

async function supabaseLogin(req, res) {
  try {
    const { email, name, phone, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await findOrCreateSupabaseUser({ email, name, phone, role });
    const token = generateToken(user);

    res.json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync Supabase login.', error: error.message });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load profile.', error: error.message });
  }
}

module.exports = { register, login, supabaseRegister, supabaseLogin, getMe };
