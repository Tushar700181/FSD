const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDB() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB for seeding...');
        const db = client.db();

        const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/seed_data.json'), 'utf8'));

        // Seed Placements
        const placementsCol = db.collection('placements');
        await placementsCol.deleteMany({});
        await placementsCol.insertMany(seedData.placements);
        console.log('Seeded placements collection.');

        // Seed Alumni
        const alumniCol = db.collection('alumni');
        await alumniCol.deleteMany({});
        await alumniCol.insertMany(seedData.alumni);
        console.log('Seeded alumni collection.');

        // Seed Stats (Stored as a single document for simplicity or multiple depending on structure)
        const statsCol = db.collection('placement_stats');
        await statsCol.deleteMany({});
        await statsCol.insertOne(seedData.stats);
        console.log('Seeded placement_stats collection.');

        console.log('Database seeding completed successfully!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await client.close();
    }
}

seedDB();
