const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult, checkSchema } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.signup = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = cloudinary.uploader.upload_stream(
            { resource_type: 'raw' },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ msg: 'Resume upload failed' });
                }

                user = new User({
                    name,
                    email,
                    password: hashedPassword,
                    resumeUrl: result.secure_url,
                });

                await user.save();
                return res.status(200).json({msg : "Success"});
            }
        );

        if (req.file) {
            result.end(req.file.buffer);
        } else {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
};


exports.signupValidation = checkSchema({
    name: {
        in: ["body"],
        exists: { errorMessage: "Name must be present" },
        isString: true,
    },
    email: {
        in: ["body"],
        exists: { errorMessage: "Email must be present" },
        notEmpty: {
            errorMessage: "Email can't be empty",
        },
        isEmail: true,
    },
    password: {
        in: ["body"],
        exists: { errorMessage: "Password must be present" },
        notEmpty: {
            errorMessage: "Password can't be empty",
        },
        isString: true,
    },
});

exports.login = async (req, res) => {
    console.log("body", req.body);
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Password' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                return res.status(200).json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.loginValidation = checkSchema({
    email: {
        in: ["body"],
        exists: { errorMessage: "Email must be present" },
        notEmpty: {
            errorMessage: "Email can't be empty",
        },
        isEmail: true,
    },
    password: {
        in: ["body"],
        exists: { errorMessage: "Password must be present" },
        notEmpty: {
            errorMessage: "Password can't be empty",
        },
        isString: true,
    },
});

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
