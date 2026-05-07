// ── background.js ─────────────────────────────────────────────────────────
//
// State is stored in chrome.storage.local and pushed to tabs via
// chrome.tabs.sendMessage (top frame only — content.js then broadcasts
// to sub-frames via postMessage, which works without needing frame IDs).

const DEFAULT_STATE = {
  active: false,
  radius: 150,
  dimOpacity: 0.6,
};

async function getState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_STATE, resolve);
  });
}

async function saveState(patch) {
  return new Promise((resolve) => {
    chrome.storage.local.set(patch, resolve);
  });
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Send state to the top frame of a tab.
// content.js (all_frames:true) is already injected by the manifest into all
// frames on page load — no manual injection needed in most cases.
// We only need to manually inject if the script isn't present yet
// (e.g. the extension was just installed/reloaded on an existing tab).
async function applyStateToTab(tabId, state) {
  // Ping top frame
  let alive = false;
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SPOTLIGHT_PING' }, { frameId: 0 });
    alive = true;
  } catch { alive = false; }

  // If not alive, manually inject (handles tabs open before extension loaded)
  if (!alive) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['content.js'],
      });
    } catch (err) {
      console.warn('Spotlight: injection failed for tab', tabId, err.message);
      return;
    }
  }

  // Send state to top frame; content.js will broadcast to sub-frames
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SPOTLIGHT_SET_STATE', state }, { frameId: 0 });
  } catch (err) {
    console.warn('Spotlight: could not send state to tab', tabId, err.message);
  }
}

// ── Global keyboard shortcut (Ctrl+Shift+L) ───────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-spotlight') return;
  const state = await getState();
  state.active = !state.active;
  await saveState({ active: state.active });
  const tab = await getActiveTab();
  if (tab) await applyStateToTab(tab.id, state);
});

// ── Page load ─────────────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  const state = await getState();
  // Brief delay to allow dynamically-loaded iframes to settle
  setTimeout(() => applyStateToTab(tabId, state), 500);
});

// ── Tab switch ────────────────────────────────────────────────────────────

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab?.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  const state = await getState();
  await applyStateToTab(tabId, state);
});

// ── Message bridge (from popup and content scripts) ───────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === 'POPUP_GET_STATE') {
      sendResponse(await getState());
      return;
    }
    if (msg.type === 'POPUP_SET_STATE') {
      const state = await getState();
      const updated = { ...state, ...msg.patch };
      await saveState(updated);
      const tab = await getActiveTab();
      if (tab?.id) await applyStateToTab(tab.id, updated);
      sendResponse(updated);
      return;
    }
  })();
  return true;
});
