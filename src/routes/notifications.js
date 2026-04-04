const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');

// GET /api/notifications - Aggregate status alerts for the logged-in user
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const notifications = [];

        // 1. Get Resolved Complaints
        const complaints = await collections.complaints().find({
            userId: userId,
            status: 'Resolved',
            updatedAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }).toArray();
        
        complaints.forEach(c => {
            notifications.push({
                id: c._id,
                type: 'complaint',
                title: 'Complaint Resolved',
                message: `Your complaint "${c.title}" has been resolved.`,
                timestamp: c.updatedAt || c.timestamp
            });
        });

        // 2. Get Ready/Delivered Cafe Orders
        const orders = await collections.orders().find({
            userId: userId,
            status: { $in: ['Ready', 'Delivered'] },
            createdAt: { $gt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } // Last 2 days
        }).sort({ createdAt: -1 }).toArray();

        orders.forEach(o => {
            notifications.push({
                id: o._id,
                type: 'cafe',
                title: 'Cafe Order Update',
                message: `Your order #${o._id.toString().slice(-4)} is ${o.status.toLowerCase()}.`,
                timestamp: o.updatedAt || o.createdAt
            });
        });

        // 3. Get Upcoming Placement Drives (Global)
        const placements = await collections.placements().find({
            date: { $gte: new Date().toISOString().split('T')[0] }
        }).sort({ date: 1 }).limit(2).toArray();

        placements.forEach(p => {
            notifications.push({
                id: p._id,
                type: 'placement',
                title: 'Upcoming Drive',
                message: `Placement drive by ${p.company} is scheduled for ${p.date}.`,
                timestamp: new Date() // Current context
            });
        });

        // Sort all by timestamp descending
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ success: true, notifications });
    } catch (err) {
        console.error('Notifications fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
