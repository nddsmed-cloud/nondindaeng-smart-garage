const { Client } = require("pg");

async function testConnection(host, user, password) {
  const connectionString = `postgresql://${user}:${password}@${host}:5432/postgres`;
  const client = new Client({ connectionString });
  try {
    console.log(`Testing connection to ${host}...`);
    await client.connect();
    console.log(`SUCCESS: Connected to ${host}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILED to connect to ${host}:`, err.message);
    return false;
  }
}

async function main() {
  const pwd = "XJFLNDhrG4GUxa5V";
  
  // Test wszmgkzdhgzksrifvhmf with pooler hosts
  await testConnection("aws-0-ap-southeast-1.pooler.supabase.com", "postgres.wszmgkzdhgzksrifvhmf", pwd);
  await testConnection("aws-1-ap-southeast-1.pooler.supabase.com", "postgres.wszmgkzdhgzksrifvhmf", pwd);
  
  // Test uoodvtpybtfxlfuduxwq (old project) with its original password from .env
  await testConnection("aws-1-ap-southeast-1.pooler.supabase.com", "postgres.uoodvtpybtfxlfuduxwq", "3pr0JITO1ceKsEXP");
}

main().catch(console.error);
