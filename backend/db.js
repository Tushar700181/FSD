const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db(); // Uses the database name from the MONGO_URI if present, else defaults
        console.log('Connected to MongoDB (Native)');
        return db;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

const collections = {
    getDB: getDB,
    users: () => getDB().collection('users'),
    complaints: () => getDB().collection('complaints'),
    orders: () => getDB().collection('orders'),
    menus: () => getDB().collection('menus')
};

module.exports = { connectDB, getDB, collections };
