// ================================
// ExamPrep — Anti-Cheat Module
// ================================

let blurOverlay = null;
let watermarkEl = null;
let tabSwitchCount = 0;
let isTestActive = false;

// Initialize anti-cheat protections
export function initAntiCheat(studentName = 'Student') {
  isTestActive = true;
  tabSwitchCount = 0;
  
  // Create blur overlay for tab switching
  if (!blurOverlay) {
    blurOverlay = document.createElement('div');
    blurOverlay.className = 'blur-overlay';
    blurOverlay.id = 'blur-overlay';
    blurOverlay.innerHTML = `
      <h2>⚠️ Warning: Tab Switch Detected!</h2>
      <p>Please return to the test. Switching tabs is not allowed.</p>
      <p id="tab-switch-count" style="color: var(--accent-orange); font-weight: 600;"></p>
      <button class="btn btn-primary" onclick="document.getElementById('blur-overlay').classList.remove('active')">
        Return to Test
      </button>
    `;
    document.body.appendChild(blurOverlay);
  }

  // Create watermark
  createWatermark(studentName);

  // Block right-click
  document.addEventListener('contextmenu', blockEvent);

  // Block keyboard shortcuts
  document.addEventListener('keydown', blockKeys);

  // Block copy/cut/paste
  document.addEventListener('copy', blockEvent);
  document.addEventListener('cut', blockEvent);

  // Tab switch detection
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Block drag
  document.addEventListener('dragstart', blockEvent);

  console.log('Anti-cheat protections enabled');
}

// Remove anti-cheat protections (for non-test pages)
export function removeAntiCheat() {
  isTestActive = false;

  document.removeEventListener('contextmenu', blockEvent);
  document.removeEventListener('keydown', blockKeys);
  document.removeEventListener('copy', blockEvent);
  document.removeEventListener('cut', blockEvent);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  document.removeEventListener('dragstart', blockEvent);

  if (blurOverlay) {
    blurOverlay.remove();
    blurOverlay = null;
  }

  if (watermarkEl) {
    watermarkEl.remove();
    watermarkEl = null;
  }

  console.log('Anti-cheat protections removed');
}

// Block event helper
function blockEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

// Block keyboard shortcuts
function blockKeys(e) {
  // Block: Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12, PrintScreen
  const blockedCombos = [
    { ctrl: true, key: 'c' },
    { ctrl: true, key: 'a' },
    { ctrl: true, key: 's' },
    { ctrl: true, key: 'p' },
    { ctrl: true, key: 'u' },
    { ctrl: true, shift: true, key: 'i' },
    { ctrl: true, shift: true, key: 'j' },
    { ctrl: true, shift: true, key: 'c' },
  ];

  const blockedKeys = ['F12', 'PrintScreen'];

  // Check single keys
  if (blockedKeys.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Check combos
  for (const combo of blockedCombos) {
    const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true;
    const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey || !combo.shift;
    if (ctrlMatch && shiftMatch && e.key.toLowerCase() === combo.key) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
}

// Handle tab switching
function handleVisibilityChange() {
  if (!isTestActive) return;
  
  if (document.hidden) {
    tabSwitchCount++;
    if (blurOverlay) {
      blurOverlay.classList.add('active');
      const countEl = blurOverlay.querySelector('#tab-switch-count');
      if (countEl) {
        countEl.textContent = `Tab switches detected: ${tabSwitchCount}`;
      }
    }
  }
}

// Create watermark overlay
function createWatermark(studentName) {
  if (watermarkEl) watermarkEl.remove();
  
  watermarkEl = document.createElement('div');
  watermarkEl.className = 'watermark';
  watermarkEl.id = 'watermark-overlay';

  const now = new Date().toLocaleString('en-IN');
  const text = `${studentName} • ${now}`;

  // Create grid of watermark text
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 5; col++) {
      const span = document.createElement('span');
      span.className = 'watermark-text';
      span.textContent = text;
      span.style.top = `${row * 14 + 5}%`;
      span.style.left = `${col * 25 - 5}%`;
      watermarkEl.appendChild(span);
    }
  }

  document.body.appendChild(watermarkEl);
}

// Get tab switch count
export function getTabSwitchCount() {
  return tabSwitchCount;
}
