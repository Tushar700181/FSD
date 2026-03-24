const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function setupCSETimetable() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const timetableCol = db.collection('timetable');
        const usersCol = db.collection('users');
        const periodCol = db.collection('period_schedule');

        // 0. Update periods
        await periodCol.deleteMany({});
        await periodCol.insertMany([
            { period: 'P1', start_time: '09:00', end_time: '10:00' },
            { period: 'P2', start_time: '10:00', end_time: '11:00' },
            { period: 'P3', start_time: '11:00', end_time: '12:00' },
            { period: 'Afternoon', start_time: '14:00', end_time: '17:00' },
            { period: 'NightTest', start_time: '19:00', end_time: '23:00' }
        ]);

        // 1. Identify CSE Faculty in 'users' collection
        const emails = [
            'ksb@iiitk.ac.in',
            'nareshbabu@iiitk.ac.in',
            'srinu@iiitk.ac.in',
            'knagaraju@iiitk.ac.in',
            'anilkumar.r@iiitk.ac.in',
            'shounak@iiitk.ac.in'
        ];
        const facultyList = await usersCol.find({ email: { $in: emails }, role: 'faculty' }).toArray();
        const getFId = (email) => {
            const f = facultyList.find(fac => fac.email === email);
            return f ? f._id : null;
        };

        const fSathya = getFId('ksb@iiitk.ac.in');
        const fNaresh = getFId('nareshbabu@iiitk.ac.in');
        const fSrinu = getFId('srinu@iiitk.ac.in');
        const fNagaraju = getFId('knagaraju@iiitk.ac.in');
        const fAnil = getFId('anilkumar.r@iiitk.ac.in');
        const fShounak = getFId('shounak@iiitk.ac.in');

        if (!fSathya || !fNaresh || !fSrinu || !fNagaraju || !fAnil || !fShounak) {
            console.error('Could not find all 6 CSE faculty members in registry.');
            return;
        }

        // 2. Clear old CSE timetable data
        // For safety, we match by the IDs we found
        const ids = [fSathya, fNaresh, fSrinu, fNagaraju, fAnil, fShounak];
        await timetableCol.deleteMany({ facultyId: { $in: ids } });

        const newSlots = [];

        // Core Assignments
        const core = {
            sathya:  { sub: 'Artificial Intelligence', room: 'AD-101' },
            naresh:  { sub: 'Machine Learning', room: 'CS-101' },
            srinu:   { sub: 'Big Data', room: 'AD-101' },
            nagraju: { sub: 'Operating Systems', room: 'CS-101' },
            anil:    { sub: 'Cloud Computing', room: 'AD-101' },
            shounak: { sub: 'NLP', room: 'CS-101' }
        };

        const electives = {
            sathya:  { sub: 'AI Ethics', room: 'CS-101' },
            naresh:  { sub: 'Cryptography', room: 'AD-101' },
            srinu:   { sub: 'Deep Learning', room: 'CS-101' },
            nagraju: { sub: 'Computer Networks', room: 'AD-101' },
            anil:    { sub: 'Edge Computing', room: 'AD-101' }, // Overlapping room needs care
            shounak: { sub: 'Computer Vision', room: 'CS-101' }
        };

        // Manual varied schedule to ensure no conflicts and "randomized periods"
        const schedule = [
            // Monday
            { day: 'Mon', p: 'P1', f: fSathya, s: core.sathya.sub, r: 'AD-101', t: '09:00 - 10:00' },
            { day: 'Mon', p: 'P1', f: fNagaraju, s: core.nagraju.sub, r: 'CS-101', t: '09:00 - 10:00' },
            { day: 'Mon', p: 'P2', f: fSrinu, s: core.srinu.sub, r: 'AD-101', t: '10:00 - 11:00' },
            { day: 'Mon', p: 'P2', f: fNaresh, s: core.naresh.sub, r: 'CS-101', t: '10:00 - 11:00' },
            { day: 'Mon', p: 'P3', f: fAnil, s: core.anil.sub, r: 'AD-101', t: '11:00 - 12:00' },
            { day: 'Mon', p: 'P3', f: fShounak, s: core.shounak.sub, r: 'CS-101', t: '11:00 - 12:00' },

            // Tuesday (Shuffled periods)
            { day: 'Tue', p: 'P1', f: fNaresh, s: electives.naresh.sub, r: 'AD-101', t: '09:00 - 10:00' },
            { day: 'Tue', p: 'P1', f: fAnil, s: electives.anil.sub, r: 'CS-101', t: '09:00 - 10:00' },
            { day: 'Tue', p: 'P2', f: fNagaraju, s: electives.nagraju.sub, r: 'AD-101', t: '10:00 - 11:00' },
            { day: 'Tue', p: 'P2', f: fSathya, s: core.sathya.sub, r: 'CS-101', t: '10:00 - 11:00' },
            { day: 'Tue', p: 'P3', f: fShounak, s: electives.shounak.sub, r: 'CS-101', t: '11:00 - 12:00' },
            { day: 'Tue', p: 'P3', f: fSrinu, s: electives.srinu.sub, r: 'AD-101', t: '11:00 - 12:00' },

            // Wednesday
            { day: 'Wed', p: 'P1', f: fShounak, s: core.shounak.sub, r: 'AD-101', t: '09:00 - 10:00' },
            { day: 'Wed', p: 'P1', f: fSathya, s: electives.sathya.sub, r: 'CS-101', t: '09:00 - 10:00' },
            { day: 'Wed', p: 'P2', f: fAnil, s: core.anil.sub, r: 'AD-101', t: '10:00 - 11:00' },
            { day: 'Wed', p: 'P2', f: fSrinu, s: core.srinu.sub, r: 'CS-101', t: '10:00 - 11:00' },
            { day: 'Wed', p: 'P3', f: fNagaraju, s: core.nagraju.sub, r: 'AD-101', t: '11:00 - 12:00' },
            { day: 'Wed', p: 'P3', f: fNaresh, s: core.naresh.sub, r: 'CS-101', t: '11:00 - 12:00' },

            // Thursday
            { day: 'Thu', p: 'P1', f: fSrinu, s: electives.srinu.sub, r: 'AD-101', t: '09:00 - 10:00' },
            { day: 'Thu', p: 'P1', f: fShounak, s: electives.shounak.sub, r: 'CS-101', t: '09:00 - 10:00' },
            { day: 'Thu', p: 'P2', f: fNaresh, s: core.naresh.sub, r: 'AD-101', t: '10:00 - 11:00' },
            { day: 'Thu', p: 'P2', f: fAnil, s: electives.anil.sub, r: 'CS-101', t: '10:00 - 11:00' },
            { day: 'Thu', p: 'P3', f: fSathya, s: core.sathya.sub, r: 'AD-101', t: '11:00 - 12:00' },
            { day: 'Thu', p: 'P3', f: fNagaraju, s: electives.nagraju.sub, r: 'CS-101', t: '11:00 - 12:00' },

            // Friday
            { day: 'Fri', p: 'P1', f: fAnil, s: core.anil.sub, r: 'AD-101', t: '09:00 - 10:00' },
            { day: 'Fri', p: 'P1', f: fNaresh, s: electives.naresh.sub, r: 'CS-101', t: '09:00 - 10:00' },
            { day: 'Fri', p: 'P2', f: fShounak, s: core.shounak.sub, r: 'AD-101', t: '10:00 - 11:00' },
            { day: 'Fri', p: 'P2', f: fNagaraju, s: core.nagraju.sub, r: 'CS-101', t: '10:00 - 11:00' },
            { day: 'Fri', p: 'P3', f: fSrinu, s: core.srinu.sub, r: 'AD-101', t: '11:00 - 12:00' },
            { day: 'Fri', p: 'P3', f: fSathya, s: electives.sathya.sub, r: 'CS-101', t: '11:00 - 12:00' }
        ];

        schedule.forEach(s => {
            newSlots.push({ 
                facultyId: s.f, day: s.day, period: s.p, time: s.t, subject: s.s, location: s.r, type: 'class' 
            });
        });

        // 3. Labs (02:00 - 05:00)
        const labTime = '02:00 - 05:00';
        newSlots.push({ facultyId: fSathya, day: 'Mon', period: 'Afternoon', time: labTime, subject: 'AI Lab', location: 'AI lab', type: 'lab' });
        newSlots.push({ facultyId: fNaresh, day: 'Tue', period: 'Afternoon', time: labTime, subject: 'HPC Lab', location: 'HPC lab', type: 'lab' });
        newSlots.push({ facultyId: fSrinu, day: 'Wed', period: 'Afternoon', time: labTime, subject: 'Deep Learning Lab', location: 'HPC lab', type: 'lab' });
        newSlots.push({ facultyId: fNagaraju, day: 'Thu', period: 'Afternoon', time: labTime, subject: 'Networks Lab', location: 'AI lab', type: 'lab' });
        newSlots.push({ facultyId: fShounak, day: 'Fri', period: 'Afternoon', time: labTime, subject: 'Vision Lab', location: 'AI lab', type: 'lab' });

        // REAL-TIME TEST SLOT
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = dayNames[new Date().getDay()];
        newSlots.push({ 
            facultyId: fSathya, day: today, period: 'NightTest', time: '19:00 - 23:00', 
            subject: 'Real-time Status Sync', location: 'System Lab', type: 'class' 
        });

        await timetableCol.insertMany(newSlots);
        console.log(`Successfully added ${newSlots.length} professional timetable slots with randomized periods for CSE.`);

    } catch (err) {
        console.error('Error seeding timetable:', err);
    } finally {
        await client.close();
    }
}

setupCSETimetable();
