const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');

// POST /api/complaints - Create a new complaint
router.post('/', async (req, res) => {
    try {
        const { title, category, description, studentId, studentName, requesterRole, assignedTo, images } = req.body;
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
router.get('/student/:studentId', async (req, res) => {
    try {
        const complaintsCollection = collections.complaints();
        const complaints = await complaintsCollection
            .find({ studentId: new ObjectId(req.params.studentId) })
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, complaints });
    } catch (err) {
        console.error('Get student complaints error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/complaints/dept/:dept - Get all complaints for a department (for Admins)
router.get('/dept/:dept', async (req, res) => {
    try {
        const complaintsCollection = collections.complaints();
        const complaints = await complaintsCollection
            .find({ assignedTo: req.params.dept })
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, complaints });
    } catch (err) {
        console.error('Get department complaints error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PATCH /api/complaints/:id - Update complaint status/response
router.patch('/:id', async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaintsCollection = collections.complaints();

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
