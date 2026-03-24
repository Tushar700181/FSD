const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');

const { authenticate, authorize } = require('../middleware/auth');

// ─── Middleware for this entire router ────────────────────────────────────────
router.use(authenticate);
router.use(authorize(['admin'], ['Academic']));

// ─── GET /api/admin/timetable/:facultyId ─────────────────────────────────────
// Full timetable for a faculty (no masking, admin sees everything)
router.get('/timetable/:facultyId', async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
        const { facultyId } = req.params;
        if (!ObjectId.isValid(facultyId)) {
            return res.status(400).json({ success: false, message: 'Invalid Faculty ID' });
        }

        const slots = await collections.timetable().find({
            facultyId: new ObjectId(facultyId)
        }).toArray();

        const periods = await collections.period_schedule().find({}).sort({ start_time: 1 }).toArray();

        res.json({ success: true, slots, periods });
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

        if (!facultyId || !ObjectId.isValid(facultyId)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing facultyId' });
        }

        const ops = [];
        
        // ─── Conflict Detection ─────────────────────────────────────────────
        const toCheck = [...added, ...updated];
        for (const slot of toCheck) {
            if (!slot.location && !slot.subject) continue;

            const query = {
                facultyId: { $ne: new ObjectId(facultyId) },
                day: slot.day,
                period: slot.period,
                $or: []
            };
            if (slot.location) query.$or.push({ location: slot.location });
            // For subject/batch conflicts, check if same subject is in same room/period
            if (slot.subject) query.$or.push({ subject: slot.subject });

            if (query.$or.length > 0) {
                const conflict = await collections.timetable().findOne(query);
                if (conflict) {
                    const otherFaculty = await collections.users().findOne({ _id: conflict.facultyId });
                    const reason = (conflict.location === slot.location && slot.location) ? `Location ${slot.location}` : `Subject ${slot.subject}`;
                    return res.status(400).json({
                        success: false,
                        message: `Conflict: ${reason} is already occupied by ${otherFaculty ? otherFaculty.fullName : 'another faculty'} on ${slot.day} ${slot.period}.`
                    });
                }
            }
        }

        // Process removals
        for (const slot of removed) {
            ops.push(
                collections.timetable().deleteOne({
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
                subject: slot.subject || '',
                type: slot.type || 'class',
                location: slot.location || '',
                time: slot.time || '',
                updatedAt: new Date()
            };
            ops.push(collections.timetable().updateOne(
                { facultyId: new ObjectId(facultyId), day: slot.day, period: slot.period },
                { $set: doc },
                { upsert: true }
            ));
        }

        // Process updates
        for (const slot of updated) {
            ops.push(collections.timetable().updateOne(
                { facultyId: new ObjectId(facultyId), day: slot.day, period: slot.period },
                {
                    $set: {
                        subject: slot.subject || '',
                        type: slot.type || 'class',
                        location: slot.location || '',
                        time: slot.time || '',
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
