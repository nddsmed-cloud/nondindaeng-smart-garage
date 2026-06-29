const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('.env', 'utf-8');
const lines = envContent.split('\n');

for (let line of lines) {
  line = line.trim();
  if (!line || line.startsWith('#')) continue;
  
  const equalIdx = line.indexOf('=');
  if (equalIdx === -1) continue;
  
  const key = line.substring(0, equalIdx).trim();
  let val = line.substring(equalIdx + 1).trim();
  
  // Remove wrapping quotes if present
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.substring(1, val.length - 1);
  } else if (val.startsWith("'") && val.endsWith("'")) {
    val = val.substring(1, val.length - 1);
  }
  
  if (!key) continue;
  
  console.log(`Adding ${key} to Vercel...`);
  try {
    // Add to production
    execSync(`npx vercel env add ${key} production --value "${val}" --yes --force`, { stdio: 'inherit' });
    // Add to preview
    execSync(`npx vercel env add ${key} preview --value "${val}" --yes --force`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to add ${key}:`, err.message);
  }
}
