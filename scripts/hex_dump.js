const fs = require('fs');
const path = require('path');

function hexDump(filePath, bytes = 100) {
    console.log(`Hex dump of ${filePath}:`);
    const buffer = fs.readFileSync(filePath);
    console.log(buffer.slice(0, bytes).toString('hex').match(/.{1,32}/g).join('\n'));
    console.log(`String (first ${bytes} bytes):`, buffer.slice(0, bytes).toString('utf8'));
}

hexDump(path.resolve('docs/legacy/user_output.json'));
hexDump(path.resolve('data/timetable_data.json'));
