const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/leaves - Submit a new leave application
router.post('/', authenticate, async (req, res) => {
    try {
        const leaveData = req.body;
        const leavesCollection = collections.leaves();
        
        // Ensure studentId in body matches the authenticated user (unless admin)
        if (req.user.role !== 'admin' && leaveData.userId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only submit leaves for yourself.' });
        }
        
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
router.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Personal data isolation: Only owner or admin can see history
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access to other users leave history is denied.' });
        }

        const leavesCollection = collections.leaves();
        const history = await leavesCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, history });
    } catch (err) {
        console.error('Fetch leave history error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching history' });
    }
});

// GET /api/leaves/admin/all - Get all leave applications (Hostel, Academic, Mess View)
router.get('/admin/all', authenticate, authorize(['admin'], ['Hostel', 'Academic', 'Mess']), async (req, res) => {
    try {
        const leavesCollection = collections.leaves();
        const allLeaves = await leavesCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ success: true, leaves: allLeaves });
    } catch (err) {
        console.error('Fetch all leaves error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching all leaves' });
    }
});

// PATCH /api/leaves/:id/status - Update leave status (Hostel Admin)
router.patch('/:id/status', authenticate, authorize(['admin'], ['Hostel']), async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
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

// PATCH /api/leaves/:id/return - Record actual return (Student Owner)
router.patch('/:id/return', authenticate, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
        
        const leavesCollection = collections.leaves();
        const leave = await leavesCollection.findOne({ _id: new ObjectId(req.params.id) });
        
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
        
        // Ownership check
        if (req.user.role !== 'admin' && leave.userId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only record return for your own leaves.' });
        }

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
