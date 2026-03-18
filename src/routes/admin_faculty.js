const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');

// ─── GET /api/admin/timetable/:facultyId ─────────────────────────────────────
// Full timetable for a faculty (no masking, admin sees everything)
router.get('/timetable/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        const slots = await collections.timetable_slots().find({
            facultyId: new ObjectId(facultyId)
        }).toArray();

        const enriched = slots.map(s => ({
            ...s,
            room: s.room || s.classroomId || '' // fallback for legacy data
        }));

        const periods = await collections.period_schedule().find({}).sort({ start_time: 1 }).toArray();

        res.json({ success: true, slots: enriched, periods });
    } catch (err) {
        console.error('Admin timetable fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ─── POST /api/admin/timetable/update ────────────────────────────────────────
// Diff-based update: added, removed, updated arrays
router.post('/timetable/update', async (req, res) => {
    try {
        const { facultyId, added = [], removed = [], updated = [] } = req.body;

        if (!facultyId) {
            return res.status(400).json({ success: false, message: 'facultyId is required' });
        }

        const ops = [];

        // Process removals
        for (const slot of removed) {
            ops.push(
                collections.timetable_slots().deleteOne({
                    facultyId: new ObjectId(facultyId),
                    day: slot.day,
                    period: slot.period
                })
            );
        }

        // Process additions
        for (const slot of added) {
            const doc = {
                facultyId: new ObjectId(facultyId),
                day: slot.day,
                period: slot.period,
                label: slot.label || '',
                type: slot.type || 'class',
                room: slot.room || '',
                updatedAt: new Date()
            };
            ops.push(collections.timetable_slots().updateOne(
                { facultyId: new ObjectId(facultyId), day: slot.day, period: slot.period },
                { $set: doc },
                { upsert: true }
            ));
        }

        // Process updates (same as add — upsert)
        for (const slot of updated) {
            ops.push(collections.timetable_slots().updateOne(
                { facultyId: new ObjectId(facultyId), day: slot.day, period: slot.period },
                {
                    $set: {
                        label: slot.label || '',
                        type: slot.type || 'class',
                        room: slot.room || '',
                        updatedAt: new Date()
                    }
                }
            ));
        }

        await Promise.all(ops);

        res.json({
            success: true,
            message: `Timetable updated: ${added.length} added, ${removed.length} removed, ${updated.length} updated`
        });
    } catch (err) {
        console.error('Admin timetable update error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

module.exports = router;
