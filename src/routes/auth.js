const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/authUtils');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Profile Pics
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/profile_pics');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET /api/auth/check-activation
router.get('/check-activation', async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase().trim();
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });

        const registryCollection = collections.faculty_registry();
        const faculty = await registryCollection.findOne({ 
            email: email.toLowerCase().trim(), 
            isRegistered: false 
        });

        if (faculty) {
            return res.status(200).json({ 
                success: true, 
                needsActivation: true, 
                fullName: faculty.fullName,
                idNumber: faculty.idNumber || '',
                gender: faculty.gender || '',
                phone: faculty.phone || '',
                dob: faculty.dateOfJoining || '', // Map joining date to DOB for activation
                department: faculty.department || '',
                cadre: faculty.designation || faculty.cadre || '',
                focusAreas: faculty.focusAreas || '',
                qualification: faculty.qualification || ''
            });
        }

        return res.status(200).json({ success: true, needsActivation: false });
    } catch (err) {
        console.error('Check activation error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { fullName, idNumber, dob, phone, email, gender, address, role,
            roomNo, hostelName, graduationYear, department, branch, semester,
            cadre, focusAreas, position, password, confirmPassword, signUpKey } = req.body;

        const usersCollection = collections.users();

        // Role verification for Faculty and Admin
        if (role === 'faculty') {
            if (signUpKey !== process.env.FACULTY_SIGNUP_KEY) {
                return res.status(401).json({ success: false, message: 'Invalid Faculty Verification Key' });
            }
        } else if (role === 'admin') {
            if (signUpKey !== process.env.ADMIN_SIGNUP_KEY) {
                return res.status(401).json({ success: false, message: 'Invalid Admin Verification Key' });
            }
        } else if (role === 'tpo') {
            if (signUpKey !== (process.env.TPO_SIGNUP_KEY || 'tpo123')) {
                return res.status(401).json({ success: false, message: 'Invalid TPO Verification Key' });
            }
        }

        // Check passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { idNumber: idNumber || 'NONE_PROVIDED' }
            ]
        });

        if (existingUser) {
            // Check if this is a preloaded faculty account being activated
            if (existingUser.role === 'faculty' && !existingUser.isActivated) {
                const hashedPassword = await hashPassword(password);
                await usersCollection.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            password: hashedPassword,
                            isActivated: true,
                            phone: phone || existingUser.phone,
                            dob: dob ? new Date(dob) : existingUser.dob,
                            updatedAt: new Date()
                        }
                    }
                );
                return res.status(200).json({ success: true, message: 'Faculty account activated successfully. You can now login.' });
            }

            const field = existingUser.email === email.toLowerCase().trim() ? 'Email' : 'ID Number';
            return res.status(400).json({ success: false, message: `${field} is already registered` });
        }

        // Hash password manually (since we don't have Mongoose pre-save hooks)
        const hashedPassword = await hashPassword(password);

        // Create new user object
        const newUser = {
            fullName,
            idNumber,
            dob: dob ? new Date(dob) : null,
            phone,
            email: email.toLowerCase().trim(),
            gender,
            address,
            role: role || 'student',
            roomNo,
            hostelName,
            graduationYear: graduationYear ? Number(graduationYear) : null,
            department,
            branch,
            semester,
            cadre,
            focusAreas,
            position,
            password: hashedPassword,
            isActivated: true, // New registrations are always activated
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (role === 'faculty') {
            try {
                const registryCollection = collections.faculty_registry();
                // Upsert in registry to keep it updated as the "Master List"
                await registryCollection.updateOne(
                    { email: email.toLowerCase().trim() },
                    { 
                        $set: { 
                            fullName, 
                            idNumber, 
                            gender, 
                            phone, 
                            department, 
                            designation: cadre, 
                            focusAreas, 
                            isRegistered: true,
                            updatedAt: new Date() 
                        } 
                    },
                    { upsert: true }
                );

                // Still append to legacy text file as requested by user
                const filePath = path.join(__dirname, '../docs/legacy/Faculty Details.txt');
                const entry = `\n--- NEW FACULTY (REGISTERED) ---\nName: ${fullName}\nID: ${idNumber}\nGender: ${gender}\nEmail: ${email}\nPhone: ${phone}\nDepartment: ${department}\nCadre: ${cadre}\nFocus Areas: ${focusAreas}\nDate: ${new Date().toLocaleDateString()}\n------------------\n`;
                fs.appendFileSync(filePath, entry);
            } catch (err) {
                console.error('Failed to sync faculty registry/file:', err);
            }
        }

        await usersCollection.insertOne(newUser);

        res.status(201).json({ success: true, message: 'Account created successfully!' });

    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usersCollection = collections.users();

        // Find user by email
        const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Compare password manually
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // BLOCK vendors from using this login page
        if (user.role === 'cafe') {
            return res.status(401).json({
                success: false,
                message: 'Vendor accounts must use the Cafe Owner Login portal.'
            });
        }

        res.json({
            success: true,
            message: 'Login successful!',
            redirectUrl: '/landing/index.html',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || '', // Fix for checkout phone issue
                role: user.role,
                department: user.department
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// GET /api/auth/profile/:id
router.get('/profile/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // Basic check for MongoDB ObjectId format
        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const usersCollection = collections.users();
        const user = await usersCollection.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
});

// PATCH /api/auth/profile/update
router.patch('/profile/update', authenticate, async (req, res) => {
    try {
        const { userId, fullName, phone, dob, gender, address, cadre, focusAreas, qualification, department } = req.body;

        // Security check: Only owner or admin can update
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own profile.' });
        }

        if (!userId || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const usersCollection = collections.users();
        const registryCollection = collections.faculty_registry();

        // 1. Update Users Collection
        const updateData = {
            fullName,
            phone,
            dob: dob ? new Date(dob) : null,
            gender,
            address,
            updatedAt: new Date()
        };

        // Role specific fields
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.role === 'faculty') {
            updateData.cadre = cadre;
            updateData.focusAreas = focusAreas;
            updateData.qualification = qualification;
            updateData.department = department;

            // 2. Sync with Faculty Registry
            await registryCollection.updateOne(
                { email: user.email },
                { 
                    $set: { 
                        fullName, 
                        phone, 
                        gender, 
                        designation: cadre, 
                        focusAreas, 
                        qualification, 
                        department,
                        updatedAt: new Date() 
                    } 
                }
            );
        }

        await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
});

// PATCH /api/auth/locations/active
router.patch('/locations/active', authenticate, async (req, res) => {
    try {
        const { userId, locationId } = req.body;

        // Security check: Only owner or admin can update
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own locations.' });
        }

        if (!userId || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const usersCollection = collections.users();

        // If locationId is 'primary', we unset activeLocationId or set it to a special value.
        // Let's just set activeLocationId to the string 'primary' or the specific ID.
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { activeLocationId: locationId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Active location updated successfully' });
    } catch (err) {
        console.error('Set active location error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// PATCH /api/auth/locations/:id
router.patch('/locations/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id; // This is the userId in the URL for this route
        const { label, address } = req.body;

        // Security check: Only owner or admin can update
        if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own locations.' });
        }

        if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        if (!label || !address) {
            return res.status(400).json({ success: false, message: 'Label and address are required' });
        }

        const usersCollection = collections.users();
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize savedLocations if it doesn't exist
        const savedLocations = user.savedLocations || [];

        // LIMIT: 3 saved locations
        if (savedLocations.length >= 3) {
            return res.status(400).json({ success: false, message: 'Maximum of 3 saved locations reached' });
        }

        // Add new location
        const newLocation = { label, address, id: Date.now().toString() };

        await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $push: { savedLocations: newLocation } }
        );

        res.json({ success: true, message: 'Location added successfully', location: newLocation });
    } catch (err) {
        console.error('Add location error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});

// DELETE /api/auth/locations/:userId/:locationId
router.delete('/locations/:userId/:locationId', authenticate, async (req, res) => {
    try {
        const { userId, locationId } = req.params;

        // Security check
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (!userId || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID format' });
        }

        const usersCollection = collections.users();

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { savedLocations: { id: locationId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Location removed successfully' });
    } catch (err) {
        console.error('Delete location error:', err);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
});




// POST /api/auth/favorites/toggle
router.post('/favorites/toggle', authenticate, async (req, res) => {
    try {
        const { userId, itemId } = req.body;

        // Security check
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        if (!userId || !itemId) {
            return res.status(400).json({ success: false, message: 'Missing userId or itemId' });
        }

        const usersCollection = collections.users();
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const favorites = user.favorites || [];
        const index = favorites.indexOf(itemId);

        let update;
        if (index > -1) {
            // Remove from favorites
            update = { $pull: { favorites: itemId } };
        } else {
            // Add to favorites
            update = { $push: { favorites: itemId } };
        }

        await usersCollection.updateOne({ _id: new ObjectId(userId) }, update);

        res.json({
            success: true,
            isFavorite: index === -1,
            message: index === -1 ? 'Added to favorites' : 'Removed from favorites'
        });
    } catch (err) {
        console.error('Toggle favorite error:', err);
        res.status(500).json({ success: false, message: 'Server error toggling favorite' });
    }
});

// GET /api/auth/favorites/:userId
router.get('/favorites/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const usersCollection = collections.users();
        const menusCollection = collections.menus();

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const favoriteIds = (user.favorites || []).map(id => {
            try { return new ObjectId(id); } catch (e) { return null; }
        }).filter(id => id !== null);

        const favoriteItems = await menusCollection.find({ _id: { $in: favoriteIds } }).toArray();

        res.json({ success: true, favorites: favoriteItems });
    } catch (err) {
        console.error('Get favorites error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching favorites' });
    }
});

// GET /api/auth/faculty - Get all faculty members
router.get('/faculty', async (req, res) => {
    try {
        const usersCollection = collections.users();
        const faculty = await usersCollection.find({ role: 'faculty' }).toArray();
        res.json({ success: true, faculty });
    } catch (err) {
        console.error('Fetch faculty error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── POST /api/auth/profile/upload-pic ──────────────────────────────────────
router.post('/profile/upload-pic', authenticate, upload.single('profilePic'), async (req, res) => {
    try {
        const { userId } = req.body;

        // Security check
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        if (!userId || !req.file) {
            return res.status(400).json({ success: false, message: 'User ID and image are required' });
        }

        const profilePicUrl = `/uploads/profile_pics/${req.file.filename}`;
        
        await collections.users().updateOne(
            { _id: new ObjectId(userId) },
            { $set: { profilePic: profilePicUrl, updatedAt: new Date() } }
        );

        res.json({ success: true, profilePicUrl, message: 'Profile picture updated' });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

module.exports = router;
