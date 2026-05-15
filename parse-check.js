const f = require('fs');
const p = require('path');
const src = f.readFileSync(p.join('src', 'components', 'Admin', 'RemitosHistory.jsx'), 'utf8');
try {
  require('@babel/parser').parse(src, { sourceType: 'module', plugins: ['jsx'] });
  process.stdout.write('PARSE OK\n');
} catch(e) {
  process.stdout.write('PARSE ERROR: ' + e.message.substring(0, 300) + '\n');
}
process.exit(0);
