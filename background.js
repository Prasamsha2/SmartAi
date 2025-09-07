let running = false;
let inBreak = false;
let phaseEndTs = 0;
let focusMs = 25*60_000;
let breakMs = 5*60_000;
let tickId = null;

// handle messages from popup and content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'START_SESSION') {
    const p = msg.payload || {};
    focusMs = Math.max(60_000, (p.focusMin ?? 25) * 60_000);
    breakMs = Math.max(60_000, (p.breakMin ?? 5) * 60_000);
    startSession();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'STOP_SESSION') {
    stopSession();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'GET_STATE') {
    sendResponse({ inBreak, remainingMs: Math.max(0, phaseEndTs - Date.now()) });
    return true;
  }
  return false;
});

function startSession(){
  running = true;
  inBreak = false;
  phaseEndTs = Date.now() + focusMs;
  if (tickId) clearInterval(tickId);
  tickId = setInterval(tick, 1000);
}

function stopSession(){
  running = false;
  inBreak = false;
  phaseEndTs = 0;
  if (tickId) { clearInterval(tickId); tickId = null; }
}

function tick(){
  if (!running) return;
  const now = Date.now();
  if (now >= phaseEndTs) {
    inBreak = !inBreak;
    phaseEndTs = now + (inBreak ? breakMs : focusMs);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: inBreak ? 'Break time!' : 'Focus block',
      message: inBreak ? 'Relax a bit.' : 'Let’s get back to it!'
    });
  }
}
