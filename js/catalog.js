/* ==========================================================================
   Proposals Catalog Page — Logic
   Enhanced with Insights Panel, Status/Platform filters, List view
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  if (!requireAuth()) return;

  document.getElementById('app-navbar').innerHTML = renderNavbar('proposals');

  const projects = Store.getProjects();
  const session = Store.getSession();
  const isManager = session && session.role === 'manager';

  /* --- Preference persistence keys --- */
  const PREF_VIEW = 'boxel_catalog_view';
  const PREF_INSIGHTS = 'boxel_insights_open';

  /* --- State --- */
  let activeStatusFilter = 'ALL';
  let activeCategoryFilter = 'ALL';
  let activePlatform = 'ALL';
  let activeSort = 'date-desc';
  let activeView = localStorage.getItem(PREF_VIEW) || (isManager ? 'list' : 'grid');
  let insightsOpen = localStorage.getItem(PREF_INSIGHTS) !== null
    ? localStorage.getItem(PREF_INSIGHTS) === 'true'
    : isManager;

  /* --- Role-aware defaults for manager --- */
  if (isManager && !localStorage.getItem(PREF_VIEW)) {
    activeStatusFilter = 'FINALIZED';
  }

  /* --- Initial render --- */
  renderAll();
  renderInsights();
  applyInsightsState();

  /* --- Insights toggle --- */
  document.getElementById('insights-toggle').addEventListener('click', () => {
    insightsOpen = !insightsOpen;
    localStorage.setItem(PREF_INSIGHTS, insightsOpen);
    applyInsightsState();
  });

  /* =======================================================================
     Filtering & Sorting
     ======================================================================= */

  function getFilteredProjects() {
    return projects
      .filter(p => activeStatusFilter === 'ALL' || getProjectStatus(p) === activeStatusFilter)
      .filter(p => activeCategoryFilter === 'ALL' || p.category.toUpperCase() === activeCategoryFilter)
      .filter(p => activePlatform === 'ALL' || p.platform === activePlatform);
  }

  function applySort(list) {
    const sorted = [...list];
    switch (activeSort) {
      case 'quote-desc': sorted.sort((a, b) => b.totalCost - a.totalCost); break;
      case 'quote-asc':  sorted.sort((a, b) => a.totalCost - b.totalCost); break;
      case 'studio-az':  sorted.sort((a, b) => a.platform.localeCompare(b.platform)); break;
      case 'studio-za':  sorted.sort((a, b) => b.platform.localeCompare(a.platform)); break;
      case 'date-desc':  sorted.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || '')); break;
      case 'date-asc':   sorted.sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || '')); break;
    }
    return sorted;
  }

  function renderAll() {
    const filtered = getFilteredProjects();
    renderStats(filtered);
    renderFilters();
    const sorted = applySort(filtered);
    renderGrid(sorted);
    renderList(sorted);
    applyViewState();
  }

  /* =======================================================================
     Header Stats (filtered — 4 metrics)
     ======================================================================= */

  function renderStats(filteredProjects) {
    const totalCost = filteredProjects.reduce((sum, p) => sum + p.totalCost, 0);
    const drafts = filteredProjects.filter(p => !p.validated).length;
    const finalized = filteredProjects.filter(p => p.validated).length;
    document.getElementById('catalog-stats').innerHTML = `
      <div class="catalog-stat">
        <div class="catalog-stat-value">${filteredProjects.length}</div>
        <div class="catalog-stat-label">PROPOSALS</div>
      </div>
      <div class="catalog-stat">
        <div class="catalog-stat-value">${formatCurrency(totalCost)}</div>
        <div class="catalog-stat-label">TOTAL VALUE</div>
      </div>
      <div class="catalog-stat">
        <div class="catalog-stat-value">${drafts}</div>
        <div class="catalog-stat-label">DRAFTS</div>
      </div>
      <div class="catalog-stat">
        <div class="catalog-stat-value">${finalized}</div>
        <div class="catalog-stat-label">FINALIZED</div>
      </div>
    `;
  }

  /* =======================================================================
     Filter Bar
     ======================================================================= */

  function renderFilters() {
    const categories = ['ALL', ...new Set(projects.map(p => p.category.toUpperCase()))];
    const platforms = [...new Set(projects.map(p => p.platform))].sort();

    document.getElementById('catalog-filters').innerHTML = `
      <div class="filter-bar">
        <div class="filter-pills-row">
          <div class="filter-pills filter-pills-status">
            ${['ALL', 'DRAFT', 'FINALIZED'].map(s => `
              <button class="filter-pill ${s === activeStatusFilter ? 'active' : ''}" data-status="${s}">${s}</button>
            `).join('')}
          </div>
          <div class="filter-divider"></div>
          <div class="filter-pills filter-pills-category">
            ${categories.map(cat => `
              <button class="filter-pill ${cat === activeCategoryFilter ? 'active' : ''}" data-category="${cat}">${cat}</button>
            `).join('')}
          </div>
        </div>
        <div class="filter-controls">
          <div class="sort-control">
            <label class="sort-label" for="platform-select">PLATFORM</label>
            <select id="platform-select" class="sort-select">
              <option value="ALL" ${activePlatform === 'ALL' ? 'selected' : ''}>All</option>
              ${platforms.map(p => `<option value="${p}" ${activePlatform === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="sort-control">
            <label class="sort-label" for="sort-select">SORT BY</label>
            <select id="sort-select" class="sort-select">
              <option value="date-desc" ${activeSort === 'date-desc' ? 'selected' : ''}>Date Added (Newest)</option>
              <option value="date-asc" ${activeSort === 'date-asc' ? 'selected' : ''}>Date Added (Oldest)</option>
              <option value="quote-desc" ${activeSort === 'quote-desc' ? 'selected' : ''}>Quote High → Low</option>
              <option value="quote-asc" ${activeSort === 'quote-asc' ? 'selected' : ''}>Quote Low → High</option>
              <option value="studio-az" ${activeSort === 'studio-az' ? 'selected' : ''}>Studio A → Z</option>
              <option value="studio-za" ${activeSort === 'studio-za' ? 'selected' : ''}>Studio Z → A</option>
            </select>
          </div>
          <div class="view-toggle">
            <button class="view-toggle-btn ${activeView === 'grid' ? 'active' : ''}" data-view="grid" title="Grid view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button class="view-toggle-btn ${activeView === 'list' ? 'active' : ''}" data-view="list" title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    /* --- Event listeners --- */
    document.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeStatusFilter = btn.dataset.status;
        renderAll();
      });
    });

    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategoryFilter = btn.dataset.category;
        renderAll();
      });
    });

    document.getElementById('platform-select').addEventListener('change', (e) => {
      activePlatform = e.target.value;
      renderAll();
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
      activeSort = e.target.value;
      const filtered = getFilteredProjects();
      const sorted = applySort(filtered);
      renderGrid(sorted);
      renderList(sorted);
    });

    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeView = btn.dataset.view;
        localStorage.setItem(PREF_VIEW, activeView);
        applyViewState();
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  /* =======================================================================
     View State
     ======================================================================= */

  function applyViewState() {
    const grid = document.getElementById('project-grid');
    const list = document.getElementById('project-list');
    grid.style.display = activeView === 'grid' ? '' : 'none';
    list.style.display = activeView === 'list' ? '' : 'none';
  }

  /* =======================================================================
     Insights Panel
     ======================================================================= */

  function applyInsightsState() {
    const panel = document.getElementById('catalog-insights');
    const toggleBtn = document.getElementById('insights-toggle');
    if (insightsOpen) {
      panel.classList.remove('collapsed');
      toggleBtn.classList.add('active');
    } else {
      panel.classList.add('collapsed');
      toggleBtn.classList.remove('active');
    }
  }

  function renderInsights() {
    const total = projects.length;
    const totalValue = projects.reduce((sum, p) => sum + p.totalCost, 0);
    const drafts = projects.filter(p => !p.validated).length;
    const finalized = projects.filter(p => p.validated).length;

    const now = new Date();
    const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastDate.getFullYear() + '-' + String(lastDate.getMonth() + 1).padStart(2, '0');

    const thisMonthProjects = projects.filter(p => p.dateAdded && p.dateAdded.startsWith(thisMonth));
    const lastMonthProjects = projects.filter(p => p.dateAdded && p.dateAdded.startsWith(lastMonth));
    const thisMonthValue = thisMonthProjects.reduce((s, p) => s + p.totalCost, 0);
    const lastMonthValue = lastMonthProjects.reduce((s, p) => s + p.totalCost, 0);

    /* Platform breakdown */
    const platformMap = {};
    projects.forEach(p => {
      if (!platformMap[p.platform]) platformMap[p.platform] = { count: 0, value: 0 };
      platformMap[p.platform].count++;
      platformMap[p.platform].value += p.totalCost;
    });
    const platformRows = Object.entries(platformMap)
      .sort((a, b) => b[1].value - a[1].value)
      .map(([name, data]) => `
        <tr>
          <td>${name}</td>
          <td class="text-right">${data.count}</td>
          <td class="text-right">${formatCurrency(data.value)}</td>
        </tr>
      `).join('');

    /* Top services */
    const serviceFreq = {};
    projects.forEach(p => {
      (p.services || []).forEach(s => {
        serviceFreq[s] = (serviceFreq[s] || 0) + 1;
      });
    });
    const topServices = Object.entries(serviceFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `
        <tr>
          <td>${name}</td>
          <td class="text-right">${count}</td>
        </tr>
      `).join('');

    document.getElementById('catalog-insights').innerHTML = `
      <div class="insights-inner">
        <div class="insights-grid">
          <div class="insights-stat-card">
            <div class="insights-stat-value">${total}</div>
            <div class="insights-stat-label">TOTAL QUOTES</div>
          </div>
          <div class="insights-stat-card">
            <div class="insights-stat-value">${formatCurrency(totalValue)}</div>
            <div class="insights-stat-label">PORTFOLIO VALUE</div>
          </div>
          <div class="insights-stat-card insights-stat-draft">
            <div class="insights-stat-value">${drafts}</div>
            <div class="insights-stat-label">DRAFTS</div>
          </div>
          <div class="insights-stat-card insights-stat-finalized">
            <div class="insights-stat-value">${finalized}</div>
            <div class="insights-stat-label">FINALIZED</div>
          </div>
          <div class="insights-stat-card">
            <div class="insights-stat-value">${thisMonthProjects.length} <span class="insights-stat-sub">${formatCurrency(thisMonthValue)}</span></div>
            <div class="insights-stat-label">THIS MONTH</div>
          </div>
          <div class="insights-stat-card">
            <div class="insights-stat-value">${lastMonthProjects.length} <span class="insights-stat-sub">${formatCurrency(lastMonthValue)}</span></div>
            <div class="insights-stat-label">LAST MONTH</div>
          </div>
        </div>
        <div class="insights-tables">
          <div class="insights-table-section">
            <h4 class="insights-table-title">BY PLATFORM</h4>
            <table class="insights-table">
              <thead><tr><th>Platform</th><th class="text-right">Quotes</th><th class="text-right">Value</th></tr></thead>
              <tbody>${platformRows}</tbody>
            </table>
          </div>
          <div class="insights-table-section">
            <h4 class="insights-table-title">TOP SERVICES</h4>
            <table class="insights-table">
              <thead><tr><th>Service</th><th class="text-right">Used</th></tr></thead>
              <tbody>${topServices}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* =======================================================================
     Grid View
     ======================================================================= */

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderGrid(filteredProjects) {
    const grid = document.getElementById('project-grid');

    if (filteredProjects.length === 0) {
      grid.innerHTML = `
        <div class="catalog-empty card-animate">
          <svg class="catalog-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <p>No proposals match the current filters</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filteredProjects.map((project, index) => {
      const initials = project.title.split(' ').map(w => w[0]).join('').substring(0, 3);
      const gradientStyle = `background: linear-gradient(${project.gradientAngle}deg, ${project.gradientColors.join(', ')})`;
      const hasThumbnail = !!project.thumbnail;
      const status = getProjectStatus(project);
      const statusClass = status === 'FINALIZED' ? 'status-finalized' : 'status-draft';

      const posterContent = `<div class="card-poster" style="${gradientStyle}">
            ${hasThumbnail ? `<img class="card-poster-img" src="${project.thumbnail}" alt="${project.title}" onerror="this.style.display='none'">` : ''}
            <span class="card-poster-initials">${initials}</span>
            <span class="card-poster-platform">${project.platform}</span>
          </div>`;

      const isNew = project.dateAdded && (Date.now() - new Date(project.dateAdded + 'T00:00:00').getTime()) < 14 * 86400000;
      const staggerDelay = Math.min(index * 0.05, 0.4);
      return `
        <a href="detail.html?id=${project.id}" class="project-card card-animate" style="animation-delay:${staggerDelay}s">
          ${isNew ? '<span class="card-new-indicator">NEW</span>' : ''}
          <span class="card-status-indicator ${statusClass}">${status === 'FINALIZED' ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ' : ''}${status}</span>
          ${posterContent}
          <div class="project-card-content">
            <div class="project-card-tag-row">
              <span class="project-card-tag">${project.category}</span>
              ${project.dateAdded ? `<span class="project-card-date">${formatDate(project.dateAdded)}</span>` : ''}
            </div>
            <h3 class="project-card-title">${project.title}</h3>
            <p class="project-card-services">${project.services.slice(0, 3).join(' · ')}</p>
          </div>
          <div class="project-card-stats">
            <div class="card-stat">
              <span class="card-stat-value">${formatCurrency(project.totalCost)}</span>
              <span class="card-stat-label">QUOTE</span>
            </div>
            <div class="card-stat">
              <span class="card-stat-value">${project.totalOpportunities}</span>
              <span class="card-stat-label">OPPS</span>
            </div>
            <div class="card-stat">
              <span class="card-stat-value">${project.totalScenes}</span>
              <span class="card-stat-label">SCENES</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  /* =======================================================================
     List / Table View
     ======================================================================= */

  function renderList(filteredProjects) {
    const container = document.getElementById('project-list');

    if (filteredProjects.length === 0) {
      container.innerHTML = `
        <div class="catalog-empty card-animate">
          <svg class="catalog-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <p>No proposals match the current filters</p>
        </div>
      `;
      return;
    }

    const rows = filteredProjects.map((project, index) => {
      const initials = project.title.split(' ').map(w => w[0]).join('').substring(0, 2);
      const gradientStyle = `background: linear-gradient(${project.gradientAngle}deg, ${project.gradientColors.join(', ')})`;
      const status = getProjectStatus(project);
      const badgeClass = status === 'FINALIZED' ? 'badge-finalized' : 'badge-draft';
      const staggerDelay = Math.min(index * 0.03, 0.3);

      return `
        <tr class="list-row card-animate" style="animation-delay:${staggerDelay}s" onclick="window.location.href='detail.html?id=${project.id}'">
          <td class="list-cell-project">
            <div class="list-project-thumb" style="${gradientStyle}">
              ${project.thumbnail ? `<img src="${project.thumbnail}" alt="" onerror="this.style.display='none'">` : ''}
              <span class="list-thumb-initials">${initials}</span>
            </div>
            <span class="list-project-title">${project.title}</span>
          </td>
          <td>${project.platform}</td>
          <td><span class="project-card-tag">${project.category}</span></td>
          <td><span class="list-badge ${badgeClass}">${status}</span></td>
          <td class="text-right">${project.totalScenes}</td>
          <td class="text-right">${project.totalOpportunities}</td>
          <td class="text-right">${formatCurrency(project.totalCost)}</td>
          <td>${formatDate(project.dateAdded)}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="list-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Platform</th>
            <th>Category</th>
            <th>Status</th>
            <th class="text-right">Scenes</th>
            <th class="text-right">Opps</th>
            <th class="text-right">Quote</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
});
