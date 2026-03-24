/* ==========================================================================
   Scope Overlay — Core Module
   FAB (bottom-left) toggles a right-side panel with collapsible requirements.
   Clicking a requirement highlights the corresponding UI element.
   ========================================================================== */

const ScopeOverlay = (() => {
  const SCOPE_STORAGE_KEY = 'boxel_scope_panel_open';
  let isOpen = false;
  let activeItemId = null;
  let highlightTimer = null;

  /* ---- Page Detection ---- */

  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = (path.split('/').pop() || 'index.html').toLowerCase();
    const map = {
      'index.html': 'upload',
      'processing.html': 'processing',
      'catalog.html': 'catalog',
      'detail.html': 'detail',
      'confirmation.html': 'confirmation'
    };
    return map[filename] || 'upload';
  }

  /* ---- Rendering ---- */

  function createFAB() {
    const fab = document.createElement('button');
    fab.className = 'scope-fab';
    fab.setAttribute('title', 'Toggle Scope Panel (Ctrl+Shift+S)');
    fab.innerHTML = `
      <svg class="scope-fab-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
      <svg class="scope-fab-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    fab.addEventListener('click', toggle);
    return fab;
  }

  function createPanel(pageData) {
    const panel = document.createElement('div');
    panel.className = 'scope-panel';
    panel.id = 'scope-panel';

    panel.innerHTML = `
      <div class="scope-panel-header">
        <h2 class="scope-panel-title">${pageData.title}</h2>
        <button class="scope-panel-close" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="scope-panel-body">
        ${pageData.groups.map(renderGroup).join('')}
      </div>
      <div class="scope-panel-footer">
        <button class="scope-fullview-btn" id="scope-fullview-btn" title="View all requirements in full page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          VIEW FULL SCOPE DOCUMENT
        </button>
      </div>
    `;

    panel.querySelector('.scope-panel-close').addEventListener('click', close);
    panel.querySelector('#scope-fullview-btn').addEventListener('click', openFullView);
    return panel;
  }

  function renderGroup(group) {
    const oosClass = group.isOutOfScope ? ' scope-group-oos' : '';
    return `
      <div class="scope-group${oosClass}" data-group-id="${group.id}">
        <div class="scope-group-header">
          <svg class="scope-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
          <span class="scope-group-title">${group.title}</span>
          <span class="scope-group-count">${group.items.length}</span>
        </div>
        <div class="scope-group-content">
          ${group.items.map(item => renderItem(item, group.isOutOfScope)).join('')}
        </div>
      </div>
    `;
  }

  function renderItem(item, isOutOfScope) {
    const clickAttr = !isOutOfScope && item.targetSelector
      ? `data-target="${item.targetSelector}" data-item-id="${item.id}"`
      : '';
    return `
      <div class="scope-item" ${clickAttr}>
        <div class="scope-item-title">${item.title}</div>
        <p class="scope-item-desc">${item.description}</p>
      </div>
    `;
  }

  /* ---- Expand / Collapse ---- */

  function bindGroupToggles() {
    document.querySelectorAll('.scope-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.parentElement;
        const content = group.querySelector('.scope-group-content');

        if (group.classList.contains('expanded')) {
          content.style.maxHeight = '0px';
          group.classList.remove('expanded');
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          group.classList.add('expanded');
        }
      });
    });
  }

  function bindItemClicks() {
    document.querySelectorAll('.scope-item[data-target]').forEach(item => {
      item.addEventListener('click', () => {
        const selector = item.getAttribute('data-target');
        const itemId = item.getAttribute('data-item-id');

        // Toggle active state
        document.querySelectorAll('.scope-item.active').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        activeItemId = itemId;

        highlightElement(selector);
      });
    });
  }

  /* ---- Highlighting ---- */

  function highlightElement(selector) {
    // Clear existing highlight
    clearHighlight();

    const target = document.querySelector(selector);
    if (!target) {
      if (typeof showToast === 'function') {
        showToast('Element not visible yet on this page', 'info');
      }
      return;
    }

    // Scroll into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight class
    target.classList.add('scope-highlight');

    // Auto-remove after 3 pulses (1.5s * 3 = 4.5s)
    highlightTimer = setTimeout(() => {
      target.classList.remove('scope-highlight');
    }, 4500);
  }

  function clearHighlight() {
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
    document.querySelectorAll('.scope-highlight').forEach(el => {
      el.classList.remove('scope-highlight');
    });
  }

  /* ---- Toggle / Open / Close ---- */

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function open() {
    isOpen = true;
    const panel = document.getElementById('scope-panel');
    const fab = document.querySelector('.scope-fab');
    if (panel) panel.classList.add('active');
    if (fab) fab.classList.add('active');
    localStorage.setItem(SCOPE_STORAGE_KEY, 'open');
  }

  function close() {
    isOpen = false;
    const panel = document.getElementById('scope-panel');
    const fab = document.querySelector('.scope-fab');
    if (panel) panel.classList.remove('active');
    if (fab) fab.classList.remove('active');
    clearHighlight();
    document.querySelectorAll('.scope-item.active').forEach(el => el.classList.remove('active'));
    activeItemId = null;
    localStorage.setItem(SCOPE_STORAGE_KEY, 'closed');
  }

  /* ---- Full-Page Requirements View ---- */

  function createFullViewOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'scope-fullview-overlay';
    overlay.id = 'scope-fullview';

    const pageOrder = ['upload', 'processing', 'catalog', 'detail', 'confirmation'];
    const pageNames = {
      upload: 'Upload',
      processing: 'Processing',
      catalog: 'Proposals',
      detail: 'Proposal Detail',
      confirmation: 'Confirmation'
    };

    const pagesHTML = pageOrder.map((pageKey, i) => {
      const pageData = SCOPE_DATA[pageKey];
      if (!pageData) return '';

      const groupsHTML = pageData.groups.map(group => {
        const oosClass = group.isOutOfScope ? ' scope-fv-group-oos' : '';
        const itemsHTML = group.items.map(item => `
          <div class="scope-fv-item">
            <div class="scope-fv-item-title">${item.title}</div>
            <p class="scope-fv-item-desc">${item.description}</p>
          </div>
        `).join('');

        return `
          <div class="scope-fv-group${oosClass}">
            <h3 class="scope-fv-group-title">${group.title}</h3>
            ${itemsHTML}
          </div>
        `;
      }).join('');

      const divider = i < pageOrder.length - 1 ? '<div class="scope-fv-divider"></div>' : '';

      return `
        <div class="scope-fv-page">
          <h2 class="scope-fv-page-title">${pageNames[pageKey]}</h2>
          ${groupsHTML}
        </div>
        ${divider}
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="scope-fullview-header">
        <div class="scope-fullview-header-left">
          <svg class="scope-fullview-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <h1 class="scope-fullview-title">Full Scope Document</h1>
        </div>
        <button class="scope-fullview-close" id="scope-fullview-close" title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="scope-fullview-body">
        <div class="scope-fullview-container">
          ${pagesHTML}
        </div>
      </div>
    `;

    overlay.querySelector('#scope-fullview-close').addEventListener('click', closeFullView);

    // Close on Escape
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFullView();
    });

    return overlay;
  }

  function openFullView() {
    let overlay = document.getElementById('scope-fullview');
    if (!overlay) {
      overlay = createFullViewOverlay();
      document.body.appendChild(overlay);
    }
    // Force reflow then activate
    overlay.offsetHeight;
    overlay.classList.add('active');
    overlay.focus();
  }

  function closeFullView() {
    const overlay = document.getElementById('scope-fullview');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  /* ---- Keyboard Shortcut ---- */

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') {
        const fullview = document.getElementById('scope-fullview');
        if (fullview && fullview.classList.contains('active')) {
          closeFullView();
        }
      }
    });
  }

  /* ---- Init ---- */

  function init() {
    // Kill switch: ?scope=off
    const params = new URLSearchParams(window.location.search);
    if (params.get('scope') === 'off') return;

    // Check SCOPE_DATA exists
    if (typeof SCOPE_DATA === 'undefined') return;

    const page = getCurrentPage();
    const pageData = SCOPE_DATA[page];
    if (!pageData) return;

    // Enable scope mode
    document.body.classList.add('scope-mode-enabled');

    // Inject FAB and Panel
    document.body.appendChild(createFAB());
    document.body.appendChild(createPanel(pageData));

    // Bind events
    bindGroupToggles();
    bindItemClicks();
    bindKeyboard();

    // Restore panel state from localStorage
    const savedState = localStorage.getItem(SCOPE_STORAGE_KEY);
    if (savedState === 'open') {
      open();
    }

    // Expand first non-OOS group by default
    const firstGroup = document.querySelector('.scope-group:not(.scope-group-oos)');
    if (firstGroup) {
      const content = firstGroup.querySelector('.scope-group-content');
      firstGroup.classList.add('expanded');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }

  /* ---- Public API ---- */

  return {
    init,
    toggle,
    open,
    close,
    highlightElement,
    clearHighlight,
    openFullView,
    closeFullView
  };
})();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to let page-specific JS render dynamic content first
  setTimeout(() => ScopeOverlay.init(), 300);
});
