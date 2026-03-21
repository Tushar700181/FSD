const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/complaints - Create a new complaint
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, category, description, studentId, studentName, requesterRole, assignedTo, images } = req.body;
        
        // Ownership check: Student can only create for themselves
        if (req.user.role !== 'admin' && studentId !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only submit complaints for yourself.' });
        }

        const complaintsCollection = collections.complaints();

        // Generate a custom ID: CMP-1001 base
        const count = await complaintsCollection.countDocuments();
        const customId = `CMP-${1001 + count}`;

        const newComplaint = {
            id: customId,
            studentId: new ObjectId(studentId),
            studentName,
            requesterRole,
            title,
            category,
            description,
            assignedTo,
            images: images || [],
            status: 'Pending',
            adminResponse: '',
            timestamp: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await complaintsCollection.insertOne(newComplaint);
        res.status(201).json({ success: true, complaint: newComplaint });

    } catch (err) {
        console.error('Create complaint error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/complaints/student/:studentId - Get all complaints for a student
router.get('/student/:studentId', authenticate, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        
        // Personal data isolation
        if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Forbidden: Access to other users complaints is denied.' });
        }

        const complaintsCollection = collections.complaints();
        const complaints = await complaintsCollection
            .find({ studentId: new ObjectId(studentId) })
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, complaints });
    } catch (err) {
        console.error('Get student complaints error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/complaints/dept/:dept - Get all complaints for a department (for Admins)
router.get('/dept/:dept', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { dept } = req.params;

        // Department matching check
        if (req.user.department !== dept && req.user.department !== 'Academic') {
            return res.status(403).json({ success: false, message: `Forbidden: You are not authorized to view ${dept} complaints.` });
        }

        const complaintsCollection = collections.complaints();
        const complaints = await complaintsCollection
            .find({ assignedTo: dept })
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, complaints });
    } catch (err) {
        console.error('Get department complaints error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/complaints/:id - Update complaint status/response (Admin Only)
router.patch('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaintsCollection = collections.complaints();

        // Security check: Verify the complaint belongs to the admin's department
        const complaint = await complaintsCollection.findOne({ id: req.params.id });
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        if (req.user.department !== complaint.assignedTo && req.user.department !== 'Academic') {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update complaints assigned to your department.' });
        }

        const update = { $set: { updatedAt: new Date() } };
        if (status) update.$set.status = status;
        if (adminResponse !== undefined) update.$set.adminResponse = adminResponse;

        const result = await complaintsCollection.findOneAndUpdate(
            { id: req.params.id },
            update,
            { returnDocument: 'after' }
        );

        if (!result.value && !result) {
            // MongoDB driver versions differ in findOneAndUpdate return
            const updatedDoc = await complaintsCollection.findOne({ id: req.params.id });
            if (!updatedDoc) {
                return res.status(404).json({ success: false, message: 'Complaint not found' });
            }
            return res.json({ success: true, complaint: updatedDoc });
        }

        res.json({ success: true, complaint: result.value || result });
    } catch (err) {
        console.error('Update complaint error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
