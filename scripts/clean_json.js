const fs = require('fs');
const path = require('path');

function cleanJsonFile(filePath, encoding) {
    console.log(`Cleaning ${filePath}...`);
    try {
        let content = fs.readFileSync(filePath, encoding);
        
        // Skip common log lines that might start with a bracket
        // We look for the first "[" that is followed by whitespace and "{"
        // OR the first "{" that starts an object.
        const actualJsonStart = content.search(/(\[\s*\{)|(\{\s*\")/);
        
        if (actualJsonStart > 0) {
            console.log(`- Found real JSON start at index ${actualJsonStart}. Trimming...`);
            content = content.substring(actualJsonStart);
            fs.writeFileSync(filePath, content, encoding);
            console.log(`- Successfully cleaned ${filePath}`);
        } else if (actualJsonStart === 0) {
            console.log(`- ${filePath} is already clean or start is at 0.`);
        } else {
            console.error(`- Error: No real JSON start found in ${filePath}`);
        }
    } catch (err) {
        console.error(`- Error cleaning ${filePath}: ${err.message}`);
    }
}

cleanJsonFile(path.resolve('docs/legacy/user_output.json'), 'utf16le');
cleanJsonFile(path.resolve('data/timetable_data.json'), 'utf16le');
