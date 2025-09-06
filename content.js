let lastMove = Date.now();
let clicks = 0, scrolls = 0;

addEventListener('mousemove', () => { lastMove = Date.now(); }, { passive: true });
addEventListener('click',   () => { clicks++; }, { passive: true });
addEventListener('wheel',   () => { scrolls++; }, { passive: true });

function sendSummary() {
  const now = Date.now();
  const idle_ms = now - lastMove;
  chrome.runtime.sendMessage({
    type: 'MOUSE_METRICS',
    payload: { idle_ms, clicks, scrolls, ts: now }
  });
  // reset counts for next window
  clicks = 0; scrolls = 0;
}
setInterval(sendSummary, 10_000); // every 10s
