const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');

// ─── HELPER: Get currently active period based on time ───────────────────────
async function getActivePeriod(now) {
    const periods = await collections.period_schedule().find({}).toArray();
    const [h, m] = [now.getHours(), now.getMinutes()];
    const currentMinutes = h * 60 + m;

    for (const p of periods) {
        // Support both naming styles: start_time/end_time (new) and start/end (old)
        const startStr = p.start_time || p.start;
        const endStr   = p.end_time   || p.end;
        const pName    = p.period     || p.periodName;
        if (!startStr || !endStr) continue;
        const [sh, sm] = startStr.split(':').map(Number);
        const [eh, em] = endStr.split(':').map(Number);
        if (currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em) {
            return pName;
        }
    }
    return null;
}

// ─── HELPER: Resolve faculty status at a given time ──────────────────────────
async function getFacultyStatus(facultyId, now) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = dayNames[now.getDay()];

    // 1. Sunday check
    if (today === 'Sun') {
        return { status: 'Not Available', detail: 'Sunday', period: null };
    }

    const usersCollection = collections.users();
    const faculty = await usersCollection.findOne({ _id: new ObjectId(facultyId) });

    // 2. Check for manual status override (In Meeting, Busy, etc.)
    if (faculty && faculty.manualStatus && faculty.manualStatus !== 'Auto') {
        return { 
            status: faculty.manualStatus, 
            detail: 'Manual Override', 
            isManual: true 
        };
    }

    const activePeriod = await getActivePeriod(now);
    
    if (!activePeriod) {
        return { status: 'Available', detail: 'No active session', period: null };
    }

    // 3. Check official timetable slot
    const slot = await collections.timetable().findOne({
        facultyId: new ObjectId(facultyId),
        day: today,
        period: activePeriod
    });

    if (slot) {
        return {
            status: slot.type === 'meeting' ? 'In Meeting' : 'In Class',
            period: activePeriod,
            subject: slot.subject,
            location: slot.location,
            type: slot.type
        };
    }

    // 4. Check personal blocks
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const block = await collections.personal_blocks().findOne({
        facultyId: new ObjectId(facultyId),
        day: today,
        start: { $lte: hhmm },
        end: { $gt: hhmm }
    });

    if (block) {
        return { status: 'Unavailable', detail: 'Personal Block', period: activePeriod };
    }

    return { status: 'Available', detail: 'Free Period', period: activePeriod };
}

// ─── GET /api/faculty/status  ─────────────────────────────────────────────────
// Returns current status for all faculty (role-masked)
// Caller must pass ?role=student|faculty|admin in header or query
router.get('/status', async (req, res) => {
    try {
        const requesterRole = req.query.role || 'student';
        const now = new Date();

        const usersCollection = collections.users();
        const allFaculty = await usersCollection.find(
            { role: 'faculty' },
            { projection: { password: 0 } }
        ).toArray();

        const results = await Promise.all(allFaculty.map(async (faculty) => {
            // Respect show_timetable flag
            if (faculty.show_timetable === false && requesterRole === 'student') {
                return {
                    _id: faculty._id,
                    fullName: faculty.fullName,
                    designation: faculty.designation || '',
                    department: faculty.department,
                    email: faculty.email,
                    cabin: faculty.cabin || '',
                    focusAreas: faculty.focusAreas || '',
                    availability: { status: 'Hidden' }
                };
            }

            const availability = await getFacultyStatus(faculty._id.toString(), now);

            // Mask room for students
            if (requesterRole === 'student' && availability.classroom) {
                delete availability.classroom;
                delete availability.label;
            }

            return {
                _id: faculty._id,
                fullName: faculty.fullName,
                designation: faculty.designation || '',
                department: faculty.department,
                email: faculty.email,
                cabin: faculty.cabin || '',
                focusAreas: faculty.focusAreas || '',
                availability
            };
        }));

        res.json({ success: true, faculty: results });
    } catch (err) {
        console.error('Faculty status error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── GET /api/faculty/:id/timetable ──────────────────────────────────────────
// Returns full weekly timetable + current status for a specific faculty
// Role-masked: students don't see room codes or subject names
router.get('/:id/timetable', async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = req.query.role || 'student';

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
        }

        const usersCollection = collections.users();
        const faculty = await usersCollection.findOne(
            { _id: new ObjectId(id), role: 'faculty' },
            { projection: { password: 0 } }
        );

        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        // Enforce show_timetable privacy flag for students
        if (faculty.show_timetable === false && requesterRole === 'student') {
            return res.json({
                success: true,
                faculty: { _id: faculty._id, fullName: faculty.fullName },
                timetable: [],
                currentStatus: { status: 'Hidden' }
            });
        }

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        // Fetch full week slots
        const timetable = await collections.timetable().find({
            facultyId: new ObjectId(id)
        }).sort({ day: 1, period: 1 }).toArray();

        // Current status
        const currentStatus = await getFacultyStatus(id, new Date());
        
        // Role masking for students (optional: refine if needed)
        if (requesterRole === 'student') {
            // Students can see subject for now as per user request ("proper timetable")
            // but we could mask rooms if needed. User asked for professional timetable, 
            // so we'll show details.
        }

        res.json({ success: true, faculty: { _id: faculty._id, fullName: faculty.fullName, designation: faculty.designation, department: faculty.department }, timetable, currentStatus });
    } catch (err) {
        console.error('Timetable fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── POST /api/faculty/status ───────────────────────────────────────────────
// Faculty can manually override their status (Available, Busy, In Meeting, etc.)
router.post('/status', async (req, res) => {
    try {
        const { facultyId, status } = req.body; // status: 'Available', 'Busy', 'In Meeting', 'Auto'
        if (!facultyId || !status) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        await collections.users().updateOne(
            { _id: new ObjectId(facultyId) },
            { $set: { manualStatus: status, updatedAt: new Date() } }
        );
        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error('Status override error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── POST /api/faculty/personal-block ────────────────────────────────────────
// Faculty can mark themselves as busy for a custom time
router.post('/personal-block', async (req, res) => {
    try {
        const { facultyId, day, start, end, reason } = req.body;
        if (!facultyId || !day || !start || !end) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        await collections.personal_blocks().insertOne({
            facultyId: new ObjectId(facultyId),
            day, start, end,
            reason: reason || '',
            createdAt: new Date()
        });
        res.json({ success: true, message: 'Personal block added' });
    } catch (err) {
        console.error('Personal block error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── POST /api/faculty/appointments/request ──────────────────────────────────
// Students can request a meeting slot
router.post('/appointments/request', async (req, res) => {
    try {
        const { facultyId, slotKey, studentName, studentRoll, reason } = req.body;
        if (!facultyId || !slotKey || !studentName || !studentRoll) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const [day, period] = slotKey.split('_');

        await collections.appointments().insertOne({
            facultyId: new ObjectId(facultyId),
            day,
            period,
            studentName,
            studentRoll,
            reason: reason || '',
            status: 'pending',
            requestedAt: new Date()
        });

        res.json({ success: true, message: 'Appointment request submitted' });
    } catch (err) {
        console.error('Appointment request error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
