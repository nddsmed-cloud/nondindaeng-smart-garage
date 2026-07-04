const { execSync } = require('child_process');

process.env.VERCEL_TELEMETRY_DISABLED = "1";

const vars = {
  DATABASE_URL: "postgresql://postgres:XJFLNDhrG4GUxa5V@db.gwntflzhkuokibzohdzx.supabase.co:5432/postgres",
  DIRECT_URL: "postgresql://postgres:XJFLNDhrG4GUxa5V@db.gwntflzhkuokibzohdzx.supabase.co:5432/postgres",
  SUPABASE_URL: "https://gwntflzhkuokibzohdzx.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_79BhygdKTSzkRgmh9X_mjQ_iHZv4una"
};

for (const [key, val] of Object.entries(vars)) {
  console.log(`Adding ${key} to Vercel...`);
  try {
    execSync(`npx vercel env add ${key} production --value "${val}" --yes --force`, { 
      stdio: 'inherit',
      env: { ...process.env, VERCEL_TELEMETRY_DISABLED: '1' }
    });
  } catch (err) {
    console.error(`Failed to add ${key}:`, err.message);
  }
}
