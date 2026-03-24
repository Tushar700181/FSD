const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../docs/legacy/Faculty Details.txt');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let currentDept = '';
let deptCounts = {};
let result = [];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Detect Department
    if (line.startsWith('***') && line.endsWith('***')) {
        currentDept = line.replace(/\*/g, '').trim();
        if (!deptCounts[currentDept]) deptCounts[currentDept] = 0;
        result.push(lines[i]);
        continue;
    }
    
    // Detect Faculty Entry (e.g., "1. Dr. K. Sathya Babu")
    const facultyMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (facultyMatch) {
        const index = facultyMatch[1];
        const name = facultyMatch[2];
        const deptKey = currentDept.toLowerCase();
        
        // Generate ID
        const count = deptCounts[currentDept];
        const firstPart = 500 + count;
        const secondPart = 200 + count;
        const generatedId = `${firstPart}${deptKey}${secondPart}`;
        deptCounts[currentDept]++;
        
        // Guess Gender (Very basic, defaults to Male as requested for this list)
        const gender = 'Male'; 
        
        result.push(line);
        result.push(`* ID: ${generatedId}`);
        result.push(`* Gender: ${gender}`);
        
        // Carry on until next faculty or dept
        continue;
    }
    
    result.push(lines[i]);
}

fs.writeFileSync(filePath, result.join('\n'));
console.log('Successfully updated Faculty Details.txt with IDs and Genders.');
