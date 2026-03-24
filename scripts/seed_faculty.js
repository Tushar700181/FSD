const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedFaculty() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const usersCol = db.collection('users');

        const filePath = path.join(__dirname, '../docs/legacy/Faculty Details.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let currentDept = '';
        let currentFaculty = null;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Detect Department
            if (line.startsWith('***') && line.endsWith('***')) {
                currentDept = line.replace(/\*/g, '').trim();
                continue;
            }

            // Detect Faculty Name (starts with number like "1. Dr.")
            const nameMatch = line.match(/^\d+\.\s+(.+)$/);
            if (nameMatch) {
                if (currentFaculty) {
                    await upsertFaculty(usersCol, currentFaculty);
                }
                currentFaculty = {
                    fullName: nameMatch[1].trim(),
                    department: currentDept,
                    role: 'faculty',
                    isActivated: false,
                    createdAt: new Date()
                };
                continue;
            }

            if (currentFaculty) {
                if (line.startsWith('* Gender:')) {
                    currentFaculty.gender = line.replace('* Gender:', '').trim().toLowerCase();
                } else if (line.startsWith('* ID:')) {
                    currentFaculty.idNumber = line.replace('* ID:', '').trim();
                } else if (line.startsWith('* Qualification:')) {
                    currentFaculty.qualification = line.replace('* Qualification:', '').trim();
                } else if (line.startsWith('* Designation:')) {
                    currentFaculty.designation = line.replace('* Designation:', '').trim();
                } else if (line.startsWith('* Date of Joining:')) {
                    currentFaculty.dateOfJoining = line.replace('* Date of Joining:', '').trim();
                } else if (line.startsWith('* Email:')) {
                    currentFaculty.email = line.replace('* Email:', '').toLowerCase().trim();
                } else if (line.startsWith('* Phone:')) {
                    currentFaculty.phone = line.replace('* Phone:', '').trim();
                } else if (line.startsWith('* Area of Interest:')) {
                    currentFaculty.focusAreas = line.replace('* Area of Interest:', '').trim();
                }
            }
        }

        // Last one
        if (currentFaculty) {
            await upsertFaculty(usersCol, currentFaculty);
        }

        console.log('Faculty seeding from text file completed.');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await client.close();
    }
}

async function upsertFaculty(collection, faculty) {
    if (!faculty.email) return;

    // Check if user already exists
    const existing = await collection.findOne({ email: faculty.email });
    if (existing) {
        // Update details but don't overwrite role or password if activated
        const updateData = {
            fullName: faculty.fullName,
            designation: faculty.designation,
            department: faculty.department,
            phone: faculty.phone,
            focusAreas: faculty.focusAreas,
            gender: faculty.gender,
            idNumber: faculty.idNumber,
            updatedAt: new Date()
        };
        await collection.updateOne({ _id: existing._id }, { $set: updateData });
        console.log(`Updated faculty: ${faculty.fullName}`);
    } else {
        await collection.insertOne(faculty);
        console.log(`Inserted new faculty: ${faculty.fullName}`);
    }
}

seedFaculty();
