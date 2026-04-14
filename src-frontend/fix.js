const fs = require('fs');
let content = fs.readFileSync('pages/dashboard/index.vue', 'utf-8');
content = content.replace(/  }\n\nconst /g, "  }\n};\n\nconst ");
content = content.replace(/  }\nconst /g, "  }\n};\nconst ");
fs.writeFileSync('pages/dashboard/index.vue', content);
