const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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
    menus: () => getDB().collection('menus'),
    leaves: () => getDB().collection('leaves'),
    classrooms: () => getDB().collection('classrooms'),
    period_schedule: () => getDB().collection('period_schedule'),
    timetable: () => getDB().collection('timetable'),
    timetable_slots: () => getDB().collection('timetable_slots'),
    personal_blocks: () => getDB().collection('personal_blocks'),
    appointments: () => getDB().collection('appointments'),
    faculty_registry: () => getDB().collection('faculty_registry')
};

module.exports = { connectDB, getDB, collections };
