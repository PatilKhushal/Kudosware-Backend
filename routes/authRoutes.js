const express = require('express');
const { checkSchema } = require('express-validator');
const { signup, login, getProfile, signupValidation, loginValidation } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Signup route with multer middleware
router.post(
    '/signup',
    upload.single('resume'), // This handles the multipart/form-data
    signupValidation,
    signup
);

router.post('/login', loginValidation, login);

router.get('/profile', authMiddleware, getProfile);

module.exports = router;
