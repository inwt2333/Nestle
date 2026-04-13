const fs = require('fs');

const scrmPath = '/Users/inwt233/Nestle/src/scrm/scrm.service.ts';
let code = fs.readFileSync(scrmPath, 'utf8');

// Replace the 7 day task limit to ALWAYS generate a task for demo purposes, 
// as long as there is NO pending task.
code = code.replace(
  /const lastTask = customer.employeeTasks\?\.\[0\];[\s\S]*?continue;\s*}\s*}/g,
  `const pendingTask = customer.employeeTasks?.find(t => t.status === 'PENDING');
      if (pendingTask) {
        this.logger.debug(\`顾客 \${customer.nickname} 尚有未处理完的关怀任务，本次跳过\`);
        continue;
      }`
);

fs.writeFileSync(scrmPath, code, 'utf8');
console.log('SCRM Service updated.');
