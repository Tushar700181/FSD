const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userFile = path.join(__dirname, '../docs/legacy/user_output.json');
const MONGO_URI = process.env.MONGO_URI;

async function importUsers() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');
        const registry = db.collection('faculty_registry');

        if (!fs.existsSync(userFile)) {
            console.error('File not found:', userFile);
            return;
        }

        // Read UTF-16LE content
        const content = fs.readFileSync(userFile, 'utf16le');
        const legacyUsers = JSON.parse(content);

        console.log(`Read ${legacyUsers.length} legacy users.`);

        for (const user of legacyUsers) {
            const { _id, ...userData } = user;
            const objectId = new ObjectId(_id);

            // Ensure isActivated is true for these legacy users
            userData.isActivated = true;
            userData.updatedAt = new Date();

            await users.updateOne(
                { _id: objectId },
                { $set: userData },
                { upsert: true }
            );

            // If it's faculty, sync registry
            if (userData.role === 'faculty') {
                await registry.updateOne(
                    { email: userData.email.toLowerCase().trim() },
                    { 
                        $set: { 
                            fullName: userData.fullName,
                            email: userData.email,
                            idNumber: userData.idNumber,
                            department: userData.department,
                            designation: userData.designation || userData.cadre,
                            focusAreas: userData.focusAreas,
                            phone: userData.phone,
                            isRegistered: true,
                            updatedAt: new Date()
                        } 
                    },
                    { upsert: true }
                );
            }
        }

        console.log('Legacy user import complete.');
    } catch (err) {
        console.error('Error importing users:', err);
    } finally {
        await client.close();
    }
}

importUsers();
