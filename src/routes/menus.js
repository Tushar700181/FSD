const express = require('express');
const router = express.Router();
const { collections } = require('../config/db');
const { ObjectId } = require('mongodb');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/menus/cafes - Get all registered cafes (Public)
router.get('/cafes/list', async (req, res) => {
    try {
        const usersCollection = collections.users();
        // Find users with role 'cafe' and get their cafe names
        const cafesList = await usersCollection.find({ role: 'cafe' }).project({ cafeName: 1, _id: 0 }).toArray();
        const cafeNames = cafesList.map(c => c.cafeName).filter(name => !!name);

        console.log('Detected Cafes:', cafeNames); // SERVER LOG
        res.json({ success: true, cafes: cafeNames });
    } catch (err) {
        console.error('Fetch cafes error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch cafes' });
    }
});

// GET /api/menus/:cafeName - Get menu for a specific cafe
router.get('/:cafeName', async (req, res) => {
    try {
        const menusCollection = collections.menus();
        const items = await menusCollection.find({ cafeName: req.params.cafeName }).toArray();
        res.json({ success: true, items });
    } catch (err) {
        console.error('Fetch menu error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch menu' });
    }
});

// POST /api/menus (Cafe Vendor Only)
router.post('/', authenticate, authorize(['cafe']), async (req, res) => {
    try {
        const { name, price, image, cafeName } = req.body;
        const menusCollection = collections.menus();

        // Security check: Vendor can only add to their own cafe
        if (cafeName !== req.user.cafeName) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only add items to your own cafe.' });
        }

        if (!name || !price || !cafeName) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newItem = {
            name,
            price: Number(price),
            image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
            cafeName: (cafeName || '').trim(),
            available: true,
            ratings: [], // Store {userId, rating, comment, date}
            averageRating: 0,
            totalRatings: 0,
            createdAt: new Date()
        };

        const result = await menusCollection.insertOne(newItem);
        res.status(201).json({ success: true, item: { ...newItem, _id: result.insertedId } });
    } catch (err) {
        console.error('Add menu item error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to add item. Ensure database is connected.' });
    }
});

// PATCH /api/menus/:id (Cafe Vendor Only)
router.patch('/:id', authenticate, authorize(['cafe']), async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
        
        const { price, available } = req.body;
        const menusCollection = collections.menus();

        // Ownership check
        const item = await menusCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        if (item.cafeName !== req.user.cafeName) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only update items in your own cafe.' });
        }

        const updateData = {};
        if (price !== undefined) updateData.price = Number(price);
        if (available !== undefined) updateData.available = available;

        const result = await menusCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item updated' });
    } catch (err) {
        console.error('Update menu item error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update item' });
    }
});

// DELETE /api/menus/:id (Cafe Vendor Only)
router.delete('/:id', authenticate, authorize(['cafe']), async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
        
        const menusCollection = collections.menus();
        
        // Ownership check
        const item = await menusCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        if (item.cafeName !== req.user.cafeName) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only delete items from your own cafe.' });
        }

        const result = await menusCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        console.error('Delete menu item error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
});

// POST /api/menus/:id/rate - Submit a rating for an item (Any Authenticated User)
router.post('/:id/rate', authenticate, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const menusCollection = collections.menus();
        
        if (rating === undefined) {
            return res.status(400).json({ success: false, message: 'Rating is required' });
        }

        let objectId;
        try {
            objectId = new ObjectId(req.params.id);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid item ID format' });
        }

        const item = await menusCollection.findOne({ _id: objectId });
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const newRating = {
            userId: userId ? new ObjectId(userId) : null,
            rating: Number(rating),
            comment: comment || '',
            date: new Date()
        };

        const ratings = item.ratings || [];
        ratings.push(newRating);

        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        const average = total / ratings.length;

        await menusCollection.updateOne(
            { _id: objectId },
            { 
                $set: { 
                    ratings, 
                    averageRating: average, 
                    totalRatings: ratings.length 
                } 
            }
        );

        res.json({ success: true, averageRating: average, totalRatings: ratings.length });
    } catch (err) {
        console.error('Rating error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to submit rating' });
    }
});

module.exports = router;
