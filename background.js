let running = false;
let lastState = 'unknown';
let lastFocusedTs = Date.now();
let distractedSince = null;

// simple rule based on idle time
function classify(idle_ms) {
  if (idle_ms >= 120_000) return 'distracted'; // 2+ minutes idle
  if (idle_ms < 60_000)   return 'focused';    // moving within 60s
  return lastState;                            // in-between: keep prior
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_SESSION') { running = true; sendResponse({ ok: true }); return; }
  if (msg.type === 'STOP_SESSION')  { running = false; lastState = 'unknown'; sendResponse({ ok: true }); return; }

  if (msg.type === 'MOUSE_METRICS' && running) {
    const { idle_ms } = msg.payload;
    const state = classify(idle_ms);

    if (state !== lastState) {
      lastState = state;
      if (state === 'focused') { lastFocusedTs = Date.now(); distractedSince = null; }
      if (state === 'distracted' && !distractedSince) distractedSince = Date.now();
    }

    // optional: one nudge after 5 minutes distracted (cooldown 10 min)
    maybeNotify();
  }

  if (msg.type === 'GET_STATE') {
    sendResponse({ state: lastState });
  }
  return true; // keep sendResponse alive if we ever make it async
});

// simple notification with cooldown
let lastNudgeTs = 0;
function maybeNotify() {
  const now = Date.now();
  const cool = 10 * 60_000; // 10 min
  if (lastState === 'distracted' && distractedSince && (now - distractedSince) > 5 * 60_000) {
    if (now - lastNudgeTs > cool) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Stay on task',
        message: 'You’ve been away for ~5 minutes. Quick reset?',
        priority: 2
      });
      lastNudgeTs = now;
    }
  }
}
