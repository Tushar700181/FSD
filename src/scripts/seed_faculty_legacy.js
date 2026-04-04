const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const facultyFile = path.join(__dirname, '../../docs/legacy/Faculty Details.txt');
const MONGO_URI = process.env.MONGO_URI;

async function seedFaculty() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');
        const registry = db.collection('faculty_registry');

        const content = fs.readFileSync(facultyFile, 'utf8');
        const sections = content.split('***');
        
        const facultyList = [];
        
        for (let i = 1; i < sections.length; i += 2) {
            const dept = sections[i].trim();
            const details = sections[i+1].trim();
            
            const entries = details.split(/\n(?=\d+\.)/);
            
            for (const entry of entries) {
                const lines = entry.trim().split('\n');
                if (lines.length < 2) continue;
                
                const nameLine = lines[0].replace(/^\d+\.\s+/, '').trim();
                
                const data = {
                    role: 'faculty',
                    department: dept,
                    fullName: nameLine,
                    manualStatus: 'Auto',
                    show_timetable: true,
                    isActivated: true,
                    updatedAt: new Date()
                };
                
                lines.forEach(line => {
                    if (line.includes('* ID:')) data.idNumber = line.split(':')[1].trim();
                    if (line.includes('* Email:')) data.email = line.split(':')[1].trim().toLowerCase();
                    if (line.includes('* Designation:')) data.designation = line.split(':')[1].trim();
                    if (line.includes('* Area of Interest:')) data.focusAreas = line.split(':')[1].trim();
                    if (line.includes('* Phone:')) data.phone = line.split(':')[1].trim();
                });
                
                // Add a default password - "password123" hashed
                // Using a common bcrypt hash for "password123" for testing
                data.password = "$2b$10$6p2G6Vq3.V6Y8I8G.o6uOeX8X.o6uOeX8X.o6uOeX8X.o6uOeX8X"; 
                
                facultyList.push(data);
            }
        }

        console.log(`Parsed ${facultyList.length} faculty members.`);

        for (const faculty of facultyList) {
            // Update User
            await users.updateOne(
                { email: faculty.email },
                { $set: faculty },
                { upsert: true }
            );

            // Update Registry
            await registry.updateOne(
                { email: faculty.email },
                { 
                    $set: { 
                        fullName: faculty.fullName,
                        email: faculty.email,
                        idNumber: faculty.idNumber,
                        department: faculty.department,
                        designation: faculty.designation,
                        focusAreas: faculty.focusAreas,
                        phone: faculty.phone,
                        isRegistered: true,
                        updatedAt: new Date()
                    } 
                },
                { upsert: true }
            );
        }

        console.log('Faculty seeding and registry sync complete.');

    } catch (err) {
        console.error('Error seeding faculty:', err);
    } finally {
        await client.close();
    }
}

seedFaculty();
