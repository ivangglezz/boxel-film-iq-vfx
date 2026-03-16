/* ==========================================================================
   Proposal Detail Page — Logic
   ========================================================================== */

function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US');
}
function parseFormattedNumber(str) {
  return Math.max(0, parseInt(String(str).replace(/,/g, '')) || 0);
}

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const project = Store.getProject(projectId);

  if (!project) {
    document.body.innerHTML = '<div style="padding:80px;text-align:center;color:#6A7887;">Project not found. <a href="catalog.html" style="color:#9375C0">Back to catalog</a></div>';
    return;
  }

  let activeSceneId = project.scenes[0]?.id;
  let activeTab = 'script';

  renderAll();

  function renderAll() {
    const sidebar = document.querySelector('.scene-sidebar');
    const savedScroll = sidebar ? sidebar.scrollTop : 0;

    const freshProject = Store.getProject(projectId);
    document.getElementById('app').innerHTML = `
      ${renderHeader(freshProject)}
      <div class="gradient-divider"></div>
      <div class="detail-body">
        ${renderSidebar(freshProject)}
        <div class="detail-content">
          ${renderSceneDetail(freshProject)}
          <div class="detail-split">
            ${renderDetailLists(freshProject)}
            ${renderScriptViewer(freshProject)}
          </div>
        </div>
      </div>
    `;
    bindEvents();

    const newSidebar = document.querySelector('.scene-sidebar');
    if (newSidebar) newSidebar.scrollTop = savedScroll;

    const activeBlock = document.querySelector('.script-scene-active');
    if (activeBlock) {
      activeBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderHeader(p) {
    return `
      <div class="detail-header">
        <div class="detail-header-left">
          <a href="catalog.html" class="detail-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </a>
          <span class="detail-title">${p.title}</span>
          <span class="badge">${p.platform}</span>
        </div>
        <div class="detail-header-stats">
          <span class="detail-header-cost">${formatCurrency(p.totalCost)}</span>
          <div class="detail-header-stat">
            <span class="detail-header-stat-value">${p.totalOpportunities}</span>
            <span class="detail-header-stat-label">OPPS</span>
          </div>
          <div class="detail-header-stat">
            <span class="detail-header-stat-value">${p.totalScenes}</span>
            <span class="detail-header-stat-label">SCENES</span>
          </div>
          <a href="confirmation.html?id=${p.id}" class="btn btn-secondary btn-sm">FINALIZE</a>
        </div>
      </div>
    `;
  }

  function renderSidebar(p) {
    return `
      <div class="scene-sidebar">
        <div class="scene-sidebar-header">
          <h3>Scenes (${p.scenes.length})</h3>
        </div>
        ${p.scenes.map((scene, i) => {
          const gradientAngle = (i * 30 + 120) % 360;
          const colors = [p.gradientColors[0] || '#9375C0', p.gradientColors[1] || '#00EFD8'];
          return `
            <div class="scene-card ${scene.id === activeSceneId ? 'active' : ''}" data-scene-id="${scene.id}">
              <div class="scene-card-thumb">
                ${p.thumbnail ? `<img class="scene-card-thumb-img" src="${p.thumbnail}" alt="${scene.name}">` : ''}
                <div class="scene-card-thumb-bg" style="background: linear-gradient(${gradientAngle}deg, ${colors[0]}44, ${colors[1]}44)"></div>
                <span class="scene-card-duration">${scene.duration}</span>
              </div>
              <div class="scene-card-info">
                <span class="scene-card-name">${scene.name}</span>
                <div class="scene-card-meta">
                  <span class="scene-card-cost">${formatCurrency(scene.cost)}</span>
                  <span class="scene-card-status ${scene.status}"></span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function getActiveScene(p) {
    return p.scenes.find(s => s.id === activeSceneId) || p.scenes[0];
  }

  function renderSceneDetail(p) {
    const scene = getActiveScene(p);
    if (!scene) return '';

    const statusBadge = scene.status === 'approved'
      ? '<span class="badge badge-success">APPROVED</span>'
      : scene.status === 'declined'
      ? '<span class="badge badge-error">DECLINED</span>'
      : '<span class="badge">PENDING</span>';

    return `
      <div class="scene-detail">
        <div class="scene-detail-header">
          <div class="scene-detail-title-wrap">
            <h2 class="scene-detail-title editable-text" data-field="name" data-scene-id="${scene.id}">${scene.name}</h2>
            ${statusBadge}
          </div>
          <div class="scene-detail-actions">
            <button class="btn btn-success btn-sm scene-action" data-action="approved" data-scene-id="${scene.id}" ${scene.status === 'approved' ? 'disabled style="opacity:0.5"' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
              APPROVE
            </button>
            <button class="btn btn-error btn-sm scene-action" data-action="declined" data-scene-id="${scene.id}" ${scene.status === 'declined' ? 'disabled style="opacity:0.5"' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              DECLINE
            </button>
          </div>
        </div>
        <div class="scene-fields">
          <div class="scene-field">
            <span class="scene-field-label">OPPORTUNITIES</span>
            <div class="scene-field-value">${(scene.opportunityList || []).filter(o => o.selected).length} / ${(scene.opportunityList || []).length}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">COMPLEXITY</span>
            <div class="scene-field-value editable" data-field="complexity" data-type="text" data-scene-id="${scene.id}">${scene.complexity}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">SCRIPT PAGES</span>
            <div class="scene-field-value editable" data-field="scriptPages" data-type="text" data-scene-id="${scene.id}">pp. ${scene.scriptPagesStart}-${scene.scriptPagesEnd}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">EST. LENGTH</span>
            <div class="scene-field-value editable" data-field="estimatedLength" data-type="text" data-scene-id="${scene.id}">${scene.estimatedLength}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">COST</span>
            <div class="scene-field-value cost-field">${formatCurrency(scene.cost)}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">DURATION</span>
            <div class="scene-field-value editable" data-field="duration" data-type="text" data-scene-id="${scene.id}">${scene.duration}</div>
          </div>
          <div class="scene-field">
            <span class="scene-field-label">STATUS</span>
            <div class="scene-field-value">${scene.status.charAt(0).toUpperCase() + scene.status.slice(1)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderScriptViewer(p) {
    const scene = getActiveScene(p);
    if (!scene) return '';

    const fullScript = p.scenes.map(s => {
      const isActive = s.id === scene.id;
      const cls = isActive ? 'script-scene-active' : 'script-scene-inactive';
      return `<div class="${cls}" data-scene-id="${s.id}">
        <div class="script-scene-label">${escapeHtml(s.name)}</div>
        ${escapeHtml(s.scriptText)}
      </div>`;
    }).join('');

    return `
      <div class="script-viewer">
        <div class="script-tabs">
          <button class="script-tab ${activeTab === 'script' ? 'active' : ''}" data-tab="script">SCRIPT</button>
          <button class="script-tab ${activeTab === 'preview' ? 'active' : ''}" data-tab="preview">PREVIEW</button>
        </div>
        <div class="script-content">
          ${activeTab === 'script' ? `
            <div class="script-text">${fullScript}</div>
          ` : `
            <div class="preview-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span class="label">STORYBOARD PREVIEW</span>
              <span class="body-sm">Visual preview will be available after scene rendering</span>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function renderDetailLists(p) {
    const scene = getActiveScene(p);
    if (!scene) return '';

    // Merge catalog opportunities into scene list
    const oppList = scene.opportunityList || [];
    const existingNames = new Set(oppList.map(o => o.name));
    const catalogExtras = (typeof OPPORTUNITY_CATALOG !== 'undefined' ? OPPORTUNITY_CATALOG : [])
      .filter(name => !existingNames.has(name))
      .map(name => ({ name, selected: false, amount: 0 }));
    if (catalogExtras.length > 0) {
      oppList.push(...catalogExtras);
      Store.updateScene(projectId, scene.id, { opportunityList: oppList });
    }
    const selectedCount = oppList.filter(o => o.selected).length;

    const selected = oppList.map((o, i) => ({ ...o, _index: i })).filter(o => o.selected).sort((a, b) => a.name.localeCompare(b.name));
    const available = oppList.map((o, i) => ({ ...o, _index: i })).filter(o => !o.selected && !o.custom).sort((a, b) => a.name.localeCompare(b.name));
    const selectedTotal = selected.reduce((sum, o) => sum + (o.amount || 0), 0);

    return `
      <div class="detail-lists">
        <div class="detail-list">
          <h4>Opportunities (${selectedCount}/${oppList.length})</h4>
          ${selected.length === 0 ? '<p class="opp-empty-msg">No opportunities added</p>' : ''}
          ${selected.map(o => `
            <div class="detail-list-item opp-item" data-scene-id="${scene.id}" data-opp-index="${o._index}">
              <button class="opp-remove-btn" title="Remove">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="detail-list-item-name">${o.name}${o.custom ? '<span class="opp-custom-badge">CUSTOM</span>' : ''}</span>
              <span class="opp-amount-wrap">
                <span class="opp-amount-label">$</span>
                <input type="text" class="opp-amount-input" value="${formatNumber(o.amount)}" data-scene-id="${scene.id}" data-opp-index="${o._index}">
              </span>
            </div>
          `).join('')}
          <div class="opp-total-row">
            <span>Scene Total</span>
            <span class="opp-total-value">${formatCurrency(selectedTotal)}</span>
          </div>
          <div class="opp-custom-add">
            <input type="text" class="opp-custom-name" placeholder="Custom opportunity...">
            <input type="number" class="opp-custom-amount" placeholder="0" min="0" step="100">
            <button class="opp-custom-btn" title="Add custom opportunity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
        ${available.length > 0 ? `
        <div class="detail-list opp-available">
          <h4>Available</h4>
          ${available.map(o => `
            <div class="detail-list-item opp-item opp-item-available" data-scene-id="${scene.id}" data-opp-index="${o._index}">
              <button class="opp-add-btn" title="Add">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span class="detail-list-item-name">${o.name}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;
  }

  function bindEvents() {
    // Scene card clicks
    document.querySelectorAll('.scene-card').forEach(card => {
      card.addEventListener('click', () => {
        activeSceneId = card.dataset.sceneId;
        renderAll();
      });
    });

    // Tab switching
    document.querySelectorAll('.script-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        renderAll();
      });
    });

    // Approve / Decline
    document.querySelectorAll('.scene-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const sceneId = btn.dataset.sceneId;
        const action = btn.dataset.action;
        Store.updateScene(projectId, sceneId, { status: action });
        showToast(`Scene ${action}`, action === 'approved' ? 'success' : 'error');
        renderAll();
      });
    });

    // Click-to-edit fields
    document.querySelectorAll('.editable').forEach(el => {
      el.addEventListener('click', () => startEdit(el));
    });

    // Opportunity add/remove buttons
    function toggleOpp(sceneId, oppIndex, selected) {
      const scene = Store.getScene(projectId, sceneId);
      const oppList = [...scene.opportunityList];
      oppList[oppIndex] = {
        ...oppList[oppIndex],
        selected,
        amount: selected ? oppList[oppIndex].amount : 0
      };
      const selectedCount = oppList.filter(o => o.selected).length;
      Store.updateScene(projectId, sceneId, {
        opportunityList: oppList,
        opportunities: selectedCount
      });
      renderAll();
    }

    document.querySelectorAll('.opp-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.opp-item');
        toggleOpp(item.dataset.sceneId, parseInt(item.dataset.oppIndex), false);
      });
    });

    document.querySelectorAll('.opp-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.opp-item');
        toggleOpp(item.dataset.sceneId, parseInt(item.dataset.oppIndex), true);
      });
    });

    // Opportunity amount editing
    document.querySelectorAll('.opp-amount-input').forEach(input => {
      input.addEventListener('click', (e) => e.stopPropagation());
      input.addEventListener('change', () => {
        const sceneId = input.dataset.sceneId;
        const oppIndex = parseInt(input.dataset.oppIndex);
        const scene = Store.getScene(projectId, sceneId);
        const oppList = [...scene.opportunityList];
        oppList[oppIndex] = { ...oppList[oppIndex], amount: parseFormattedNumber(input.value) };
        Store.updateScene(projectId, sceneId, { opportunityList: oppList });
        renderAll();
      });
    });

    // Custom opportunity add
    const customBtn = document.querySelector('.opp-custom-btn');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        const nameInput = document.querySelector('.opp-custom-name');
        const amountInput = document.querySelector('.opp-custom-amount');
        const name = nameInput.value.trim();
        const amount = parseFormattedNumber(amountInput.value);
        if (!name) { showToast('Enter a name for the custom opportunity', 'error'); return; }

        const scene = Store.getScene(projectId, activeSceneId);
        const oppList = [...scene.opportunityList];
        oppList.push({ name, selected: true, amount, custom: true });
        Store.updateScene(projectId, activeSceneId, {
          opportunityList: oppList,
          opportunities: oppList.filter(o => o.selected).length
        });
        renderAll();
      });
    }

    // Editable title
    document.querySelectorAll('.editable-text').forEach(el => {
      el.addEventListener('click', () => startEditText(el));
    });
  }

  function startEdit(el) {
    if (el.querySelector('input')) return;

    const field = el.dataset.field;
    const type = el.dataset.type;
    const sceneId = el.dataset.sceneId;
    const scene = Store.getScene(projectId, sceneId);

    let currentValue;
    if (field === 'cost') {
      currentValue = scene.cost;
    } else if (field === 'scriptPages') {
      currentValue = `${scene.scriptPagesStart}-${scene.scriptPagesEnd}`;
    } else {
      currentValue = scene[field];
    }

    el.classList.add('editing');
    const input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = currentValue;
    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();

    const save = () => {
      let newValue = input.value;
      const updates = {};

      if (field === 'scriptPages') {
        const parts = newValue.split('-').map(s => parseInt(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          updates.scriptPagesStart = parts[0];
          updates.scriptPagesEnd = parts[1];
        }
      } else if (type === 'number') {
        updates[field] = parseInt(newValue) || 0;
      } else {
        updates[field] = newValue;
      }

      Store.updateScene(projectId, sceneId, updates);
      renderAll();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') renderAll();
    });
  }

  function startEditText(el) {
    const field = el.dataset.field;
    const sceneId = el.dataset.sceneId;
    const scene = Store.getScene(projectId, sceneId);
    const currentValue = scene[field];

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.style.cssText = `
      font-family: var(--font-heading);
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.5px;
      background: var(--bg-input);
      border: 1px solid var(--accent);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 4px 8px;
      outline: none;
      width: 100%;
    `;

    el.replaceWith(input);
    input.focus();
    input.select();

    const save = () => {
      Store.updateScene(projectId, sceneId, { [field]: input.value });
      renderAll();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') renderAll();
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
