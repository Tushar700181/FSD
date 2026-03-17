const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');

// POST /api/leaves - Submit a new leave application
router.post('/', async (req, res) => {
    try {
        const leaveData = req.body;
        const leavesCollection = collections.leaves();
        
        const newLeave = {
            ...leaveData,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await leavesCollection.insertOne(newLeave);
        res.status(201).json({ success: true, message: 'Leave application submitted!', id: result.insertedId });
    } catch (err) {
        console.error('Leave submission error:', err);
        res.status(500).json({ success: false, message: 'Server error submitting leave' });
    }
});

// GET /api/leaves/user/:userId - Get leave history for a specific student
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const leavesCollection = collections.leaves();
        
        const history = await leavesCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, history });
    } catch (err) {
        console.error('Fetch leave history error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching history' });
    }
});

// GET /api/leaves/admin/all - Get all leave applications (Admin)
router.get('/admin/all', async (req, res) => {
    try {
        const leavesCollection = collections.leaves();
        const allLeaves = await leavesCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, leaves: allLeaves });
    } catch (err) {
        console.error('Fetch all leaves error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching all leaves' });
    }
});

// PATCH /api/leaves/:id/status - Update leave status (Admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leavesCollection = collections.leaves();
        
        const result = await leavesCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    status, 
                    adminComment, 
                    updatedAt: new Date() 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Leave application not found' });
        }

        res.json({ success: true, message: `Application ${status.toLowerCase()} successfully` });
    } catch (err) {
        console.error('Update leave status error:', err);
        res.status(500).json({ success: false, message: 'Server error updating leave status' });
    }
});

// PATCH /api/leaves/:id/return - Record actual return (Student)
router.patch('/:id/return', async (req, res) => {
    try {
        const leavesCollection = collections.leaves();
        
        const result = await leavesCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: { 
                    status: 'Returned', 
                    actualReturnDate: new Date(),
                    updatedAt: new Date() 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Leave application not found' });
        }

        res.json({ success: true, message: 'Return recorded successfully' });
    } catch (err) {
        console.error('Record return error:', err);
        res.status(500).json({ success: false, message: 'Server error recording return' });
    }
});

module.exports = router;
