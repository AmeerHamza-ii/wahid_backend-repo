const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tradeperson = require('../models/Tradeperson');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation rules
const validateRegister = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Invalid email format.'),
    body('businessName').notEmpty().withMessage('Business Name is required.'),
    body('contactNumber').notEmpty().withMessage('Contact Number is required.'),
    body('trade').notEmpty().withMessage('Trade is required.'),
    body('street').notEmpty().withMessage('Street is required.'),
    body('city').notEmpty().withMessage('City is required.'),
    body('postcode').notEmpty().withMessage('Postcode is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match.'),
];

// Register a tradeperson
router.post('/register', validateRegister, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        name,
        email,
        businessName,
        contactNumber,
        trade,
        street,
        city,
        postcode,
        password,
    } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new tradeperson
        const tradeperson = new Tradeperson({
            name,
            email,
            businessName,
            contactNumber,
            trade,
            address: { street, city, postcode },
            password: hashedPassword,
        });

        // Save to the database
        await tradeperson.save();

        res.status(201).json({ message: 'Tradeperson registered successfully.' });
    } catch (err) {
        console.error('Error registering tradeperson:', err.message);
        res.status(500).json({ error: 'Failed to register tradeperson.' });
    }
});

// Login a tradeperson
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the tradeperson by email
        const tradeperson = await Tradeperson.findOne({ email });
        if (!tradeperson) {
            return res.status(404).json({ error: 'Tradeperson not found.' });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, tradeperson.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: tradeperson._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ token });
    } catch (err) {
        console.error('Error logging in tradeperson:', err.message);
        res.status(500).json({ error: 'Failed to login.' });
    }
});

module.exports = router;
