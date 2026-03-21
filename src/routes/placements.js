const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');

// Configure Multer for PDF resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    }
});

// Middleware to check if user is TPO (DEPRECATED: Use authorize(['tpo']) instead)
// Removed isTPO

// GET /api/placements/student-profile - Fetch persistent profile
router.get('/student-profile', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const profile = await collections.getDB().collection('student_profiles').findOne({ userId: new ObjectId(userId) });
        res.json(profile || { skills: '', resumeUrl: '', mobile: '', parentName: '' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// POST /api/placements/student-profile - Update persistent profile
router.post('/student-profile', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const { skills, resumeUrl, mobile, parentName } = req.body;
        await collections.getDB().collection('student_profiles').updateOne(
            { userId: new ObjectId(userId) },
            { $set: { userId: new ObjectId(userId), skills, resumeUrl, mobile, parentName, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

// POST /api/placements/apply - Submit application
router.post('/apply', authenticate, upload.single('resume'), async (req, res) => {
    try {
        const userId = req.user._id;
        const { driveId, company, role, skills, mobile, parentName, fullName, idNumber, department, gender } = req.body;
        const resumeUrl = req.file ? `/uploads/${req.file.filename}` : req.body.resumeUrl;

        if (!driveId || !skills || !resumeUrl) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Save application
        const application = {
            userId: new ObjectId(userId),
            driveId: new ObjectId(driveId),
            company,
            role,
            skills,
            resumeUrl,
            studentDetails: { fullName, idNumber, department, gender, mobile, parentName },
            status: 'Applied',
            appliedAt: new Date()
        };

        await collections.getDB().collection('applications').insertOne(application);

        // 2. Update persistent student profile (placement-specific)
        await collections.getDB().collection('student_profiles').updateOne(
            { userId: new ObjectId(userId) },
            { $set: { userId: new ObjectId(userId), skills, resumeUrl, mobile, parentName, updatedAt: new Date() } },
            { upsert: true }
        );

        // 3. Update main users collection if identity fields were newly filled
        const userUpdate = {};
        if (fullName) userUpdate.fullName = fullName;
        if (idNumber) userUpdate.idNumber = idNumber;
        if (department) userUpdate.department = department;
        if (gender) userUpdate.gender = gender;

        if (Object.keys(userUpdate).length > 0) {
            await collections.users().updateOne(
                { _id: new ObjectId(userId) },
                { $set: { ...userUpdate, updatedAt: new Date() } }
            );
        }

        res.status(201).json({ success: true, message: 'Application submitted successfully!' });
    } catch (err) {
        console.error('Apply error:', err);
        res.status(500).json({ success: false, message: err.message || 'Error submitting application' });
    }
});

// GET /api/placements/drives - Fetch all drives
router.get('/drives', async (req, res) => {
    try {
        const drives = await collections.getDB().collection('placements').find({}).toArray();
        res.json(drives);
    } catch (err) {
        console.error('Fetch drives error:', err);
        res.status(500).json({ success: false, message: 'Error fetching drives' });
    }
});

// GET /api/placements/alumni - Fetch manual alumni
router.get('/alumni', async (req, res) => {
    try {
        const alumni = await collections.getDB().collection('alumni').find({}).toArray();
        res.json(alumni);
    } catch (err) {
        console.error('Fetch alumni error:', err);
        res.status(500).json({ success: false, message: 'Error fetching alumni' });
    }
});

// GET /api/placements - Fetch all (for compatibility)
router.get('/', async (req, res) => {
    try {
        const drives = await collections.getDB().collection('placements').find({}).toArray();
        const alumni = await collections.getDB().collection('alumni').find({}).toArray();
        res.json({ success: true, drives, alumni });
    } catch (err) {
        console.error('Fetch placements error:', err);
        res.status(500).json({ success: false, message: 'Error fetching placement data' });
    }
});

// GET /api/placements/stats - Fetch placement statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await collections.getDB().collection('placement_stats').findOne({});
        res.json(stats || {});
    } catch (err) {
        console.error('Fetch stats error:', err);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// POST /api/placements/drive - Add a new placement drive (TPO only)
router.post('/drive', authenticate, authorize(['tpo']), async (req, res) => {
    try {
        const drive = req.body;
        // Basic validation
        if (!drive.company || !drive.role || !drive.package) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        await collections.getDB().collection('placements').insertOne({
            ...drive,
            type: 'drive',
            createdAt: new Date()
        });
        res.status(201).json({ success: true, message: 'Placement drive added successfully' });
    } catch (err) {
        console.error('Add drive error:', err);
        res.status(500).json({ success: false, message: 'Error adding placement drive' });
    }
});

// POST /api/placements/alumni - Add a new alumni (TPO only)
router.post('/alumni', authenticate, authorize(['tpo']), async (req, res) => {
    try {
        const alumnus = req.body;
        if (!alumnus.name || !alumnus.company || !alumnus.batch) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        await collections.getDB().collection('alumni').insertOne({
            ...alumnus,
            createdAt: new Date()
        });
        res.status(201).json({ success: true, message: 'Alumnus added successfully' });
    } catch (err) {
        console.error('Add alumni error:', err);
        res.status(500).json({ success: false, message: 'Error adding alumnus' });
    }
});

// POST /api/placements/bulk-upload - Bulk add data via CSV (TPO only)
router.post('/bulk-upload', authenticate, authorize(['tpo']), async (req, res) => {
    try {
        const { type, csvData } = req.body;
        if (!type || !csvData) {
            return res.status(400).json({ success: false, message: 'Missing type or data' });
        }

        const lines = csvData.trim().split('\n');
        if (lines.length < 2) return res.status(400).json({ success: false, message: 'Invalid CSV format' });

        const headers = lines[0].split(',').map(h => h.trim());
        const records = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const record = {};
            headers.forEach((header, i) => {
                record[header] = values[i];
            });
            return { ...record, createdAt: new Date() };
        });

        const collectionName = type === 'drive' ? 'placements' : 'alumni';
        await collections.getDB().collection(collectionName).insertMany(records);

        res.json({ success: true, message: `Successfully uploaded ${records.length} ${type}s` });
    } catch (err) {
        console.error('Bulk upload error:', err);
        res.status(500).json({ success: false, message: 'Error processing CSV' });
    }
});

// POST /api/placements/bulk-upload-past-offers - Process past offers and auto-calculate stats (TPO only)
router.post('/bulk-upload-past-offers', authenticate, authorize(['tpo']), async (req, res) => {
    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ success: false, message: 'Missing data' });

        const lines = csvData.trim().split('\n');
        if (lines.length < 2) return res.status(400).json({ success: false, message: 'Invalid CSV format' });

        const headers = lines[0].split(',').map(h => h.trim());
        const records = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const record = {};
            headers.forEach((header, i) => {
                record[header] = values[i];
            });
            return {
                ...record,
                year: parseInt(record.year),
                packageNum: parseFloat(record.package.replace(/[^0-9.]/g, '')),
                createdAt: new Date()
            };
        });

        const db = collections.getDB();
        
        // 1. Insert into past_offers collection
        await db.collection('past_offers').insertMany(records);

        // 2. Fetch all past offers to recalculate stats
        const allOffers = await db.collection('past_offers').find({}).toArray();
        if (allOffers.length === 0) return res.json({ success: true, message: 'Uploaded, but no data to calculate stats.' });

        // 3. Calculate Summary (based on the latest year found in data)
        const yearsPresent = [...new Set(allOffers.map(o => o.year))].sort((a, b) => b - a);
        const latestYear = yearsPresent[0] || new Date().getFullYear();
        const yearOffers = allOffers.filter(o => o.year === latestYear);
        
        const totalOffersLatest = yearOffers.length;
        const highestPackageVal = Math.max(...allOffers.map(o => o.packageNum || 0));
        const highestPackageStr = `₹${highestPackageVal} LPA`;
        const avgPackageVal = (allOffers.reduce((sum, o) => sum + (o.packageNum || 0), 0) / allOffers.length).toFixed(1);
        const averagePackageStr = `₹${avgPackageVal} LPA`;
        const companiesVisited = new Set(allOffers.map(o => o.company)).size;

        // 4. Calculate Yearly Offers Growth
        const yearGroups = {};
        allOffers.forEach(o => {
            yearGroups[o.year] = (yearGroups[o.year] || 0) + 1;
        });
        const yearlyOffers = Object.keys(yearGroups).sort().map(year => ({
            year: parseInt(year),
            offers: yearGroups[year]
        }));

        // 5. Calculate Branch Distribution (Current Year)
        const branchGroups = {};
        yearOffers.forEach(o => {
            branchGroups[o.branch] = (branchGroups[o.branch] || 0) + 1;
        });
        const branchDistribution = Object.keys(branchGroups).map(branch => ({
            branch,
            count: branchGroups[branch],
            percentage: Math.round((branchGroups[branch] / yearOffers.length) * 100)
        }));

        // 6. Calculate Package Distribution (Current Year)
        // Ranges: 5-10, 10-15, 15-25, 25+
        const ranges = [
            { label: '₹5-10 LPA', min: 5, max: 10, count: 0 },
            { label: '₹10-15 LPA', min: 10, max: 15, count: 0 },
            { label: '₹15-25 LPA', min: 15, max: 25, count: 0 },
            { label: '₹25+ LPA', min: 25, max: 1000, count: 0 }
        ];
        yearOffers.forEach(o => {
            const p = o.packageNum || 0;
            const range = ranges.find(r => p >= r.min && p < r.max);
            if (range) range.count++;
        });
        const packageDistribution = ranges.map(r => ({
            range: r.label,
            count: r.count,
            percentage: yearOffers.length > 0 ? Math.round((r.count / yearOffers.length) * 100) : 0
        }));

        // 7. Update placement_stats document
        const newStats = {
            summary: {
                latestYear,
                totalOffers: totalOffersLatest,
                highestPackage: highestPackageStr,
                averagePackage: averagePackageStr,
                companiesVisited
            },
            yearlyOffers,
            branchDistribution,
            packageDistribution,
            updatedAt: new Date()
        };

        await db.collection('placement_stats').replaceOne({}, newStats, { upsert: true });

        res.json({ success: true, message: `Successfully uploaded ${records.length} offers and updated statistics.` });
    } catch (err) {
        console.error('Bulk upload past offers error:', err);
        res.status(500).json({ success: false, message: 'Error processing CSV and calculating stats' });
    }
});

module.exports = router;
