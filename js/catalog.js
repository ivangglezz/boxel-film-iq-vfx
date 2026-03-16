/* ==========================================================================
   Proposals Catalog Page — Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  document.getElementById('app-navbar').innerHTML = renderNavbar('proposals');

  const projects = Store.getProjects();
  let activeFilter = 'ALL';
  let activeSort = 'date-desc';

  renderStats(projects);
  renderFilters();
  renderGrid(applySort(projects));

  function renderStats(filteredProjects) {
    const totalCost = filteredProjects.reduce((sum, p) => sum + p.totalCost, 0);
    document.getElementById('catalog-stats').innerHTML = `
      <div class="catalog-stat">
        <div class="catalog-stat-value">${filteredProjects.length}</div>
        <div class="catalog-stat-label">PROPOSALS</div>
      </div>
      <div class="catalog-stat">
        <div class="catalog-stat-value">${formatCurrency(totalCost)}</div>
        <div class="catalog-stat-label">TOTAL VALUE</div>
      </div>
    `;
  }

  function applySort(list) {
    const sorted = [...list];
    switch (activeSort) {
      case 'quote-desc':
        sorted.sort((a, b) => b.totalCost - a.totalCost);
        break;
      case 'quote-asc':
        sorted.sort((a, b) => a.totalCost - b.totalCost);
        break;
      case 'studio-az':
        sorted.sort((a, b) => a.platform.localeCompare(b.platform));
        break;
      case 'studio-za':
        sorted.sort((a, b) => b.platform.localeCompare(a.platform));
        break;
      case 'date-desc':
        sorted.sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
        break;
      case 'date-asc':
        sorted.sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || ''));
        break;
    }
    return sorted;
  }

  function getFilteredProjects() {
    return activeFilter === 'ALL'
      ? projects
      : projects.filter(p => p.category.toUpperCase() === activeFilter);
  }

  function renderFilters() {
    const categories = ['ALL', ...new Set(projects.map(p => p.category.toUpperCase()))];
    document.getElementById('catalog-filters').innerHTML = `
      <div class="filter-bar">
        <div class="filter-pills">
          ${categories.map(cat => `
            <button class="filter-pill ${cat === activeFilter ? 'active' : ''}" data-filter="${cat}">${cat}</button>
          `).join('')}
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
      </div>
    `;

    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        const filtered = getFilteredProjects();
        renderStats(filtered);
        renderFilters();
        renderGrid(applySort(filtered));
      });
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
      activeSort = e.target.value;
      const filtered = getFilteredProjects();
      renderGrid(applySort(filtered));
    });
  }

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
          <p>No proposals found for this category</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filteredProjects.map((project, index) => {
      const initials = project.title.split(' ').map(w => w[0]).join('').substring(0, 3);
      const gradientStyle = `background: linear-gradient(${project.gradientAngle}deg, ${project.gradientColors.join(', ')})`;
      const hasThumbnail = !!project.thumbnail;

      const posterContent = hasThumbnail
        ? `<div class="card-poster" style="${gradientStyle}">
            <img class="card-poster-img" src="${project.thumbnail}" alt="${project.title}" onerror="this.style.display='none'">
            <span class="card-poster-initials">${initials}</span>
            <span class="card-poster-platform">${project.platform}</span>
          </div>`
        : `<div class="card-poster" style="${gradientStyle}">
            <span class="card-poster-initials">${initials}</span>
            <span class="card-poster-platform">${project.platform}</span>
          </div>`;

      const isNew = project.dateAdded && (Date.now() - new Date(project.dateAdded + 'T00:00:00').getTime()) < 14 * 86400000;
      const staggerDelay = Math.min(index * 0.05, 0.4);
      return `
        <a href="detail.html?id=${project.id}" class="project-card card-animate" style="animation-delay:${staggerDelay}s">
          ${isNew ? '<span class="card-new-indicator">NEW</span>' : ''}
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
});
