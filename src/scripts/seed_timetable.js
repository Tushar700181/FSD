const { connectDB, collections } = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
    try {
        await connectDB();
        
        // 1. Seed Periods
        const periods = [
            { periodName: 'P1', start: '09:00', end: '10:00' },
            { periodName: 'P2', start: '10:00', end: '11:00' },
            { periodName: 'P3', start: '11:00', end: '12:00' },
            { periodName: 'P4', start: '12:00', end: '13:00' },
            { periodName: 'Afternoon', start: '14:00', end: '16:00' }
        ];
        
        await collections.period_schedule().deleteMany({});
        await collections.period_schedule().insertMany(periods);
        console.log('Periods seeded');

        // 2. Seed Classrooms
        const classrooms = [
            { roomCode: 'CS101', label: 'Theory Room 1', block: 'Science Block', floor: '1st' },
            { roomCode: 'CS102', label: 'Theory Room 2', block: 'Science Block', floor: '1st' },
            { roomCode: 'EC201', label: 'Electronics Lab', block: 'Tech Block', floor: '2nd' },
            { roomCode: 'L1', label: 'Computer Lab 1', block: 'Main Block', floor: 'Ground' }
        ];
        
        await collections.classrooms().deleteMany({});
        await collections.classrooms().insertMany(classrooms);
        console.log('Classrooms seeded');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
