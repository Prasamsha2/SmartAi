const start = document.getElementById('start');
const stop  = document.getElementById('stop');
const focusInput = document.getElementById('focusMin');
const breakInput = document.getElementById('breakMin');
const timerEl = document.getElementById('timer');

function fmt(ms){
  const s = Math.max(0, Math.floor(ms/1000));
  const m = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${m}:${ss}`;
}

start.onclick = () => {
  const focusMin = Math.max(1, +focusInput.value || 25);
  const breakMin = Math.max(1, +breakInput.value || 5);
  chrome.storage.local.set({ focusMin, breakMin });
  chrome.runtime.sendMessage({ type: 'START_SESSION', payload: { focusMin, breakMin } }, () => {
    // (optional) give immediate UI feedback
    start.disabled = true; stop.disabled = false;
  });
};

stop.onclick = () => {
  chrome.runtime.sendMessage({ type: 'STOP_SESSION' }, () => {
    start.disabled = false; stop.disabled = true;
  });
};

// keep the countdown visible
function poll(){
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res)=>{
    if (!res) return;
    timerEl.textContent = fmt(res.remainingMs ?? 0);
  });
}
setInterval(poll, 800);
poll();
