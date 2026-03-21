// seed_timetable.js — run once to insert periods & classrooms into MongoDB
// Usage: node scripts/seed_timetable.js

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

// timetable_slots → NOT seeded here, Academic Admin fills via the grid UI
// personal_blocks  → NOT seeded here, faculty marks their own blocks
// faculties        → already in your users collection (role: 'faculty')

async function seed() {
  try {
    await connectDB();

    await collections.period_schedule().deleteMany({});
    await collections.period_schedule().insertMany(periods);
    console.log(`✅ Inserted ${periods.length} periods`);

    await collections.classrooms().deleteMany({});
    await collections.classrooms().insertMany(classrooms);
    console.log(`✅ Inserted ${classrooms.length} classrooms`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();