const fs = require('fs');
const path = require('path');

// Production config — hardcoded for reliability
process.env.DATABASE_URL = 'postgresql://postgres:eyZtxI8QDnitGLNa@db.vxmxxoymiwpoaekgmigb.supabase.co:5432/postgres';
process.env.NEXTAUTH_SECRET = 'CVhmTyhLAckaJX/ZEBDV4Dt8VC3zB2GZsbxymybVoWw=';
process.env.NEXTAUTH_URL = 'https://www.royaljubilant.com';
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';
process.env.UV_THREADPOOL_SIZE = '4';

console.log('[app] DB: Supabase PostgreSQL');
console.log('[app] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Start standalone server
var s = path.join(__dirname, '.next', 'standalone', 'server.js');
if (fs.existsSync(s)) {
  var st = path.join(__dirname, '.next', 'static');
  var ss = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  if (!fs.existsSync(ss) && fs.existsSync(st)) {
    fs.mkdirSync(path.dirname(ss), { recursive: true });
    fs.cpSync(st, ss, { recursive: true });
  }
  var p = path.join(__dirname, 'public');
  var sp = path.join(__dirname, '.next', 'standalone', 'public');
  if (!fs.existsSync(sp) && fs.existsSync(p)) {
    fs.cpSync(p, sp, { recursive: true });
  }
  require(s);
} else {
  console.error('[app] FATAL: No build found.');
  process.exit(1);
}
