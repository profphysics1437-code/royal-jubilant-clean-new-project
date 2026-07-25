const fs = require('fs');
const path = require('path');

// Production config — fallback to env vars if not set (Hostinger sets them)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:eyZtxI8QDnitGLNa@db.vxmxxoymiwpoaekgmigb.supabase.co:5432/postgres';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'CVhmTyhLAckaJX/ZEBDV4Dt8VC3zB2GZsbxymybVoWw=';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://www.royaljubilant.com';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('[app] DB: Supabase PostgreSQL');
console.log('[app] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Try standalone server first, fall back to next start
var s = path.join(__dirname, '.next', 'standalone', 'server.js');
if (fs.existsSync(s)) {
  // Copy static files if needed
  var st = path.join(__dirname, '.next', 'static');
  var ss = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  if (!fs.existsSync(ss) && fs.existsSync(st)) {
    try {
      fs.mkdirSync(path.dirname(ss), { recursive: true });
      fs.cpSync(st, ss, { recursive: true });
    } catch(e) { console.error('[app] Static copy error:', e.message); }
  }
  var p = path.join(__dirname, 'public');
  var sp = path.join(__dirname, '.next', 'standalone', 'public');
  if (!fs.existsSync(sp) && fs.existsSync(p)) {
    try {
      fs.cpSync(p, sp, { recursive: true });
    } catch(e) { console.error('[app] Public copy error:', e.message); }
  }
  require(s);
} else {
  // Fallback: use next start (requires .next build)
  console.log('[app] No standalone found, using next start...');
  const { execSync } = require('child_process');
  try {
    execSync('npx next start -p ' + process.env.PORT, { stdio: 'inherit', env: process.env });
  } catch (e) {
    console.error('[app] FATAL: No build found.');
    process.exit(1);
  }
}
