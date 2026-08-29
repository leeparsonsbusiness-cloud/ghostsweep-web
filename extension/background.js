// GhostSweep Self-Healing Autonomous Engine (15-Minute Staged Cycles)
importScripts('ExtPay.js');
const extpay = ExtPay('ghostsweep');
extpay.startBackground();

console.log('GhostSweep 15-Minute Staged Engine active.');

const SESSION_CAP = 18; // Max unfollows per session
const SESSION_REST_MINUTES = 15; // 15-minute rest between sessions
const COOLDOWN_RECOVERY_MINUTES = 15; // 15-minute cooldown if Meta flags a burst

let isQueueProcessing = false;

// ================= STARTUP / CRASH RECOVERY =================
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
  const state = data.ghostsweep_queue_state;

  if (state && state.isAutoPilot && state.currentIndex < state.targetIds.length) {
    const now = Date.now();
    if (!state.nextRunTimestamp || now >= state.nextRunTimestamp) {
      // Alarm time already passed while Mac was off -> Wake up immediately
      state.status = 'ACTIVE';
      state.nextRunTimestamp = null;
      state.statusMessage = `⏰ Mac restarted. Resuming Session ${state.currentSessionNum}...`;
      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);
      runAutonomousLoop();
    } else {
      // Re-schedule the remaining alarm time
      const remainingMinutes = Math.max(1, Math.ceil((state.nextRunTimestamp - now) / 60000));
      const alarmName = state.status === 'COOLDOWN_SLEEP' ? 'GHOSTSWEEP_RECOVERY_ALARM' : 'GHOSTSWEEP_NEXT_SESSION';
      chrome.alarms.create(alarmName, { delayInMinutes: remainingMinutes });
    }
  }
});

// ================= CHROME ALARM DISPATCHER =================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'GHOSTSWEEP_NEXT_SESSION' || alarm.name === 'GHOSTSWEEP_RECOVERY_ALARM') {
    const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
    const state = data.ghostsweep_queue_state;

    if (!state || !state.isAutoPilot || state.currentIndex >= state.targetIds.length) {
      return;
    }

    if (alarm.name === 'GHOSTSWEEP_RECOVERY_ALARM') {
      state.status = 'CANARY_PROBE';
      state.statusMessage = '🔍 15m cooldown elapsed. Sending test probe...';
      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);
      runCanaryProbe();
    } else {
      state.status = 'ACTIVE';
      state.nextRunTimestamp = null;
      state.statusMessage = `⏰ Waking up for Session ${state.currentSessionNum}...`;
      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);
      runAutonomousLoop();
    }
  }
});

// ================= MESSAGE ROUTER =================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_AUTOPILOT_QUEUE') {
    startOneClickSweep(request.targets, request.initialFollowing, request.followersCount).then(sendResponse);
    return true;
  }
  if (request.action === 'STOP_BACKGROUND_QUEUE') {
    stopSweep().then(sendResponse);
    return true;
  }
  if (request.action === 'GET_QUEUE_STATE') {
    chrome.storage.local.get(['ghostsweep_queue_state'], (res) => {
      sendResponse(res.ghostsweep_queue_state || null);
    });
    return true;
  }
});

async function startOneClickSweep(targets, initialFollowing = 0, followersCount = 0) {
  if (!targets || targets.length === 0) return { success: false, error: 'No accounts selected.' };

  await chrome.alarms.clearAll();
  const totalSessions = Math.ceil(targets.length / SESSION_CAP);

  const state = {
    isAutoPilot: true,
    status: 'ACTIVE',
    targetIds: targets.map(u => ({ id: u.id, username: u.username })),
    currentIndex: 0,
    completed: 0,
    total: targets.length,
    sessionCap: SESSION_CAP,
    currentSessionNum: 1,
    totalSessions: totalSessions,
    nextRunTimestamp: null,
    cooldownRetries: 0,
    initialFollowing,
    followersCount,
    statusMessage: `🚀 Session 1 of ${totalSessions}: Unfollowing next 18 accounts...`
  };

  await chrome.storage.local.set({ ghostsweep_queue_state: state });
  broadcastState(state);

  if (!isQueueProcessing) {
    runAutonomousLoop();
  }
  return { success: true };
}

async function stopSweep() {
  isQueueProcessing = false;
  await chrome.alarms.clearAll();
  const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
  const state = data.ghostsweep_queue_state || {};
  state.isAutoPilot = false;
  state.status = 'PAUSED';
  state.nextRunTimestamp = null;
  state.statusMessage = 'Sweep paused by user.';
  await chrome.storage.local.set({ ghostsweep_queue_state: state });
  broadcastState(state);
  return { success: true };
}

async function getActiveInstagramTab() {
  const tabs = await chrome.tabs.query({ url: 'https://*.instagram.com/*' });
  return tabs.length > 0 ? tabs[0] : null;
}

// ================= CANARY PROBE HANDLER =================
async function runCanaryProbe() {
  const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
  const state = data.ghostsweep_queue_state;
  if (!state || state.currentIndex >= state.targetIds.length) return;

  const target = state.targetIds[state.currentIndex];
  const igTab = await getActiveInstagramTab();

  if (!igTab) {
    scheduleAlarm('GHOSTSWEEP_RECOVERY_ALARM', 5);
    state.statusMessage = '⚠️ IG tab closed. Retrying probe in 5m...';
    await chrome.storage.local.set({ ghostsweep_queue_state: state });
    broadcastState(state);
    return;
  }

  const result = await executeUnfollowOnTab(igTab.id, target.id);

  if (result.success) {
    state.completed += 1;
    state.currentIndex += 1;
    state.cooldownRetries = 0;
    state.status = 'ACTIVE';
    state.statusMessage = `✅ Probe successful! Resuming session...`;
    await chrome.storage.local.set({ ghostsweep_queue_state: state });
    broadcastState(state);

    if (!isQueueProcessing) {
      runAutonomousLoop();
    }
  } else {
    state.cooldownRetries = (state.cooldownRetries || 0) + 1;
    const nextTimestamp = Date.now() + (COOLDOWN_RECOVERY_MINUTES * 60 * 1000);

    state.status = 'COOLDOWN_SLEEP';
    state.nextRunTimestamp = nextTimestamp;
    state.statusMessage = `🛡️ Limit still active. Waiting ${COOLDOWN_RECOVERY_MINUTES}m to retry probe...`;

    await chrome.storage.local.set({ ghostsweep_queue_state: state });
    broadcastState(state);

    scheduleAlarm('GHOSTSWEEP_RECOVERY_ALARM', COOLDOWN_RECOVERY_MINUTES);
  }
}

// ================= CORE AUTONOMOUS WORKER =================
async function runAutonomousLoop() {
  isQueueProcessing = true;
  let sessionActionCount = 0;

  while (isQueueProcessing) {
    const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
    const state = data.ghostsweep_queue_state;

    if (!state || !state.isAutoPilot || state.currentIndex >= state.targetIds.length) {
      if (state && state.isAutoPilot) {
        state.isAutoPilot = false;
        state.status = 'COMPLETED';
        state.nextRunTimestamp = null;
        state.statusMessage = '🎉 All accounts swept successfully!';
        await chrome.storage.local.set({ ghostsweep_queue_state: state });
        broadcastState(state);
      }
      break;
    }

    // Session Cap Reached -> Rest 15 Minutes
    if (sessionActionCount >= SESSION_CAP) {
      const nextTimestamp = Date.now() + (SESSION_REST_MINUTES * 60 * 1000);
      state.status = 'SESSION_REST';
      state.currentSessionNum += 1;
      state.nextRunTimestamp = nextTimestamp;
      state.statusMessage = `☕ Session complete (${state.completed}/${state.total} cleaned). Next session in ${SESSION_REST_MINUTES}m.`;

      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);

      scheduleAlarm('GHOSTSWEEP_NEXT_SESSION', SESSION_REST_MINUTES);
      break;
    }

    const currentTarget = state.targetIds[state.currentIndex];
    state.status = 'ACTIVE';
    state.statusMessage = `[Sess ${state.currentSessionNum}/${state.totalSessions}] Unfollowing @${currentTarget.username}...`;
    await chrome.storage.local.set({ ghostsweep_queue_state: state });
    broadcastState(state);

    const igTab = await getActiveInstagramTab();
    if (!igTab) {
      state.statusMessage = 'Waiting for an active Instagram tab...';
      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

    const result = await executeUnfollowOnTab(igTab.id, currentTarget.id);

    // Cooldown Caught -> Enter 15-Minute Recovery Sleep
    if (result.error === 'rate_limit' || result.error === 'action_blocked' || result.status === 429 || result.status === 400 || result.status === 403) {
      const nextTimestamp = Date.now() + (COOLDOWN_RECOVERY_MINUTES * 60 * 1000);
      state.status = 'COOLDOWN_SLEEP';
      state.nextRunTimestamp = nextTimestamp;
      state.statusMessage = `🛡️ Meta limit. Sleeping ${COOLDOWN_RECOVERY_MINUTES}m before auto-probe...`;

      await chrome.storage.local.set({ ghostsweep_queue_state: state });
      broadcastState(state);

      scheduleAlarm('GHOSTSWEEP_RECOVERY_ALARM', COOLDOWN_RECOVERY_MINUTES);
      break;
    }

    if (result.success) {
      state.completed += 1;
      sessionActionCount += 1;
    }

    state.currentIndex += 1;
    await chrome.storage.local.set({ ghostsweep_queue_state: state });
    broadcastState(state);

    // Humanized 8s–12s delay + micro-pause every 5 accounts
    if (state.currentIndex < state.targetIds.length && sessionActionCount < SESSION_CAP) {
      let waitMs = Math.floor(Math.random() * 4000) + 8000;
      if (sessionActionCount % 5 === 0) {
        waitMs += 8000;
      }
      await new Promise(r => setTimeout(r, waitMs));
    }
  }

  isQueueProcessing = false;
}

function executeUnfollowOnTab(tabId, targetUserId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'EXECUTE_UNFOLLOW', userId: targetUserId }, (res) => {
      if (chrome.runtime.lastError || !res) {
        resolve({ success: false, error: 'disconnected', message: chrome.runtime.lastError?.message || 'Disconnected' });
      } else {
        resolve(res);
      }
    });
  });
}

function scheduleAlarm(name, delayInMinutes) {
  chrome.alarms.create(name, { delayInMinutes });
}

function broadcastState(state) {
  chrome.runtime.sendMessage({ action: 'QUEUE_STATE_CHANGED', state }).catch(() => {});
}