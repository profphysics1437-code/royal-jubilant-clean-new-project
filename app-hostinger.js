const fs = require('fs');
const path = require('path');

// Production config — fallback to env vars if not set (Hostinger sets them)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:eyZtxI8QDnitGLNa@db.vxmxxoymiwpoaekgmigb.supabase.co:5432/postgres';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'CVhmTyhLAckaJX/ZEBDV4Dt8VC3zB2GZsbxymybVoWw=';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'https://www.royaljubilant.com';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('[app] DB: Supabase PostgreSQL');
console.log('[app] PORT:', process.env.PORT);

// Use next start directly (Hostinger builds to .next, not standalone)
const { execSync } = require('child_process');
try {
  execSync('npx next start -p ' + process.env.PORT, { stdio: 'inherit', env: process.env });
} catch (e) {
  // Fallback to standalone if available
  var s = path.join(__dirname, '.next', 'standalone', 'server.js');
  if (fs.existsSync(s)) {
    console.log('[app] Falling back to standalone...');
    require(s);
  } else {
    console.error('[app] FATAL: No build found.');
    process.exit(1);
  }
}
