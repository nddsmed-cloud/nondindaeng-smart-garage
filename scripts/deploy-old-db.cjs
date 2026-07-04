const { execSync } = require('child_process');
const fs = require('fs');

process.env.VERCEL_TELEMETRY_DISABLED = "1";

const oldVars = {
  DATABASE_URL: "postgresql://postgres.uoodvtpybtfxlfuduxwq:3pr0JITO1ceKsEXP@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres.uoodvtpybtfxlfuduxwq:3pr0JITO1ceKsEXP@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
  SUPABASE_URL: "https://uoodvtpybtfxlfuduxwq.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_rAvvhS8PA6tTSuLZEVl33g_rchHSaoO"
};

function runVercelCommand(args) {
  const cmd = `node node_modules\\vercel\\dist\\index.js ${args}`;
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { 
      stdio: 'inherit',
      timeout: 20000, // 20s timeout to prevent hanging
      env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' }
    });
  } catch (err) {
    console.log(`Command finished (or timed out/error): ${err.message}`);
  }
}

async function main() {
  // 1. Revert Vercel dashboard environment variables
  for (const [key, val] of Object.entries(oldVars)) {
    console.log(`\n--- Resetting ${key} ---`);
    runVercelCommand(`env rm ${key} production --yes`);
    runVercelCommand(`env add ${key} production --value "${val}" --yes --force`);
  }

  // 2. Trigger deployment
  console.log("\n--- Triggering Vercel Deployment ---");
  runVercelCommand("deploy --prod --yes");
}

main().catch(console.error);
