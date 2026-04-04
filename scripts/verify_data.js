const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function verify() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        
        const faculty = await db.collection('users').find({ role: 'faculty' }).toArray();
        console.log(`- Found ${faculty.length} faculty members.`);
        
        if (faculty.length > 0) {
            const f = faculty[0];
            console.log(`- Checking timetable for ${f.fullName} (${f._id})`);
            const count = await db.collection('timetable').countDocuments({ facultyId: f._id });
            console.log(`- Timetable slots for this faculty: ${count}`);
        }
        
        const totalSlots = await db.collection('timetable').countDocuments({});
        console.log(`- Total timetable slots in DB: ${totalSlots}`);
        
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

verify();
