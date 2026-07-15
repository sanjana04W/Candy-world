const fs = require('fs');
const f = 'src/lib/firebase.js';
let c = fs.readFileSync(f, 'utf8');

// The original corrupted script replaced `(return |const \w+ = |^\s+)(getMockData\()` with `$1await $2`
// In PowerShell, $1 and $2 were empty, so it replaced `return getMockData(` with `await `
// Wait, the output showed: `await "products", DEFAULT_PRODUCTS);`
// So `return getMockData("products", ...)` became `await "products", ...)`
// `const prods = getMockData("products", ...)` became `await "products", ...)`
// `saveMockData("products", prods);` became `await "products", prods);` 
// Wait, for `saveMockData("products", prods)`, it matched `^\s+saveMockData\(` and became `await "products", prods)`.

// I will just fetch `firebase.js` from the original git state and ONLY re-apply the auth fixes, OR since there are only ~20 lines, I'll use a regex to fix them back.

c = c.replace(/await\s+"products", DEFAULT_PRODUCTS\);/g, 'await getMockData("products", DEFAULT_PRODUCTS);');
c = c.replace(/await\s+"categories", DEFAULT_CATEGORIES\);/g, 'await getMockData("categories", DEFAULT_CATEGORIES);');
c = c.replace(/await\s+"orders", \[\]\);/g, 'await getMockData("orders", []);');
c = c.replace(/await\s+"customers", \[\]\);/g, 'await getMockData("customers", []);');
c = c.replace(/await\s+"messages", \[\]\);/g, 'await getMockData("messages", []);');
c = c.replace(/await\s+"promotions", DEFAULT_PROMOTIONS\);/g, 'await getMockData("promotions", DEFAULT_PROMOTIONS);');
c = c.replace(/await\s+"settings", DEFAULT_SETTINGS\);/g, 'await getMockData("settings", DEFAULT_SETTINGS);');
c = c.replace(/await\s+"adminUsers", DEFAULT_ADMIN_USERS\);/g, 'await getMockData("adminUsers", DEFAULT_ADMIN_USERS);');

c = c.replace(/await\s+"products", products\);/g, 'await saveMockData("products", products);');
c = c.replace(/await\s+"products", prods\);/g, 'await saveMockData("products", prods);');
c = c.replace(/await\s+"products", updated\);/g, 'await saveMockData("products", updated);');
c = c.replace(/await\s+"categories", cats\);/g, 'await saveMockData("categories", cats);');
c = c.replace(/await\s+"orders", orders\);/g, 'await saveMockData("orders", orders);');
c = c.replace(/await\s+"customers", customers\);/g, 'await saveMockData("customers", customers);');
c = c.replace(/await\s+"messages", messages\);/g, 'await saveMockData("messages", messages);');
c = c.replace(/await\s+"messages", updated\);/g, 'await saveMockData("messages", updated);');
c = c.replace(/await\s+"settings", updated\);/g, 'await saveMockData("settings", updated);');
c = c.replace(/await\s+"settings", settings\);/g, 'await saveMockData("settings", settings);');

// Wait, the variables assignments `const prods = ` and `return ` were lost!
// `return getMockData(...)` became `await ...`
// `const prods = getMockData(...)` became `await ...`
// So my script above will just leave `await getMockData(...)` without `return` or `const ... = `!
// This means the file is structurally broken.
// I MUST fetch the original file.
