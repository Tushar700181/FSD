const { connectDB, collections } = require('../src/config/db');
const { ObjectId } = require('mongodb');

async function fixAndCleanup() {
    await connectDB();
    
    // 1. Delete faculty1_naresh account and data
    const nareshEmail = 'faculty1_naresh@gmail.com';
    const naresh = await collections.users().findOne({ email: nareshEmail });
    
    if (naresh) {
        const nareshId = naresh._id;
        console.log(`Deleting data for Naresh (${nareshId})...`);
        
        await collections.users().deleteOne({ _id: nareshId });
        await collections.timetable_slots().deleteMany({ facultyId: nareshId });
        await collections.personal_blocks().deleteMany({ facultyId: nareshId });
        await collections.appointments().deleteMany({ facultyId: nareshId });
        
        console.log('Naresh account and associated data deleted.');
    } else {
        console.log('Naresh account not found.');
    }

    // 2. Fix timetable "undefined" by reseeding with correct fields (subject, topics, room)
    console.log('Clearing and reseeding all faculty timetables...');
    
    // Clear ALL existing slots to start fresh and fix the "undefined" issue everywhere
    await collections.timetable_slots().deleteMany({});

    const faculty = await collections.users().find({ role: 'faculty' }).toArray();
    const periodsRes = await collections.period_schedule().find({}).toArray();
    const periods = periodsRes.map(p => p.period || p.periodName);
    
    if (periods.length === 0) {
        console.log('No periods found.');
        process.exit(1);
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const subjects = ['CS101', 'CS102', 'CS201', 'CS202', 'Mini Project', 'Lab', 'Seminar'];
    const halls = ['Hundri', 'Krishna', 'Seminar Hall 1', 'Lab 101'];
    const sampleTopics = ['React Hooks', 'MongoDB Aggregation', 'Database Design', 'Cyber Security Intro', 'Deep Learning Basics'];
    
    let totalInserted = 0;

    for (const f of faculty) {
        console.log(`Seeding for ${f.fullName}...`);
        for (const day of days) {
            for (const period of periods) {
                if (Math.random() > 0.4) {
                    const sub = subjects[Math.floor(Math.random() * subjects.length)];
                    const hall = halls[Math.floor(Math.random() * halls.length)];
                    const topic = sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
                    
                    const slot = {
                        facultyId: f._id,
                        day,
                        period,
                        type: Math.random() > 0.15 ? 'class' : 'meeting',
                        subject: sub, // Use 'subject' instead of 'label'
                        topics: topic,  // Added topics
                        room: hall,
                        createdAt: new Date()
                    };
                    
                    await collections.timetable_slots().insertOne(slot);
                    totalInserted++;
                }
            }
        }
    }
    
    console.log(`Successfully fixed and inserted ${totalInserted} timetable slots.`);
    process.exit(0);
}

fixAndCleanup();
