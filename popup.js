const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start');
const stopBtn  = document.getElementById('stop');

startBtn.onclick = () => chrome.runtime.sendMessage({ type: 'START_SESSION' });
stopBtn.onclick  = () => chrome.runtime.sendMessage({ type: 'STOP_SESSION' });

function render(state) {
  const pill = document.createElement('span');
  pill.className = 'pill ' + (state === 'focused' ? 'focused' : state === 'distracted' ? 'distracted' : '');
  pill.textContent = `State: ${state}`;
  statusEl.innerHTML = '';
  statusEl.appendChild(pill);
}

async function poll() {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (res) => {
    render(res?.state || 'unknown');
  });
}
setInterval(poll, 1000);
poll();
