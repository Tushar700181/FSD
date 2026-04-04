const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const vendorAuthRoutes = require('./routes/vendorAuth');
const complaintRoutes = require('./routes/complaints');
const menuRoutes = require('./routes/menus');
const orderRoutes = require('./routes/orders');
const leaveRoutes = require('./routes/leaves');
const placementRoutes = require('./routes/placements');
const facultyRoutes = require('./routes/faculty');
const adminFacultyRoutes = require('./routes/admin_faculty');
const adminStudentsRoutes = require('./routes/admin_students');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorAuthRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminFacultyRoutes);
app.use('/api/admin', adminStudentsRoutes);
app.use('/api/notifications', notificationRoutes);

// 2. Static Files
const frontendPath = path.resolve(__dirname, '../public');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Default route — redirect to landing page
app.get('/', (req, res) => {
    res.redirect('/landing/index.html');
});

// Connect to local MongoDB and start server
connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Login page: http://localhost:${PORT}/login/login.html`);
            console.log(`Landing page: http://localhost:${PORT}/landing/index.html`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    });
