const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function reseed() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const usersCol = db.collection('users');
        const registryCol = db.collection('faculty_registry');

        console.log('Clearing existing faculty data...');
        await usersCol.deleteMany({ role: 'faculty' });
        await registryCol.deleteMany({});

        const filePath = path.join(__dirname, '../docs/legacy/Faculty Details.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const sections = content.split('***');
        
        const facultyList = [];
        let idCounter = BigInt('0x69b72c9a5acb012ef3da96c7');

        for (let i = 1; i < sections.length; i += 2) {
            const dept = sections[i].trim();
            const details = sections[i+1].trim();
            const entries = details.split(/\n(?=\d+\.)/);
            
            for (const entry of entries) {
                const lines = entry.trim().split('\n');
                if (lines.length < 2) continue;
                
                const nameLine = lines[0].replace(/^\d+\.\s+/, '').trim();
                const facultyId = idCounter.toString(16).padStart(24, '0');
                idCounter++;

                const data = {
                    _id: new ObjectId(facultyId),
                    role: 'faculty',
                    department: dept,
                    fullName: nameLine,
                    manualStatus: 'Auto',
                    show_timetable: true,
                    isActivated: true,
                    updatedAt: new Date(),
                    password: "$2b$10$6p2G6Vq3.V6Y8I8G.o6uOeX8X.o6uOeX8X.o6uOeX8X.o6uOeX8X" // "password123"
                };
                
                lines.forEach(line => {
                    if (line.includes('* ID:')) data.idNumber = line.split(':')[1].trim();
                    if (line.includes('* Email:')) data.email = line.split(':')[1].trim().toLowerCase();
                    if (line.includes('* Designation:')) data.designation = line.split(':')[1].trim();
                    if (line.includes('* Area of Interest:')) data.focusAreas = line.split(':')[1].trim();
                    if (line.includes('* Phone:')) data.phone = line.split(':')[1].trim();
                });
                
                facultyList.push(data);
            }
        }

        console.log(`Parsed ${facultyList.length} faculty members.`);

        for (let i = 0; i < facultyList.length; i++) {
            const faculty = facultyList[i];
            
            // For the first 23 faculty, insert into both users and registry
            // For the last 3, ONLY insert into registry with isRegistered: false to demo signup/activation
            
            const isDemoUser = (i >= facultyList.length - 3);

            if (!isDemoUser) {
                await usersCol.insertOne(faculty);
            }

            await registryCol.insertOne({
                fullName: faculty.fullName,
                email: faculty.email,
                idNumber: faculty.idNumber,
                department: faculty.department,
                designation: faculty.designation,
                focusAreas: faculty.focusAreas,
                phone: faculty.phone,
                isRegistered: !isDemoUser,
                updatedAt: new Date()
            });

            console.log(`${isDemoUser ? 'PRE-REGISTERED' : 'ACTIVATED'}: ${faculty.fullName}`);
        }

        console.log('Final Faculty Reseed Complete.');
    } catch (err) {
        console.error('Reseed error:', err);
    } finally {
        await client.close();
    }
}

reseed();
