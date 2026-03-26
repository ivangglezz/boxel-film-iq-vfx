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
      const data = JSON.parse(existing);
      const firstScene = data.projects && data.projects[0] && data.projects[0].scenes && data.projects[0].scenes[0];

      // Migrate: if old data has no opportunityList, reset
      if (firstScene && !firstScene.opportunityList) {
        localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
        return this.getAll();
      }

      // Migrate: add amount to opportunities if missing
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

      // Migrate: add characters/environments arrays if missing
      const firstProject = data.projects && data.projects[0];
      if (firstProject && !firstProject.characters) {
        localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
        return this.getAll();
      }

      // Migrate: add sceneIds to characters if missing
      const firstChar = firstProject && firstProject.characters && firstProject.characters[0];
      if (firstChar && !firstChar.sceneIds) {
        localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
        return this.getAll();
      }

      // Migrate: add users, services, serviceGroups if missing
      if (!data.users || !data.services || !data.serviceGroups) {
        if (!data.users) data.users = SEED_DATA.users;
        if (!data.services) data.services = SEED_DATA.services;
        if (!data.serviceGroups) data.serviceGroups = SEED_DATA.serviceGroups;
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      }

      // Migrate: add validated field to projects if missing
      const needsValidatedMigration = data.projects && data.projects.some(p => p.validated === undefined);
      if (needsValidatedMigration) {
        data.projects.forEach(p => {
          if (p.validated === undefined) p.validated = false;
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

  /** Get item from any category */
  getItem(projectId, category, itemId) {
    const project = this.getProject(projectId);
    if (!project) return null;
    const list = project[category] || [];
    return list.find(item => item.id === itemId) || null;
  },

  /** Update item in any category */
  updateItem(projectId, category, itemId, updates) {
    const data = this.getAll();
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return null;
    const list = project[category] || [];
    const idx = list.findIndex(item => item.id === itemId);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.recalculateProjectTotals(data, projectId);
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return list[idx];
  },

  /** Get a specific scene (backward compat wrapper) */
  getScene(projectId, sceneId) {
    return this.getItem(projectId, 'scenes', sceneId);
  },

  /** Update a scene within a project (backward compat wrapper) */
  updateScene(projectId, sceneId, updates) {
    return this.updateItem(projectId, 'scenes', sceneId, updates);
  },

  /** Recalculate project totals across all categories */
  recalculateProjectTotals(data, projectId) {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    const categories = typeof ALL_CATEGORIES !== 'undefined' ? ALL_CATEGORIES : ['scenes', 'characters', 'environments'];
    let totalCost = 0;
    const oppSet = new Set();

    categories.forEach(cat => {
      (project[cat] || []).forEach(item => {
        const selectedOpps = (item.opportunityList || []).filter(o => o.selected);
        if (selectedOpps.length > 0) {
          item.cost = selectedOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
        }
        if (!item.removed) {
          totalCost += item.cost || 0;
          selectedOpps.forEach(o => oppSet.add(o.name));
        }
      });
    });

    project.totalCost = totalCost;
    project.totalOpportunities = oppSet.size;
    project.totalScenes = (project.scenes || []).length;
    project.totalCharacters = (project.characters || []).length;
    project.totalEnvironments = (project.environments || []).length;
  },

  /** Get approved cost for a project (across all categories) */
  getApprovedCost(projectId) {
    const project = this.getProject(projectId);
    if (!project) return 0;
    const categories = typeof ALL_CATEGORIES !== 'undefined' ? ALL_CATEGORIES : ['scenes', 'characters', 'environments'];
    let total = 0;
    categories.forEach(cat => {
      (project[cat] || []).forEach(item => {
        if (item.status !== 'declined') {
          total += item.cost || 0;
        }
      });
    });
    return total;
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
  },

  /* ================================================================
     Authentication
     ================================================================ */

  /** Login: find user by email/username and password, set session */
  login(identifier, password) {
    const data = this.getAll();
    const users = data.users || [];
    const user = users.find(u =>
      (u.email === identifier || u.username === identifier) && u.password === password
    );
    if (!user) return null;
    const session = { userId: user.id, email: user.email, name: user.name, role: user.role, loggedInAt: new Date().toISOString() };
    localStorage.setItem('boxel_session', JSON.stringify(session));
    return session;
  },

  /** Logout: clear session */
  logout() {
    localStorage.removeItem('boxel_session');
  },

  /** Get current session */
  getSession() {
    const raw = localStorage.getItem('boxel_session');
    return raw ? JSON.parse(raw) : null;
  },

  /** Check if authenticated */
  isAuthenticated() {
    return !!this.getSession();
  },

  /** Get current user full object */
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const data = this.getAll();
    return (data.users || []).find(u => u.id === session.userId) || null;
  },

  /** Update user password */
  updatePassword(userId, newPassword) {
    const data = this.getAll();
    const user = (data.users || []).find(u => u.id === userId);
    if (!user) return false;
    user.password = newPassword;
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return true;
  },

  /* ================================================================
     Service Catalog
     ================================================================ */

  /** Get all service groups */
  getServiceGroups() {
    const data = this.getAll();
    return data.serviceGroups || [];
  },

  /** Add a service group */
  addServiceGroup(group) {
    const data = this.getAll();
    if (!data.serviceGroups) data.serviceGroups = [];
    const newGroup = { id: 'grp-' + Date.now(), ...group };
    data.serviceGroups.push(newGroup);
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return newGroup;
  },

  /** Update a service group */
  updateServiceGroup(groupId, updates) {
    const data = this.getAll();
    const idx = (data.serviceGroups || []).findIndex(g => g.id === groupId);
    if (idx === -1) return null;
    data.serviceGroups[idx] = { ...data.serviceGroups[idx], ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data.serviceGroups[idx];
  },

  /** Delete a service group (unassigns services) */
  deleteServiceGroup(groupId) {
    const data = this.getAll();
    data.serviceGroups = (data.serviceGroups || []).filter(g => g.id !== groupId);
    (data.services || []).forEach(s => {
      if (s.groupId === groupId) s.groupId = null;
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return true;
  },

  /** Get all services */
  getServices() {
    const data = this.getAll();
    return data.services || [];
  },

  /** Add a service */
  addService(service) {
    const data = this.getAll();
    if (!data.services) data.services = [];
    const newService = { id: 'svc-' + Date.now(), ...service };
    data.services.push(newService);
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return newService;
  },

  /** Update a service */
  updateService(serviceId, updates) {
    const data = this.getAll();
    const idx = (data.services || []).findIndex(s => s.id === serviceId);
    if (idx === -1) return null;
    data.services[idx] = { ...data.services[idx], ...updates };
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data.services[idx];
  },

  /** Delete a service */
  deleteService(serviceId) {
    const data = this.getAll();
    data.services = (data.services || []).filter(s => s.id !== serviceId);
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return true;
  }
};

// Utility: get project status label
function getProjectStatus(project) {
  return project.validated ? 'FINALIZED' : 'DRAFT';
}

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
    { id: 'proposals', label: 'PROPOSALS', href: 'catalog.html' },
    { id: 'services', label: 'SERVICES', href: 'service-catalog.html' }
  ];

  const session = Store.getSession();
  const initials = session ? session.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
  const displayName = session ? session.name : 'Guest';
  return `
    <nav class="navbar">
      <a href="index.html" class="navbar-brand">
        <img src="img/boxel-logo.png" alt="Boxel Studio" class="navbar-logo-img">
      </a>
      <div class="navbar-links">
        ${pages.map(p => `
          <a href="${p.href}" class="navbar-link ${activePage === p.id ? 'active' : ''} ${p.disabled ? 'disabled' : ''}"${p.disabled ? ' title="Coming soon"' : ''}>${p.label}</a>
        `).join('')}
      </div>
      <div class="navbar-right">
        <button class="btn-icon btn-icon-sm" onclick="Store.reset(); location.reload();" title="Reset demo data">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
        <div class="user-menu" id="user-menu">
          <button class="user-avatar" onclick="toggleUserMenu()" title="${displayName}">
            ${initials}
          </button>
          <div class="user-dropdown" id="user-dropdown">
            <div class="user-dropdown-info">
              <span class="user-dropdown-name">${displayName}</span>
            </div>
            <div class="user-dropdown-divider"></div>
            <button class="user-dropdown-item" onclick="handleSignOut()">Sign Out</button>
          </div>
        </div>
      </div>
    </nav>
    <div class="gradient-divider"></div>
  `;
}

// Toggle user dropdown
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('active');
}

// Close user menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('user-menu');
  if (menu && !menu.contains(e.target)) {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.remove('active');
  }
});

// Sign out handler
function handleSignOut() {
  Store.logout();
  window.location.href = 'auth.html';
}

// Auth guard — call from every page except auth.html
function requireAuth() {
  if (!Store.isAuthenticated()) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}
