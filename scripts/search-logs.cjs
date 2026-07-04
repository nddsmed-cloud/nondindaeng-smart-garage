const fs = require("fs");
const readline = require("readline");
const path = require("path");

async function main() {
  const logFile = "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\d7661530-0c2d-4796-978b-51edbe96c40f\\.system_generated\\logs\\transcript.jsonl";
  
  if (!fs.existsSync(logFile)) {
    console.log("Log file does not exist at path:", logFile);
    return;
  }

  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("Searching logs...");
  for await (const line of rl) {
    if (line.includes("wszmgkzdhgzksrifvhmf") && !line.includes("node scripts/search-logs")) {
      console.log("MATCHING LINE:", line);
    }
  }
}

main().catch(console.error);
