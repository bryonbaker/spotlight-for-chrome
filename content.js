(() => {
  if (window.__spotlightLoaded) return;
  window.__spotlightLoaded = true;

  const isTopFrame = (window === window.top);

  // ── State ─────────────────────────────────────────────────────────────────
  let active = false;
  let dimOpacity = 0.6;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let radius = 150;
  const MIN_RADIUS = 30;
  const MAX_RADIUS = 600;

  // ── Overlay ───────────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__spotlight_overlay__';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  });

  // ── Size toast ────────────────────────────────────────────────────────────
  let sizeToastTimer;
  const sizeToast = document.createElement('div');
  Object.assign(sizeToast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    background: 'rgba(0,0,0,0.75)',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '13px',
    padding: '6px 14px',
    borderRadius: '20px',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease',
    whiteSpace: 'nowrap',
  });

  function showSizeToast() {
    sizeToast.textContent = `Spotlight: ${radius * 2}px`;
    sizeToast.style.opacity = '1';
    clearTimeout(sizeToastTimer);
    sizeToastTimer = setTimeout(() => { sizeToast.style.opacity = '0'; }, 1200);
  }

  // ── Rendering ─────────────────────────────────────────────────────────────
  function buildMask(x, y, r) {
    const soft = Math.round(r * 0.12);
    return `radial-gradient(circle ${r}px at ${x}px ${y}px, transparent ${r - soft}px, rgba(0,0,0,${dimOpacity}) ${r + soft}px)`;
  }

  function updateOverlay() {
    overlay.style.background = buildMask(mouseX, mouseY, radius);
  }

  // ── Mount / unmount ───────────────────────────────────────────────────────
  function ensureMounted() {
    const target = document.body || document.documentElement;
    if (!target) return;
    if (!target.contains(overlay)) {
      target.appendChild(overlay);
      target.appendChild(sizeToast);
    }
  }

  function mount() {
    ensureMounted();
    updateOverlay();
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  }

  function unmount() {
    overlay.style.opacity = '0';
    sizeToast.style.opacity = '0';
  }

  // ── Apply state ───────────────────────────────────────────────────────────
  function applyState(state) {
    if (state.radius !== undefined) radius = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, state.radius));
    if (state.dimOpacity !== undefined) dimOpacity = state.dimOpacity;

    const wasActive = active;
    if (state.active !== undefined) active = state.active;

    if (active && !wasActive) mount();
    else if (!active && wasActive) unmount();
    else if (active) updateOverlay();
  }

  // ── Broadcast state to sub-frames (top frame only) ────────────────────────
  function broadcastStateToSubframes(state) {
    for (const iframe of document.querySelectorAll('iframe')) {
      try {
        iframe.contentWindow.postMessage({ type: '__SPOTLIGHT_STATE__', state }, '*');
      } catch { }
    }
  }

  // Sub-frames receive state from top frame
  if (!isTopFrame) {
    window.addEventListener('message', (e) => {
      if (e.data?.type === '__SPOTLIGHT_STATE__') {
        applyState(e.data.state);
      }
    });
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (active) updateOverlay();
  }, { passive: true });

  document.addEventListener('wheel', (e) => {
    if (!active || !e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -15 : 15;
    radius = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, radius + delta));
    updateOverlay();
    showSizeToast();
    chrome.runtime.sendMessage({ type: 'POPUP_SET_STATE', patch: { radius } }).catch(() => {});
    if (isTopFrame) broadcastStateToSubframes({ radius });
  }, { passive: false });

  // ── Message bridge ────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'SPOTLIGHT_PING') {
      sendResponse({ alive: true, isTopFrame });
      return;
    }
    if (msg.type === 'SPOTLIGHT_SET_STATE') {
      applyState(msg.state);
      if (isTopFrame) broadcastStateToSubframes(msg.state);
      sendResponse({ ok: true });
      return;
    }
    if (msg.type === 'SPOTLIGHT_GET_STATE') {
      sendResponse({ active, radius, dimOpacity });
      return;
    }
  });
})();
