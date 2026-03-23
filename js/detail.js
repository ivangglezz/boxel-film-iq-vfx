/* ==========================================================================
   Proposal Detail Page — Logic (Multi-Category)
   ========================================================================== */

function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-US');
}
function parseFormattedNumber(str) {
  return Math.max(0, parseInt(String(str).replace(/,/g, '')) || 0);
}

const CATEGORY_LABELS = {
  scenes: { singular: 'Scene', plural: 'Scenes', short: 'Scenes', icon: '🎬' },
  characters: { singular: 'Character', plural: 'Characters', short: 'Chars', icon: '👤' },
  environments: { singular: 'Environment', plural: 'Environments', short: 'Env', icon: '🌍' }
};

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const project = Store.getProject(projectId);

  if (!project) {
    document.body.innerHTML = '<div style="padding:80px;text-align:center;color:#6A7887;">Project not found. <a href="catalog.html" style="color:#9375C0">Back to catalog</a></div>';
    return;
  }

  let activeCategory = 'scenes';
  let activeItemId = project.scenes[0]?.id;
  let activeTab = 'preview';
  let scriptSceneIndex = 0;
  let animateCards = true;

  renderAll();

  function renderAll(partial) {
    const sidebar = document.querySelector('.scene-sidebar');
    const savedScroll = sidebar ? sidebar.scrollTop : 0;
    const freshProject = Store.getProject(projectId);

    if (partial === 'opportunities') {
      const headerEl = document.querySelector('.detail-header');
      if (headerEl) headerEl.outerHTML = renderHeader(freshProject);

      const sceneDetailEl = document.querySelector('.scene-detail');
      if (sceneDetailEl) sceneDetailEl.outerHTML = renderItemDetail(freshProject);

      const listsEl = document.querySelector('.detail-lists');
      if (listsEl) listsEl.outerHTML = renderDetailLists(freshProject);

      const sidebarEl = document.querySelector('.scene-sidebar');
      if (sidebarEl) {
        sidebarEl.outerHTML = renderSidebar(freshProject);
        const newSidebar = document.querySelector('.scene-sidebar');
        if (newSidebar) newSidebar.scrollTop = savedScroll;
      }

      bindEvents();
      return;
    }

    document.getElementById('app').innerHTML = `
      ${renderHeader(freshProject)}
      <div class="gradient-divider"></div>
      <div class="detail-body">
        ${renderSidebar(freshProject)}
        <div class="detail-content">
          ${renderItemDetail(freshProject)}
          <div class="detail-split">
            ${renderDetailLists(freshProject)}
            ${renderRightPanel(freshProject)}
          </div>
        </div>
      </div>
    `;
    bindEvents();

    const newSidebar = document.querySelector('.scene-sidebar');
    if (newSidebar) newSidebar.scrollTop = savedScroll;

    if (activeTab === 'script') {
      const activeBlock = document.querySelector('.script-scene-active');
      if (activeBlock) {
        activeBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function renderHeader(p) {
    const scenesCount = (p.scenes || []).length;
    const charsCount = (p.characters || []).length;
    const envsCount = (p.environments || []).length;

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
            <span class="detail-header-stat-value">${scenesCount}</span>
            <span class="detail-header-stat-label">SCENES</span>
          </div>
          ${charsCount > 0 ? `
          <div class="detail-header-stat">
            <span class="detail-header-stat-value">${charsCount}</span>
            <span class="detail-header-stat-label">CHARS</span>
          </div>` : ''}
          ${envsCount > 0 ? `
          <div class="detail-header-stat">
            <span class="detail-header-stat-value">${envsCount}</span>
            <span class="detail-header-stat-label">ENVS</span>
          </div>` : ''}
          <a href="confirmation.html?id=${p.id}" class="btn btn-secondary btn-sm">FINALIZE</a>
        </div>
      </div>
    `;
  }

  function renderSidebar(p) {
    const categories = ALL_CATEGORIES.filter(cat => (p[cat] || []).length > 0);
    const items = p[activeCategory] || [];

    return `
      <div class="scene-sidebar">
        <div class="sidebar-category-tabs">
          ${categories.map(cat => {
            const label = CATEGORY_LABELS[cat];
            const count = (p[cat] || []).length;
            return `
              <button class="sidebar-cat-tab ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                ${label.short} (${count})
              </button>
            `;
          }).join('')}
        </div>
        ${[...items].sort((a, b) => (a.removed ? 1 : 0) - (b.removed ? 1 : 0)).map((item, i) => renderItemCard(item, i, p)).join('')}
      </div>
    `;
  }

  function renderItemCard(item, i, p) {
    const isActive = item.id === activeItemId;
    const gradientAngle = (i * 30 + 120) % 360;
    const colors = [p.gradientColors[0] || '#9375C0', p.gradientColors[1] || '#00EFD8'];
    const animClass = animateCards ? 'scene-card-animate' : '';
    const animStyle = animateCards ? `animation-delay:${Math.min(i * 0.05, 0.4)}s` : '';


    if (activeCategory === 'characters') {
      const initials = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const roleClass = item.role === 'Lead' ? 'role-lead' : item.role === 'Supporting' ? 'role-supporting' : 'role-minor';
      return `
        <div class="scene-card ${animClass} ${isActive ? 'active' : ''} ${item.removed ? 'removed' : ''}" data-item-id="${item.id}" style="${animStyle}">
          <button class="scene-card-remove" data-item-id="${item.id}" title="${item.removed ? 'Restore' : 'Remove'}">
            ${item.removed
              ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
              : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
          </button>
          <div class="scene-card-thumb ${item.thumbnail ? '' : 'char-card-thumb'}">
            ${item.thumbnail
              ? `<img class="scene-card-thumb-img" src="${item.thumbnail}" alt="${item.name}">`
              : `<div class="char-avatar" style="background: linear-gradient(${gradientAngle}deg, ${colors[0]}, ${colors[1]})">${initials}</div>`
            }
          </div>
          <div class="scene-card-info">
            <span class="scene-card-name">${item.name}</span>
            <div class="scene-card-meta">
              <span class="scene-card-cost">${formatCurrency(item.cost)}</span>
              <span class="scene-card-duration-inline ${roleClass}">${item.role}</span>
            </div>
          </div>
        </div>
      `;
    }

    if (activeCategory === 'environments') {
      const typeClass = item.type === 'EXT' ? 'env-ext' : item.type === 'INT/EXT' ? 'env-mixed' : 'env-int';
      return `
        <div class="scene-card ${animClass} ${isActive ? 'active' : ''} ${item.removed ? 'removed' : ''}" data-item-id="${item.id}" style="${animStyle}">
          <button class="scene-card-remove" data-item-id="${item.id}" title="${item.removed ? 'Restore' : 'Remove'}">
            ${item.removed
              ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
              : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
          </button>
          <div class="scene-card-thumb ${item.thumbnail ? '' : 'env-card-thumb'}" ${!item.thumbnail ? `style="background: linear-gradient(${gradientAngle}deg, ${colors[0]}44, ${colors[1]}44)"` : ''}>
            ${item.thumbnail ? `<img class="scene-card-thumb-img" src="${item.thumbnail}" alt="${item.name}">` : ''}
          </div>
          <div class="scene-card-info">
            <span class="scene-card-name">${item.name}</span>
            <div class="scene-card-meta">
              <span class="scene-card-cost">${formatCurrency(item.cost)}</span>
              <span class="scene-card-duration-inline"><span class="env-type-inline-sm ${typeClass}">${item.type}</span> ${item.vfxComplexity}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Default: scenes
    return `
      <div class="scene-card ${animClass} ${isActive ? 'active' : ''} ${item.removed ? 'removed' : ''}" data-item-id="${item.id}" style="${animStyle}">
        <button class="scene-card-remove" data-item-id="${item.id}" title="${item.removed ? 'Restore' : 'Remove'}">
          ${item.removed
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'}
        </button>
        <div class="scene-card-thumb">
          ${(item.thumbnail || p.thumbnail) ? `<img class="scene-card-thumb-img" src="${item.thumbnail || p.thumbnail}" alt="${item.name}">` : ''}
          <div class="scene-card-thumb-bg" style="background: linear-gradient(${gradientAngle}deg, ${colors[0]}44, ${colors[1]}44)"></div>
        </div>
        <div class="scene-card-info">
          <span class="scene-card-name">${item.name}</span>
          <div class="scene-card-meta">
            <span class="scene-card-cost">${formatCurrency(item.cost)}</span>
            <span class="scene-card-duration-inline">${item.duration}</span>
          </div>
        </div>
      </div>
    `;
  }

  function getActiveItem(p) {
    const list = p[activeCategory] || [];
    return list.find(item => item.id === activeItemId) || list[0];
  }

  function renderItemDetail(p) {
    const item = getActiveItem(p);
    if (!item) return '<div class="scene-detail"></div>';

    const catLabel = CATEGORY_LABELS[activeCategory].singular;

    let fieldsHtml = '';
    if (activeCategory === 'scenes') {
      fieldsHtml = `
        <div class="scene-field">
          <span class="scene-field-label">OPPORTUNITIES</span>
          <div class="scene-field-value">${(item.opportunityList || []).filter(o => o.selected).length} / ${(item.opportunityList || []).length}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">COMPLEXITY</span>
          <div class="scene-field-value editable" data-field="complexity" data-type="text" data-item-id="${item.id}">${item.complexity}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">SCRIPT PAGES</span>
          <div class="scene-field-value editable" data-field="scriptPages" data-type="text" data-item-id="${item.id}">pp. ${item.scriptPagesStart}-${item.scriptPagesEnd}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">EST. LENGTH</span>
          <div class="scene-field-value editable" data-field="estimatedLength" data-type="text" data-item-id="${item.id}">${item.estimatedLength}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">DURATION</span>
          <div class="scene-field-value editable" data-field="duration" data-type="text" data-item-id="${item.id}">${item.duration}</div>
        </div>
      `;
    } else if (activeCategory === 'characters') {
      fieldsHtml = `
        <div class="scene-field">
          <span class="scene-field-label">OPPORTUNITIES</span>
          <div class="scene-field-value">${(item.opportunityList || []).filter(o => o.selected).length} / ${(item.opportunityList || []).length}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">ROLE</span>
          <div class="scene-field-value"><span class="role-badge-inline role-badge-${item.role.toLowerCase()}">${item.role}</span></div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">SCENE COUNT</span>
          <div class="scene-field-value">${item.sceneCount}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">VFX NEEDED</span>
          <div class="scene-field-value">${item.vfxNeeded ? '<span style="color:var(--success)">Yes</span>' : '<span style="color:var(--text-muted)">No</span>'}</div>
        </div>
      `;
    } else if (activeCategory === 'environments') {
      fieldsHtml = `
        <div class="scene-field">
          <span class="scene-field-label">OPPORTUNITIES</span>
          <div class="scene-field-value">${(item.opportunityList || []).filter(o => o.selected).length} / ${(item.opportunityList || []).length}</div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">TYPE</span>
          <div class="scene-field-value"><span class="env-type-inline">${item.type}</span></div>
        </div>
        <div class="scene-field">
          <span class="scene-field-label">VFX COMPLEXITY</span>
          <div class="scene-field-value">${item.vfxComplexity}</div>
        </div>
      `;
    }

    const fieldsCount = activeCategory === 'scenes' ? 5 : activeCategory === 'characters' ? 4 : 3;

    return `
      <div class="scene-detail">
        <div class="scene-detail-header">
          <div class="scene-detail-title-wrap">
            <h2 class="scene-detail-title editable-text" data-field="name" data-item-id="${item.id}">${item.name}</h2>
          </div>
          <div class="scene-detail-header-right">
            <span class="scene-detail-cost">${formatCurrency(item.cost)}</span>
            <button class="scene-detail-toggle collapsed" title="Toggle details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
            </button>
          </div>
        </div>
        <div class="scene-fields scene-fields-collapsible collapsed" style="grid-template-columns: repeat(${fieldsCount}, 1fr)">
          ${fieldsHtml}
        </div>
      </div>
    `;
  }

  function renderRightPanel(p) {
    if (activeCategory === 'scenes') return renderScriptViewer(p);
    if (activeCategory === 'characters') return renderCharacterPanel(p);
    if (activeCategory === 'environments') return renderEnvironmentPanel(p);
    return '';
  }

  function renderScriptBody(p, highlightedSceneIds, currentSceneId) {
    return p.scenes.map(s => {
      const isCurrent = s.id === currentSceneId;
      const isHighlighted = !isCurrent && highlightedSceneIds.includes(s.id);
      const cls = isCurrent ? 'script-scene-active' : isHighlighted ? 'script-scene-highlighted' : 'script-scene-inactive';
      return `<div class="${cls}" data-scene-id="${s.id}">
        <div class="script-scene-label">${escapeHtml(s.name)}</div>
        ${escapeHtml(s.scriptText)}
      </div>`;
    }).join('');
  }

  function renderScriptNav(currentIndex, totalCount, label) {
    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= totalCount - 1;
    return `
      <div class="script-nav">
        <button class="script-nav-btn" data-direction="prev" ${isFirst ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          PREV
        </button>
        <span class="script-nav-label">${label} ${currentIndex + 1} / ${totalCount}</span>
        <button class="script-nav-btn" data-direction="next" ${isLast ? 'disabled' : ''}>
          NEXT
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,6 15,12 9,18"/></svg>
        </button>
      </div>
    `;
  }

  function renderScriptViewer(p) {
    const item = getActiveItem(p);
    if (!item) return '';

    const currentIdx = p.scenes.findIndex(s => s.id === item.id);
    const scriptBody = renderScriptBody(p, [item.id], item.id);

    return `
      <div class="script-viewer">
        <div class="script-tabs">
          <button class="script-tab ${activeTab === 'preview' ? 'active' : ''}" data-tab="preview">PREVIEW</button>
          <button class="script-tab ${activeTab === 'script' ? 'active' : ''}" data-tab="script">SCRIPT</button>
        </div>
        <div class="script-content">
          ${activeTab === 'script' ? `
            <div class="script-text">${scriptBody}</div>
          ` : `
            ${item.preview ? `
              <div class="preview-video-wrap">
                <video class="preview-video" src="${item.preview}" autoplay loop muted playsinline></video>
              </div>
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
            <div class="info-panel">
              ${item.description ? `
              <div class="info-panel-section">
                <h5 class="info-panel-label">Description</h5>
                <p class="info-panel-text">${escapeHtml(item.description)}</p>
              </div>` : ''}
              ${item.vfxNotes ? `
              <div class="info-panel-section">
                <h5 class="info-panel-label">VFX Notes</h5>
                <p class="info-panel-text">${escapeHtml(item.vfxNotes)}</p>
              </div>` : ''}
            </div>
          `}
        </div>
        ${activeTab === 'script' ? renderScriptNav(currentIdx, p.scenes.length, 'Scene') : ''}
      </div>
    `;
  }

  function renderCharacterPanel(p) {
    const item = getActiveItem(p);
    if (!item) return '';

    const sceneIds = item.sceneIds || [];
    const safeIndex = Math.min(scriptSceneIndex, sceneIds.length - 1);
    const currentSceneId = sceneIds[safeIndex] || null;

    return `
      <div class="script-viewer">
        <div class="script-tabs">
          <button class="script-tab ${activeTab === 'details' ? 'active' : ''}" data-tab="details">CHARACTER DETAILS</button>
          <button class="script-tab ${activeTab === 'script' ? 'active' : ''}" data-tab="script">SCRIPT</button>
        </div>
        <div class="script-content">
          ${activeTab === 'script' ? `
            <div class="script-text">${renderScriptBody(p, sceneIds, currentSceneId)}</div>
          ` : `
          ${item.preview ? `
            <div class="preview-video-wrap">
              <video class="preview-video" src="${item.preview}" autoplay loop muted playsinline></video>
            </div>
          ` : ''}
          <div class="info-panel">
            <div class="info-panel-section">
              <h5 class="info-panel-label">Description</h5>
              <p class="info-panel-text">${escapeHtml(item.description)}</p>
            </div>
            <div class="info-panel-section">
              <h5 class="info-panel-label">VFX Notes</h5>
              <p class="info-panel-text">${escapeHtml(item.vfxNotes)}</p>
            </div>
            <div class="info-panel-meta">
              <div class="info-panel-meta-item">
                <span class="info-panel-meta-label">Role</span>
                <span class="info-panel-meta-value"><span class="role-badge-inline role-badge-${item.role.toLowerCase()}">${item.role}</span></span>
              </div>
              <div class="info-panel-meta-item">
                <span class="info-panel-meta-label">Appears in</span>
                <span class="info-panel-meta-value">${item.sceneCount} scenes</span>
              </div>
              <div class="info-panel-meta-item">
                <span class="info-panel-meta-label">VFX Required</span>
                <span class="info-panel-meta-value">${item.vfxNeeded ? '<span style="color:var(--success)">Yes</span>' : 'No'}</span>
              </div>
            </div>
          </div>
          `}
        </div>
        ${activeTab === 'script' && sceneIds.length > 0 ? renderScriptNav(safeIndex, sceneIds.length, 'Scene') : ''}
      </div>
    `;
  }

  function renderEnvironmentPanel(p) {
    const item = getActiveItem(p);
    if (!item) return '';

    const sceneIds = item.sceneIds || [];
    const safeIndex = Math.min(scriptSceneIndex, sceneIds.length - 1);
    const currentSceneId = sceneIds[safeIndex] || null;

    return `
      <div class="script-viewer">
        <div class="script-tabs">
          <button class="script-tab ${activeTab === 'details' ? 'active' : ''}" data-tab="details">ENVIRONMENT DETAILS</button>
          <button class="script-tab ${activeTab === 'script' ? 'active' : ''}" data-tab="script">SCRIPT</button>
        </div>
        <div class="script-content">
          ${activeTab === 'script' ? `
            <div class="script-text">${renderScriptBody(p, sceneIds, currentSceneId)}</div>
          ` : `
          <div class="info-panel">
            <div class="info-panel-section">
              <h5 class="info-panel-label">Setting Description</h5>
              <p class="info-panel-text">${escapeHtml(item.settingDescription)}</p>
            </div>
            <div class="info-panel-section">
              <h5 class="info-panel-label">VFX Notes</h5>
              <p class="info-panel-text">${escapeHtml(item.vfxNotes)}</p>
            </div>
            <div class="info-panel-meta">
              <div class="info-panel-meta-item">
                <span class="info-panel-meta-label">Type</span>
                <span class="info-panel-meta-value"><span class="env-type-inline">${item.type}</span></span>
              </div>
              <div class="info-panel-meta-item">
                <span class="info-panel-meta-label">VFX Complexity</span>
                <span class="info-panel-meta-value">${item.vfxComplexity}</span>
              </div>
            </div>
          </div>
          `}
        </div>
        ${activeTab === 'script' && sceneIds.length > 0 ? renderScriptNav(safeIndex, sceneIds.length, 'Scene') : ''}
      </div>
    `;
  }

  function renderDetailLists(p) {
    const item = getActiveItem(p);
    if (!item) return '';

    const catLabel = CATEGORY_LABELS[activeCategory].singular;
    const oppList = item.opportunityList || [];
    const existingNames = new Set(oppList.map(o => o.name));
    const catalogExtras = (typeof OPPORTUNITY_CATALOG !== 'undefined' ? OPPORTUNITY_CATALOG : [])
      .filter(name => !existingNames.has(name))
      .map(name => ({ name, selected: false, amount: 0 }));
    if (catalogExtras.length > 0) {
      oppList.push(...catalogExtras);
      Store.updateItem(projectId, activeCategory, item.id, { opportunityList: oppList });
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
            <div class="opp-item-wrapper" data-item-id="${item.id}" data-opp-index="${o._index}">
              <div class="detail-list-item opp-item" data-item-id="${item.id}" data-opp-index="${o._index}">
                <button class="opp-remove-btn" title="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span class="detail-list-item-name">${o.name}${o.custom ? '<span class="opp-custom-badge">CUSTOM</span>' : ''}</span>
                <span class="opp-amount-wrap">
                  <span class="opp-amount-label">$</span>
                  <input type="text" class="opp-amount-input" value="${formatNumber(o.amount)}" data-item-id="${item.id}" data-opp-index="${o._index}">
                </span>
                <button class="opp-notes-toggle${o.notes ? ' has-notes' : ''}" title="Toggle notes">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </button>
              </div>
              <div class="opp-notes-panel collapsed">
                <textarea class="opp-notes-textarea" placeholder="Add notes for this opportunity..." data-item-id="${item.id}" data-opp-index="${o._index}" rows="3">${escapeHtml(o.notes || '')}</textarea>
              </div>
            </div>
          `).join('')}
          <div class="opp-total-row">
            <span>${catLabel} Total</span>
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
          <h4>Services</h4>
          ${available.map(o => `
            <div class="detail-list-item opp-item opp-item-available" data-item-id="${item.id}" data-opp-index="${o._index}">
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
    // Category tab clicks
    document.querySelectorAll('.sidebar-cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const newCat = tab.dataset.category;
        if (newCat !== activeCategory) {
          activeCategory = newCat;
          const freshProject = Store.getProject(projectId);
          const items = freshProject[activeCategory] || [];
          activeItemId = items[0]?.id;
          activeTab = activeCategory === 'scenes' ? 'preview' : 'details';
          scriptSceneIndex = 0;
          animateCards = true;
          renderAll();
        }
      });
    });

    // Remove/Restore card buttons
    document.querySelectorAll('.scene-card-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        const item = Store.getItem(projectId, activeCategory, itemId);
        const newRemoved = !item.removed;
        Store.updateItem(projectId, activeCategory, itemId, { removed: newRemoved });
        showToast(
          `${CATEGORY_LABELS[activeCategory].singular} ${newRemoved ? 'removed' : 'restored'}`,
          newRemoved ? 'error' : 'success'
        );
        animateCards = false;
        renderAll();
      });
    });

    // Item card clicks
    document.querySelectorAll('.scene-card').forEach(card => {
      card.addEventListener('click', () => {
        activeItemId = card.dataset.itemId;
        scriptSceneIndex = 0;
        animateCards = false;
        renderAll();
      });
    });

    // Tab switching (script viewer)
    document.querySelectorAll('.script-tab').forEach(tab => {
      if (tab.dataset.tab) {
        tab.addEventListener('click', () => {
          activeTab = tab.dataset.tab;
          scriptSceneIndex = 0;
          renderAll();
        });
      }
    });

    // Script navigation (prev/next)
    document.querySelectorAll('.script-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const direction = btn.dataset.direction;
        const freshProject = Store.getProject(projectId);

        if (activeCategory === 'scenes') {
          const scenes = freshProject.scenes;
          const currentIdx = scenes.findIndex(s => s.id === activeItemId);
          const newIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
          if (newIdx >= 0 && newIdx < scenes.length) {
            activeItemId = scenes[newIdx].id;
            scriptSceneIndex = newIdx;
            renderAll();
          }
        } else {
          const item = getActiveItem(freshProject);
          const sceneIds = item.sceneIds || [];
          const newIdx = direction === 'next' ? scriptSceneIndex + 1 : scriptSceneIndex - 1;
          if (newIdx >= 0 && newIdx < sceneIds.length) {
            scriptSceneIndex = newIdx;
            renderAll();
          }
        }
      });
    });

    // Toggle detail fields
    const toggleBtn = document.querySelector('.scene-detail-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const fields = document.querySelector('.scene-fields-collapsible');
        if (fields) {
          fields.classList.toggle('collapsed');
          toggleBtn.classList.toggle('collapsed');
        }
      });
    }

    // Click-to-edit fields
    document.querySelectorAll('.editable').forEach(el => {
      el.addEventListener('click', () => startEdit(el));
    });

    // Opportunity add/remove
    function toggleOpp(itemId, oppIndex, selected) {
      const item = Store.getItem(projectId, activeCategory, itemId);
      const oppList = [...item.opportunityList];
      oppList[oppIndex] = {
        ...oppList[oppIndex],
        selected,
        amount: selected ? oppList[oppIndex].amount : 0
      };
      const selectedCount = oppList.filter(o => o.selected).length;
      Store.updateItem(projectId, activeCategory, itemId, {
        opportunityList: oppList,
        opportunities: selectedCount
      });
      renderAll('opportunities');
    }

    document.querySelectorAll('.opp-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = btn.closest('.opp-item');
        toggleOpp(el.dataset.itemId, parseInt(el.dataset.oppIndex), false);
      });
    });

    document.querySelectorAll('.opp-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = btn.closest('.opp-item');
        toggleOpp(el.dataset.itemId, parseInt(el.dataset.oppIndex), true);
      });
    });

    // Opportunity amount editing
    document.querySelectorAll('.opp-amount-input').forEach(input => {
      input.addEventListener('click', (e) => e.stopPropagation());
      input.addEventListener('change', () => {
        const itemId = input.dataset.itemId;
        const oppIndex = parseInt(input.dataset.oppIndex);
        const item = Store.getItem(projectId, activeCategory, itemId);
        const oppList = [...item.opportunityList];
        oppList[oppIndex] = { ...oppList[oppIndex], amount: parseFormattedNumber(input.value) };
        Store.updateItem(projectId, activeCategory, itemId, { opportunityList: oppList });
        renderAll('opportunities');
      });
    });

    // Opportunity notes toggle
    document.querySelectorAll('.opp-notes-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = btn.closest('.opp-item-wrapper');
        const panel = wrapper.querySelector('.opp-notes-panel');
        panel.classList.toggle('collapsed');
        btn.classList.toggle('active');
        if (!panel.classList.contains('collapsed')) {
          const textarea = panel.querySelector('.opp-notes-textarea');
          if (textarea) textarea.focus();
        }
      });
    });

    // Opportunity notes auto-save
    document.querySelectorAll('.opp-notes-textarea').forEach(textarea => {
      textarea.addEventListener('click', (e) => e.stopPropagation());
      textarea.addEventListener('blur', () => {
        const itemId = textarea.dataset.itemId;
        const oppIndex = parseInt(textarea.dataset.oppIndex);
        const item = Store.getItem(projectId, activeCategory, itemId);
        const oppList = [...item.opportunityList];
        oppList[oppIndex] = { ...oppList[oppIndex], notes: textarea.value };
        Store.updateItem(projectId, activeCategory, itemId, { opportunityList: oppList });
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

        const item = Store.getItem(projectId, activeCategory, activeItemId);
        const oppList = [...item.opportunityList];
        oppList.push({ name, selected: true, amount, custom: true });
        Store.updateItem(projectId, activeCategory, activeItemId, {
          opportunityList: oppList,
          opportunities: oppList.filter(o => o.selected).length
        });
        renderAll('opportunities');
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
    const itemId = el.dataset.itemId;
    const item = Store.getItem(projectId, activeCategory, itemId);

    let currentValue;
    if (field === 'cost') {
      currentValue = item.cost;
    } else if (field === 'scriptPages') {
      currentValue = `${item.scriptPagesStart}-${item.scriptPagesEnd}`;
    } else {
      currentValue = item[field];
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

      Store.updateItem(projectId, activeCategory, itemId, updates);
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
    const itemId = el.dataset.itemId;
    const item = Store.getItem(projectId, activeCategory, itemId);
    const currentValue = item[field];

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
      Store.updateItem(projectId, activeCategory, itemId, { [field]: input.value });
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
