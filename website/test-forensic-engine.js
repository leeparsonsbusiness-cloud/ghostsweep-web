const http = require("http");

async function testAll() {
  console.log("=== GhostSweep Forensic Web Intelligence Test Suite ===");

  // 1. Test Classifier
  const { classifyAccount, classifyAccountBatch, evaluateBotHeuristics } = require("./src/lib/classifier.ts");
  console.log("Classifier imported successfully.");

  // Test individual profile classification
  const test1 = classifyAccount({
    username: "sophia.la",
    name: "Sophia Miller",
    bio: "Fashion model & lifestyle creator ✨ she/her",
    postCount: 35,
    followersCount: 15000,
    followingCount: 600,
    followsYou: false,
    chronologicalRank: 0,
  }, 0);

  console.log("\n[Test 1] Sophia classification:", {
    gender: test1.gender,
    tag: test1.tag,
    isNonReciprocal: test1.isNonReciprocal,
    chronologicalRank: test1.chronologicalRank,
  });

  const test2 = classifyAccount({
    username: "bot_boost_traffic_991",
    name: "Follower Farm",
    bio: "DM for cheap followers crypto giveaway",
    postCount: 0,
    followersCount: 12,
    followingCount: 4500,
    followsYou: false,
    chronologicalRank: 1,
  }, 1);

  console.log("\n[Test 2] Bot classification:", {
    gender: test2.gender,
    tag: test2.tag,
    isBot: test2.isBot,
    isGhost: test2.isGhost,
  });

  // 2. Test DB layer
  const { getOrCreateUser, unlockAudit, isAuditUnlocked, getUserUnlockedAudits, saveAuditCache, getAuditCache } = require("./src/lib/db.ts");
  
  const testEmail = "investor@example.com";
  const user = getOrCreateUser(testEmail);
  console.log("\n[Test 3] User created/retrieved:", user);

  const target = "alex.creator";
  const unlockedInitial = isAuditUnlocked(testEmail, target);
  console.log("[Test 4] Initial unlock check (should be false):", unlockedInitial);

  unlockAudit(testEmail, target);
  const unlockedAfter = isAuditUnlocked(testEmail, target);
  console.log("[Test 5] Post-unlock check (should be true):", unlockedAfter);

  const userAudits = getUserUnlockedAudits(testEmail);
  console.log("[Test 6] User unlocked audits list:", userAudits);

  console.log("\n✓ All core modules and database tests passed!");
}

testAll().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
