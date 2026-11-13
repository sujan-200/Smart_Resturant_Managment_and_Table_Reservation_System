const express = require('express');
const { register, login, supabaseRegister, supabaseLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/supabase-register', supabaseRegister);
router.post('/supabase-login', supabaseLogin);
router.get('/me', protect, getMe);

module.exports = router;
