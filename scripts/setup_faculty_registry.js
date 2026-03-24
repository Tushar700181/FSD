const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupRegistry() {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const registryCol = db.collection('faculty_registry');
        const usersCol = db.collection('users');

        // 1. Clear existing registry
        await registryCol.deleteMany({});

        const filePath = path.join(__dirname, '../docs/legacy/Faculty Details.txt');
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let currentDept = '';
        let currentFaculty = null;
        let count = 0;

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith('***') && line.endsWith('***')) {
                currentDept = line.replace(/\*/g, '').trim();
                continue;
            }

            const nameMatch = line.match(/^\d+\.\s+(.+)$/);
            if (nameMatch) {
                if (currentFaculty) {
                    await registryCol.insertOne(currentFaculty);
                    count++;
                }
                currentFaculty = {
                    fullName: nameMatch[1].trim(),
                    department: currentDept,
                    isRegistered: false,
                    updatedAt: new Date()
                };
                continue;
            }

            if (currentFaculty) {
                if (line.startsWith('* ID:')) {
                    currentFaculty.idNumber = line.replace('* ID:', '').trim();
                } else if (line.startsWith('* Gender:')) {
                    currentFaculty.gender = line.replace('* Gender:', '').trim().toLowerCase();
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

        if (currentFaculty) {
            await registryCol.insertOne(currentFaculty);
            count++;
        }

        // 2. Mark those already in 'users' as isRegistered: true
        const activatedFaculty = await usersCol.find({ role: 'faculty' }).toArray();
        for (const user of activatedFaculty) {
            await registryCol.updateOne(
                { email: user.email },
                { $set: { isRegistered: true } }
            );
        }

        console.log(`Faculty Registry setup completed. ${count} records inserted.`);
    } catch (err) {
        console.error('Setup error:', err);
    } finally {
        await client.close();
    }
}

setupRegistry();
