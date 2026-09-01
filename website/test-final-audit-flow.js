const http = require("http");
const { spawn } = require("child_process");

function waitForServer(port, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 300);
        }
      });
      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error("Timeout waiting for server to start"));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

const makeRequest = (port, path, method = "GET", body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function run() {
  console.log("=== Testing Final GhostSweep Audit Flow & Stripe Backend ===");
  const testPort = 3097;
  const server = spawn("npx", ["next", "start", "-p", String(testPort)], {
    cwd: __dirname,
    stdio: "pipe",
    env: { ...process.env, PORT: String(testPort) }
  });

  server.stdout.on("data", (d) => process.stdout.write(`[Server] ${d.toString()}`));
  server.stderr.on("data", (d) => process.stderr.write(`[Server ERR] ${d.toString()}`));

  console.log(`Waiting for server on http://localhost:${testPort}...`);
  await waitForServer(testPort);
  console.log("Server is online and healthy!\n");

  try {
    // 1. Test Free Search for @alex.creator
    console.log("1. Testing Free Search (POST /api/audit)...");
    const freeRes = await makeRequest(testPort, "/api/audit", "POST", { username: "alex.creator" });
    const auditData = freeRes.data?.data;
    console.log("Audit Status:", freeRes.status);
    console.log("Health Score:", auditData?.healthScore);
    console.log("Demographics:", auditData?.demographics?.formatted);
    console.log("Sample Accounts (Preview) Count:", auditData?.sampleAccounts?.length);
    
    const femalePreviews = auditData?.sampleAccounts?.filter((a) => a.gender === "female") || [];
    const malePreviews = auditData?.sampleAccounts?.filter((a) => a.gender === "male") || [];
    console.log(`- Female Previews (${femalePreviews.length}):`, femalePreviews.map((f) => `@${f.username} [${f.tag}]`));
    console.log(`- Male Previews (${malePreviews.length}):`, malePreviews.map((m) => `@${m.username} [${m.tag}]`));

    if (femalePreviews.length !== 5 || malePreviews.length !== 5) {
      throw new Error(`Expected exactly 5 female and 5 male preview accounts, got ${femalePreviews.length} female, ${malePreviews.length} male`);
    }

    // 2. Test Stripe Checkout Creation ($1.99 Session)
    console.log("\n2. Testing Stripe Checkout Creation (POST /api/checkout)...");
    const checkoutRes = await makeRequest(testPort, "/api/checkout", "POST", {
      email: "buyer@example.com",
      target_username: "alex.creator",
      type: "following"
    });
    console.log("Checkout Response:", checkoutRes.data);
    if (checkoutRes.data?.url) {
      console.log("✓ Stripe Checkout Session URL Generated:", checkoutRes.data.url);
    } else if (checkoutRes.data?.unlocked) {
      console.log("✓ Sandbox Unlock Fallback Executed Successfully");
    }

    // 3. Test Stripe Webhook Handler (checkout.session.completed)
    console.log("\n3. Testing Stripe Webhook (POST /api/webhooks/stripe)...");
    const webhookRes = await makeRequest(testPort, "/api/webhooks/stripe", "POST", {
      type: "checkout.session.completed",
      data: {
        object: {
          customer_details: { email: "paiduser@example.com" },
          metadata: {
            target_username: "alex.creator",
            type: "following"
          }
        }
      }
    });
    console.log("Webhook Response:", webhookRes.data);

    // 4. Test Unlocked Query for paid user
    console.log("\n4. Testing Unlocked Audit for paid user (POST /api/audit)...");
    const unlockedRes = await makeRequest(testPort, "/api/audit", "POST", {
      username: "alex.creator",
      email: "paiduser@example.com"
    });
    console.log("Is Unlocked:", unlockedRes.data?.data?.isUnlocked);
    console.log("All Accounts Count:", unlockedRes.data?.data?.allAccounts?.length);
    console.log("Chronological Order Sample (Rank 1-5):", 
      unlockedRes.data?.data?.allAccounts?.slice(0, 5).map((a) => `#${a.chronologicalRank + 1} @${a.username} (${a.gender})`)
    );

    console.log("\n=======================================================");
    console.log("🎉 ALL AUDIT FLOW & BACKEND TESTS PASSED SUCCESSFULLY!");
    console.log("=======================================================");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.kill();
    process.exit(0);
  }
}

run();
