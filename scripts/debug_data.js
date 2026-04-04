const fs = require('fs');
const path = require('path');

const userFile = path.resolve('docs/legacy/user_output.json');
const timetableFile = path.resolve('data/timetable_data.json');

function validateJson(filePath, encoding) {
    console.log(`Checking ${filePath}...`);
    try {
        const content = fs.readFileSync(filePath, encoding);
        const data = JSON.parse(content);
        console.log(`- Count: ${data.length}`);
        
        let invalidIds = 0;
        data.forEach((item, index) => {
            const id = item._id || item.facultyId;
            if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
                console.log(`- Invalid ID at index ${index}: ${id}`);
                invalidIds++;
            }
        });
        console.log(`- Invalid IDs found: ${invalidIds}`);
    } catch (err) {
        console.error(`- Error reading/parsing: ${err.message}`);
    }
}

validateJson(userFile, 'utf16le');
validateJson(timetableFile, 'utf16le');
