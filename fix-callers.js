const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'lib', 'firebase.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/return getMockData\(/g, 'return await getMockData(');
code = code.replace(/const (\w+) = getMockData\(/g, 'const $1 = await getMockData(');
code = code.replace(/saveMockData\(/g, 'await saveMockData(');
// Avoid double awaits if run twice
code = code.replace(/await await/g, 'await');
code = code.replace(/return await await/g, 'return await');

fs.writeFileSync(file, code);
console.log('Fixed callers!');
