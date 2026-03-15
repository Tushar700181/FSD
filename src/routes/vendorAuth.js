const express = require('express');
const router = express.Router();
const { collections } = require('../db');
const { hashPassword, comparePassword } = require('../utils/authUtils');

// POST /api/vendor/signup
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, vendorKey, cafeName } = req.body;

        if (vendorKey !== process.env.VENDOR_SIGNUP_KEY) {
            return res.status(401).json({ success: false, message: 'Invalid Vendor Verification Key' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const usersCollection = collections.users();
        const existingUser = await usersCollection.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        const hashedPassword = await hashPassword(password);

        const newVendor = {
            fullName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'cafe',
            cafeName: (cafeName || '').trim(), // Store cleaned name
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await usersCollection.insertOne(newVendor);

        res.status(201).json({ success: true, message: 'Vendor account created successfully!' });

    } catch (err) {
        console.error('Vendor signup error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// POST /api/vendor/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usersCollection = collections.users();

        const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.role !== 'cafe') {
            return res.status(401).json({ success: false, message: 'Invalid email, password, or role' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
            success: true,
            message: 'Vendor login successful!',
            redirectUrl: '/cafe/hotel_view.html',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                cafeName: user.cafeName
            }
        });

    } catch (err) {
        console.error('Vendor login error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

module.exports = router;
