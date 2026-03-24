const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/admin/promote-students
// Increments the semester for all students of a specific department and current semester
router.post('/promote-students', authenticate, authorize(['admin'], ['Academic']), async (req, res) => {
    try {
        const { department, currentSemester, adminKey } = req.body;

        if (!department || !currentSemester || !adminKey) {
            return res.status(400).json({ success: false, message: 'Missing fields: department, semester, or admin key required' });
        }

        // Project-specific safety check (Admin Key from .env)
        if (adminKey !== process.env.ADMIN_SIGNUP_KEY) {
            return res.status(401).json({ success: false, message: 'Invalid Admin Key. Action unauthorized.' });
        }

        const usersCollection = collections.users();

        const sem = Number(currentSemester);
        
        // Graduation Logic: If semester is 8, we DELETE accounts and provide a CSV export
        if (sem === 8) {
            const studentsToDelete = await usersCollection.find({ 
                role: 'student', 
                department: department, 
                semester: sem 
            }).toArray();

            if (studentsToDelete.length === 0) {
                return res.json({ success: true, message: 'No students found to graduate.', count: 0 });
            }

            // Generate CSV
            const headers = ['Full Name', 'ID Number', 'Department', 'Email', 'Batch (Graduation Year)'];
            const rows = studentsToDelete.map(s => [
                s.fullName,
                s.idNumber,
                s.department,
                s.email || 'N/A',
                s.graduationYear || 'N/A'
            ].map(v => `"${v}"`).join(','));
            
            const csvContent = [headers.join(','), ...rows].join('\n');
            const fileName = `Graduated_${department}_Sem8_${new Date().toISOString().split('T')[0]}_${Date.now()}.csv`;

            // Save to server (Backup)
            const dir = path.join(__dirname, '../../uploads/graduated_records');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, fileName), csvContent);

            // Delete accounts
            const deleteResult = await usersCollection.deleteMany({
                _id: { $in: studentsToDelete.map(s => s._id) }
            });

            return res.json({ 
                success: true, 
                message: `Successfully graduated ${deleteResult.deletedCount} students. Record saved to server and downloaded.`,
                count: deleteResult.deletedCount,
                csvData: csvContent,
                fileName: fileName
            });
        }
        
        // Normal Promotion (1-7)
        const result = await usersCollection.updateMany(
            { 
                role: 'student', 
                department: department, 
                semester: sem 
            },
            { 
                $set: { semester: sem + 1 },
                $currentDate: { updatedAt: true }
            }
        );

        res.json({ 
            success: true, 
            message: `Successfully promoted ${result.modifiedCount} students from Semester ${sem} to ${sem + 1}`,
            count: result.modifiedCount
        });

    } catch (err) {
        console.error('Promotion error:', err);
        res.status(500).json({ success: false, message: 'Server error during promotion' });
    }
});

module.exports = router;
