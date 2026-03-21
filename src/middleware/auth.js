const { ObjectId } = require('mongodb');
const { collections } = require('../config/db');

/**
 * Global Authentication Middleware
 * Verifies that the user exists and attaches them to the request
 */
async function authenticate(req, res, next) {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required: x-user-id header missing' });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Invalid User ID format' });
        }

        const user = await collections.users().findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during authentication' });
    }
}

/**
 * Authorization Middleware
 * @param {string[]} roles - Allowed roles
 * @param {string[]} departments - Allowed departments (only checked for admins)
 */
function authorize(roles = [], departments = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Role check
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden: This action requires one of the following roles: ${roles.join(', ')}` 
            });
        }

        // Department check (for Admin-level actions)
        if (req.user.role === 'admin' && departments.length > 0) {
            if (!departments.includes(req.user.department)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Forbidden: This action is restricted to the following departments: ${departments.join(', ')}` 
                });
            }
        }

        next();
    };
}

module.exports = {
    authenticate,
    authorize
};
