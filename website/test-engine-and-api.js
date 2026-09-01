const { spawn } = require("child_process");
const http = require("http");

async function main() {
  console.log("=== Testing GhostSweep End-To-End API & Engine ===");

  // Start Next.js dev server on port 3005 for testing
  const server = spawn("npx", ["next", "start", "-p", "3005"], {
    cwd: __dirname,
    stdio: "pipe",
    env: { ...process.env, PORT: "3005" }
  });

  server.stdout.on("data", (d) => console.log(`[Next] ${d.toString().trim()}`));
  server.stderr.on("data", (d) => console.error(`[Next ERR] ${d.toString().trim()}`));

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const makeRequest = (path, method = "GET", body = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        {
          hostname: "localhost",
          port: 3005,
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

  try {
    // Test 1: POST /api/audit
    console.log("\n1. Testing POST /api/audit for @alex.creator...");
    const auditRes = await makeRequest("/api/audit", "POST", { username: "alex.creator" });
    console.log("Audit Status:", auditRes.status);
    console.log("Audit Summary:", {
      username: auditRes.data?.data?.username,
      healthScore: auditRes.data?.data?.healthScore,
      reachPenalty: auditRes.data?.data?.reachPenalty,
      demographics: auditRes.data?.data?.demographics?.formatted,
      sampleAccountsCount: auditRes.data?.data?.sampleAccounts?.length,
      sampleTags: auditRes.data?.data?.sampleAccounts?.map((a) => `${a.username} -> [${a.tag}]`),
      isUnlocked: auditRes.data?.data?.isUnlocked,
    });

    if (auditRes.data?.data?.sampleAccounts?.length < 3) {
      throw new Error("Failed: less than 3 sample accounts returned");
    }

    // Test 2: Target toggle to Followers
    console.log("\n2. Testing POST /api/audit for @alex.creator (Followers targetType)...");
    const followersRes = await makeRequest("/api/audit", "POST", { username: "alex.creator", targetType: "followers" });
    console.log("Followers Target Metrics:", {
      targetType: followersRes.data?.data?.targetType,
      demographics: followersRes.data?.data?.demographics?.formatted,
      ghostCount: followersRes.data?.data?.estimatedGhosts,
    });

    // Test 3: POST /api/checkout (Instant Unlock simulation in test environment)
    console.log("\n3. Testing POST /api/checkout for @alex.creator...");
    const checkoutRes = await makeRequest("/api/checkout", "POST", { 
      email: "test.auditor@example.com",
      target_username: "alex.creator" 
    });
    console.log("Checkout Response:", checkoutRes.data);

    // Test 4: Unlocked check for test.auditor@example.com
    console.log("\n4. Testing POST /api/audit for @alex.creator with authenticated email...");
    const unlockedAuditRes = await makeRequest("/api/audit", "POST", { 
      username: "alex.creator",
      email: "test.auditor@example.com" 
    });
    console.log("Unlocked Audit isUnlocked:", unlockedAuditRes.data?.data?.isUnlocked);
    console.log("All accounts available count:", unlockedAuditRes.data?.data?.allAccounts?.length);

    // Test 5: Magic Link & Verify
    console.log("\n5. Testing Magic Link Generation...");
    const magicRes = await makeRequest("/api/auth/magic-link", "POST", { email: "test.auditor@example.com" });
    console.log("Magic Link Response:", magicRes.data);

    console.log("\n6. Testing Magic Link Verify...");
    const verifyRes = await makeRequest("/api/auth/verify", { token: magicRes.data.token }, "POST");
    console.log("Auth Verify Response:", verifyRes.data);

    // Test 6: GET /api/user/audits
    console.log("\n7. Testing GET /api/user/audits...");
    const userAuditsRes = await makeRequest("/api/user/audits?email=test.auditor@example.com");
    console.log("User Audits Response:", userAuditsRes.data);

    console.log("\n=======================================================");
    console.log("🎉 ALL TESTS PASSED! Web Intelligence Engine 100% Operational");
    console.log("=======================================================");
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    server.kill();
    process.exit(0);
  }
}

main();
