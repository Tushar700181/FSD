const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB, collections } = require('../src/config/db');

const periods = [
  { period: 'P1', start_time: '09:00', end_time: '10:00' },
  { period: 'P2', start_time: '10:00', end_time: '11:00' },
  { period: 'P3', start_time: '11:15', end_time: '12:15' },
  { period: 'P4', start_time: '12:15', end_time: '13:15' },
  { period: 'Afternoon', start_time: '14:00', end_time: '17:00' },
];

const classrooms = [
  { room_code: 'CS101', label: 'CSE 3rd year', block: 'CS Block', floor: 1 },
  { room_code: 'CS102', label: 'AIDS 3rd year', block: 'CS Block', floor: 1 },
  { room_code: 'CS201', label: 'CSE 2nd year', block: 'CS Block', floor: 2 },
  { room_code: 'CS202', label: 'AIDS 2nd year', block: 'CS Block', floor: 2 },
  { room_code: 'SCI-1', label: '1st year', block: 'Science Block', floor: 1 },
  { room_code: 'LAB-01', label: 'CS Lab', block: 'CS Block', floor: 1 },
];

async function seed() {
  try {
    await connectDB();

    // 1. Seed Periods
    await collections.period_schedule().deleteMany({});
    await collections.period_schedule().insertMany(periods);
    console.log(`✅ Inserted ${periods.length} periods`);

    // 2. Seed Classrooms
    await collections.classrooms().deleteMany({});
    await collections.classrooms().insertMany(classrooms);
    console.log(`✅ Inserted ${classrooms.length} classrooms`);

    // 3. Seed Timetable (assignments)
    const slotsPath = path.join(__dirname, '../data/timetable_data.json');
    if (fs.existsSync(slotsPath)) {
        // Read UTF-16LE content
        const slotsContent = fs.readFileSync(slotsPath, 'utf16le');
        const slotsData = JSON.parse(slotsContent);
        
        if (slotsData && slotsData.length > 0) {
            // Remove Mongo IDs and ensure facultyId is an ObjectId
            const cleanedSlots = slotsData.map(s => {
                const { _id, ...rest } = s;
                // Important: Ensure facultyId is stored as an ObjectId for proper lookups
                const { ObjectId } = require('mongodb');
                if (rest.facultyId) {
                    rest.facultyId = new ObjectId(rest.facultyId);
                }
                return rest;
            });

            // TARGET COLLECTION: timetable
            await collections.timetable().deleteMany({});
            await collections.timetable().insertMany(cleanedSlots);
            console.log(`✅ Inserted ${cleanedSlots.length} timetable assignments into 'timetable' collection`);
        }
    } else {
        console.warn('⚠️ timetable_data.json not found!');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
