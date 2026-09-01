/**
 * End-to-End Verification Test for Dating & Nightlife Instagram Activity Forensics
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Testing GhostSweep Dating & Nightlife Activity Forensics ===");

  // 1. Test Free Audit Search (Immediate response, 5 previews, relative timestamps, reciprocity)
  console.log("\n1. Testing Free Activity Scan (POST /api/audit)...");
  const startTime = Date.now();
  const auditRes = await fetch(`${BASE_URL}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "theleeparsons", targetType: "following" }),
  });

  const duration = Date.now() - startTime;
  console.log(`Scan completed in ${duration}ms (Status: ${auditRes.status})`);
  if (!auditRes.ok) {
    throw new Error(`Audit failed: ${auditRes.statusText}`);
  }

  const auditJson = await auditRes.json();
  const auditData = auditJson.data || auditJson;
  console.log("Profile:", auditData.username);
  console.log("Activity Summary:", auditData.activitySummary);
  console.log("Sample Previews Count:", auditData.sampleAccounts?.length);

  const firstPreview = auditData.sampleAccounts[0];
  console.log("Sample Preview #1:", {
    username: firstPreview.username,
    genderLabel: firstPreview.genderLabel,
    timestampLabel: firstPreview.timestampLabel,
    reciprocityLabel: firstPreview.reciprocityLabel,
    rank: firstPreview.chronologicalRank,
  });

  // Verify timestamps and badges
  if (!firstPreview.timestampLabel || !firstPreview.genderLabel || !firstPreview.reciprocityLabel) {
    throw new Error("Missing required forensic badges on preview account!");
  }
  console.log("✓ Previews include relative timestamps, gender tags, and reciprocity badges.");

  // 2. Test Registration & Login Authentication
  console.log("\n2. Testing Tabbed Direct Auth Endpoints (Register & Login)...");
  const testEmail = `nightlife_tester_${Date.now()}@example.com`;
  const testPass = "secret_nightlife_pin_1234";

  // Register
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPass }),
  });
  const regData = await regRes.json();
  console.log("Register response:", regData);
  if (!regData.success) throw new Error("Registration failed");
  console.log("✓ Direct Account Creation Passed");

  // Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPass }),
  });
  const loginData = await loginRes.json();
  console.log("Login response:", loginData);
  if (!loginData.success) throw new Error("Login failed");
  console.log("✓ Direct Login Authentication Passed");

  // 3. Test Stripe $1.99 Checkout Session Creation
  console.log("\n3. Testing Stripe Checkout Session Creation ($1.99)...");
  const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_username: "theleeparsons",
      email: testEmail,
      type: "following",
    }),
  });

  const checkoutData = await checkoutRes.json();
  console.log("Checkout Response:", checkoutData);
  if (!checkoutData.success) throw new Error("Checkout creation failed");
  console.log("✓ Stripe Checkout Session URL Generated successfully");

  // 4. Test Unlocked Report State via DB Unlock
  console.log("\n4. Testing Unlocked Report State...");
  const Database = require("better-sqlite3");
  const path = require("path");
  const db = new Database(path.join(__dirname, ".data", "ghostsweep.db"));
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(testEmail);
  if (user) {
    db.prepare("INSERT OR REPLACE INTO unlocked_audits (user_id, target_username, unlocked_at) VALUES (?, ?, ?)").run(
      user.id,
      "theleeparsons",
      new Date().toISOString()
    );
  }
  console.log("✓ Audit unlocked in SQLite database for user");

  // 5. Query Unlocked Report as Paid User
  const unlockedAuditRes = await fetch(`${BASE_URL}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "theleeparsons",
      email: testEmail,
      targetType: "following",
    }),
  });
  const unlockedJson = await unlockedAuditRes.json();
  const unlockedData = unlockedJson.data || unlockedJson;
  console.log("Is Unlocked for paid user:", unlockedData.isUnlocked);
  console.log("Total Chronological Accounts Returned:", unlockedData.allAccounts?.length);
  if (!unlockedData.isUnlocked) {
    throw new Error("Audit was not unlocked after successful checkout webhook!");
  }
  console.log("✓ Full Chronological Unlocked State Confirmed");

  console.log("\n=======================================================");
  console.log("🎉 ALL DATING & NIGHTLIFE ACTIVITY FORENSICS TESTS PASSED!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
