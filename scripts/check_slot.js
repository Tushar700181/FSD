const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function checkSlot() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const slot = await db.collection('timetable').findOne({});
        console.log('Sample Timetable Slot:');
        console.log(JSON.stringify(slot, null, 2));
        console.log('Type of facultyId:', typeof slot.facultyId);
        
        if (slot.facultyId instanceof ObjectId) {
            console.log('facultyId is an ObjectId instance.');
        } else {
            console.log('facultyId is NOT an ObjectId instance.');
        }

        const faculty = await db.collection('users').findOne({ role: 'faculty' });
        console.log('Sample Faculty:');
        console.log(JSON.stringify({ _id: faculty._id, fullName: faculty.fullName }, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

checkSlot();
