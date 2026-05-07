const toggleBtn        = document.getElementById('toggleBtn');
const radiusSlider     = document.getElementById('radiusSlider');
const radiusVal        = document.getElementById('radiusVal');
const dimSlider        = document.getElementById('dimSlider');
const dimVal           = document.getElementById('dimVal');
const dot              = document.getElementById('dot');
const changeShortcutBtn = document.getElementById('changeShortcutBtn');
const copyConfirm      = document.getElementById('copyConfirm');

let currentState = { active: false, radius: 150, dimOpacity: 0.6 };

// ── State via background ───────────────────────────────────────────────────

async function getState() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'POPUP_GET_STATE' }, (resp) => {
      resolve(resp || currentState);
    });
  });
}

async function patchState(patch) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'POPUP_SET_STATE', patch }, (resp) => {
      resolve(resp || { ...currentState, ...patch });
    });
  });
}

// ── UI ─────────────────────────────────────────────────────────────────────

function renderState(state) {
  currentState = state;

  toggleBtn.textContent = state.active ? 'Disable Spotlight' : 'Enable Spotlight';
  toggleBtn.className   = state.active ? 'on' : 'off';
  dot.className         = state.active ? 'status-dot on' : 'status-dot';

  radiusSlider.value    = state.radius;
  radiusVal.textContent = `${state.radius * 2}px`;

  const pct = Math.round((state.dimOpacity ?? 0.6) * 100);
  dimSlider.value       = pct;
  dimVal.textContent    = `${pct}%`;
}

// ── Init ───────────────────────────────────────────────────────────────────

(async () => {
  const state = await getState();
  renderState(state);
})();

// ── Toggle ─────────────────────────────────────────────────────────────────

toggleBtn.addEventListener('click', async () => {
  const updated = await patchState({ active: !currentState.active });
  renderState(updated);
});

// ── Spotlight size ─────────────────────────────────────────────────────────

radiusSlider.addEventListener('input', () => {
  const r = parseInt(radiusSlider.value, 10);
  radiusVal.textContent = `${r * 2}px`;
  currentState.radius = r;
});

radiusSlider.addEventListener('change', async () => {
  const updated = await patchState({ radius: currentState.radius });
  renderState(updated);
});

// ── Dim level ──────────────────────────────────────────────────────────────

dimSlider.addEventListener('input', () => {
  const pct = parseInt(dimSlider.value, 10);
  dimVal.textContent = `${pct}%`;
  currentState.dimOpacity = pct / 100;
});

dimSlider.addEventListener('change', async () => {
  const updated = await patchState({ dimOpacity: currentState.dimOpacity });
  renderState(updated);
});

// ── Shortcut manager button ────────────────────────────────────────────────
// Extensions cannot navigate to chrome:// URLs directly.
// Best we can do is copy the URL to clipboard so the user can paste it.

let confirmTimer;
changeShortcutBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('chrome://extensions/shortcuts');
    copyConfirm.style.opacity = '1';
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => { copyConfirm.style.opacity = '0'; }, 2500);
  } catch {
    // Clipboard not available — just show the text
    copyConfirm.textContent = 'Go to chrome://extensions/shortcuts';
    copyConfirm.style.opacity = '1';
  }
});
