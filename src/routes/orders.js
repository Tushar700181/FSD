const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');

// POST /api/orders (Student places order)
router.post('/', async (req, res) => {
    try {
        const { studentId, studentName, items, total, cafeName, paymentMethod, phone, location } = req.body;
        const ordersCollection = collections.orders();

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Missing student ID' });
        }

        let studentObjectId;
        try {
            studentObjectId = new ObjectId(studentId);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid student ID format' });
        }

        const newOrder = {
            studentId: studentObjectId,
            studentName,
            items, // Array of { name, qty, price }
            total: Number(total),
            cafeName,
            status: 'Pending',
            paymentMethod,
            phone,
            location,
            createdAt: new Date()
        };

        const result = await ordersCollection.insertOne(newOrder);
        res.status(201).json({ success: true, orderId: result.insertedId });
    } catch (err) {
        console.error('Place order error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
});

// GET /api/orders/my/:studentId
router.get('/my/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const ordersCollection = collections.orders();

        // Find orders where studentId is either the ObjectId or the string version
        // This handles cases where data might be inconsistent
        let query = {
            $or: [
                { studentId: studentId }
            ]
        };

        try {
            query.$or.push({ studentId: new ObjectId(studentId) });
        } catch (e) {
            // Not a valid ObjectId string, just skip that part of query
        }

        const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Fetch student orders error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// GET /api/orders/vendor/:cafeName
router.get('/vendor/:cafeName', async (req, res) => {
    try {
        const ordersCollection = collections.orders();
        const orders = await ordersCollection.find({ cafeName: req.params.cafeName }).sort({ createdAt: 1 }).toArray();
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Fetch vendor orders error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const ordersCollection = collections.orders();

        await ordersCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date() } }
        );

        res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (err) {
        console.error('Update order status error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
});

module.exports = router;
