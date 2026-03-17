const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

async function checkFields() {
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/onecampus');
    try {
        await client.connect();
        const db = client.db();
        const users = await db.collection('users').find({ role: 'student' }).limit(5).toArray();
        console.log('Sample Students:', JSON.stringify(users, null, 2));
    } finally {
        await client.close();
    }
}
checkFields();
