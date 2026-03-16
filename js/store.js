/* ==========================================================================
   Boxel Studio Quoting Agent — localStorage Store
   ========================================================================== */

const STORE_KEY = 'boxel_quoting_data';

const Store = {
  /** Initialize store with seed data if empty */
  init() {
    const existing = localStorage.getItem(STORE_KEY);
    if (!existing) {
      localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
    } else {
      // Migrate: if old data has actionSequences instead of complexity, reset
      const data = JSON.parse(existing);
      const firstScene = data.projects && data.projects[0] && data.projects[0].scenes && data.projects[0].scenes[0];
      if (firstScene && !firstScene.opportunityList) {
        localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
      }
      // Migrate: add amount to opportunities if missing (replaces old hours field)
      const firstOpp = firstScene && firstScene.opportunityList && firstScene.opportunityList[0];
      if (firstOpp && firstOpp.amount === undefined) {
        data.projects.forEach(p => {
          p.scenes.forEach(s => {
            const selected = (s.opportunityList || []).filter(o => o.selected);
            const perOpp = selected.length > 0 ? Math.round(s.cost / selected.length) : 0;
            (s.opportunityList || []).forEach(o => {
              o.amount = o.selected ? perOpp : 0;
              delete o.hours;
            });
          });
        });
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      }
    }
    return this.getAll();
  },

  /** Reset store to seed data */
  reset() {
    localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
    return this.getAll();
  },

  /** Get all data */
  getAll() {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  },

  /** Get all projects */
  getProjects() {
    const data = this.getAll();
    return data.projects || [];
  },

  /** Get single project by ID */
  getProject(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },

  /** Update a project */
  updateProject(id, updates) {
    const data = this.getAll();
    const idx = data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    data.projects[idx] = { ...data.projects[idx], ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data.projects[idx];
  },

  /** Get a specific scene */
  getScene(projectId, sceneId) {
    const project = this.getProject(projectId);
    if (!project) return null;
    return project.scenes.find(s => s.id === sceneId) || null;
  },

  /** Update a scene within a project */
  updateScene(projectId, sceneId, updates) {
    const data = this.getAll();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return null;
    const sceneIdx = project.scenes.findIndex(s => s.id === sceneId);
    if (sceneIdx === -1) return null;
    project.scenes[sceneIdx] = { ...project.scenes[sceneIdx], ...updates };
    this.recalculateProjectTotals(data, projectId);
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return project.scenes[sceneIdx];
  },

  /** Recalculate project totals from scenes (scene.cost = sum of selected opportunity amounts) */
  recalculateProjectTotals(data, projectId) {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    // Recalculate each scene's cost from its selected opportunity amounts
    project.scenes.forEach(s => {
      const selectedOpps = (s.opportunityList || []).filter(o => o.selected);
      if (selectedOpps.length > 0) {
        s.cost = selectedOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
      }
    });

    project.totalCost = project.scenes.reduce((sum, s) => sum + (s.cost || 0), 0);
    project.totalOpportunities = project.scenes.reduce((set, s) => {
      (s.opportunityList || []).filter(o => o.selected).forEach(o => set.add(o.name));
      return set;
    }, new Set()).size;
    project.totalScenes = project.scenes.length;
  },

  /** Get approved cost for a project */
  getApprovedCost(projectId) {
    const project = this.getProject(projectId);
    if (!project) return 0;
    return project.scenes
      .filter(s => s.status !== 'declined')
      .reduce((sum, s) => sum + (s.cost || 0), 0);
  },

  /** Get uploaded files */
  getUploadedFiles() {
    const data = this.getAll();
    return data.uploadedFiles || [];
  },

  /** Set uploaded files */
  setUploadedFiles(files) {
    const data = this.getAll();
    data.uploadedFiles = files;
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  },

  /** Mark a project as validated */
  validateProject(projectId) {
    return this.updateProject(projectId, { validated: true, validatedAt: new Date().toISOString() });
  }
};

// Utility: format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// Utility: show toast notification
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utility: render navbar
function renderNavbar(activePage) {
  const pages = [
    { id: 'upload', label: 'UPLOAD', href: 'index.html' },
    { id: 'proposals', label: 'PROPOSALS', href: 'catalog.html' }
  ];

  return `
    <nav class="navbar">
      <a href="index.html" class="navbar-brand">
        <img src="img/boxel-logo.png" alt="Boxel Studio" class="navbar-logo-img">
      </a>
      <div class="navbar-links">
        ${pages.map(p => `
          <a href="${p.href}" class="navbar-link ${activePage === p.id ? 'active' : ''}">${p.label}</a>
        `).join('')}
      </div>
      <button class="btn-icon" onclick="Store.reset(); location.reload();" title="Reset demo data">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
    </nav>
    <div class="gradient-divider"></div>
  `;
}
