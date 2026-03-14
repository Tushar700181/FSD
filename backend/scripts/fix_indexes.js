const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixIndexes() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB...');

        const db = client.db();
        const usersCollection = db.collection('users');

        console.log('Dropping old idNumber index if it exists...');
        try {
            await usersCollection.dropIndex('idNumber_1');
            console.log('Old index dropped.');
        } catch (e) {
            console.log('Index did not exist or could not be dropped (this is usually fine).');
        }

        console.log('Creating new sparse unique index for idNumber...');
        await usersCollection.createIndex(
            { idNumber: 1 },
            { unique: true, sparse: true }
        );

        console.log('Success! idNumber index is now unique AND sparse.');
        console.log('This means multiple users can have a null/missing idNumber (like vendors), but if provided (like for students), it must still be unique.');

    } catch (err) {
        console.error('Error fixing indexes:', err);
    } finally {
        await client.close();
        process.exit();
    }
}

fixIndexes();
