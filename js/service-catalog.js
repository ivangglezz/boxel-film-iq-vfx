/* ==========================================================================
   Boxel Studio Quoting Agent — Service Catalog Page Logic
   ========================================================================== */

let deleteTarget = null; // { type: 'service'|'group', id: '...' }
const collapsedGroups = new Set(); // Track collapsed state

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  if (!requireAuth()) return;

  document.getElementById('app-navbar').innerHTML = renderNavbar('services');
  render();

  // Form handlers
  document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
  document.getElementById('group-form').addEventListener('submit', handleGroupSubmit);

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
});

/* ---- Render ---- */

function render() {
  const services = Store.getServices();
  const groups = Store.getServiceGroups();

  // Update stats
  document.getElementById('stat-services').textContent = services.length;
  document.getElementById('stat-groups').textContent = groups.length;

  const container = document.getElementById('svc-groups-container');
  const emptyState = document.getElementById('svc-empty');

  if (services.length === 0 && groups.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.style.display = 'flex';
  emptyState.style.display = 'none';

  // Build groups HTML
  let html = '';

  // Named groups
  groups.forEach(group => {
    const groupServices = services.filter(s => s.groupId === group.id);
    const isCollapsed = collapsedGroups.has(group.id);
    html += renderGroup(group, groupServices, isCollapsed);
  });

  // Uncategorized services
  const uncategorized = services.filter(s => !s.groupId);
  if (uncategorized.length > 0) {
    html += renderUncategorizedGroup(uncategorized);
  }

  container.innerHTML = html;

  // Set initial max-height for collapsed bodies to 0 (so CSS transition works on first toggle)
  container.querySelectorAll('.svc-group-body.collapsed').forEach(body => {
    body.style.maxHeight = '0px';
  });

  // Update group select dropdown in service modal
  updateGroupSelect();
}

function renderGroup(group, services, isCollapsed) {
  const chevronClass = isCollapsed ? '' : 'open';
  const bodyClass = isCollapsed ? 'collapsed' : '';

  return `
    <div class="svc-group" data-group-id="${group.id}" data-scope-id="svc-groups">
      <div class="svc-group-header" onclick="toggleGroup('${group.id}')">
        <svg class="svc-group-chevron ${chevronClass}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
        <span class="svc-group-name">${escapeHtml(group.name)}</span>
        <span class="svc-group-count">${services.length} service${services.length !== 1 ? 's' : ''}</span>
        <div class="svc-group-actions" onclick="event.stopPropagation()">
          <button class="btn-icon-xs" onclick="openGroupModal('${group.id}')" title="Edit group" data-scope-id="svc-edit-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon-xs btn-delete" onclick="openDeleteModal('group', '${group.id}', '${escapeHtml(group.name)}', ${services.length})" title="Delete group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="svc-group-body ${bodyClass}">
        ${services.map(s => renderServiceRow(s)).join('')}
      </div>
    </div>
  `;
}

function renderUncategorizedGroup(services) {
  return `
    <div class="svc-group svc-group-uncategorized">
      <div class="svc-group-header" onclick="toggleGroup('uncategorized')">
        <svg class="svc-group-chevron ${collapsedGroups.has('uncategorized') ? '' : 'open'}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
        <span class="svc-group-name">Uncategorized</span>
        <span class="svc-group-count">${services.length} service${services.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="svc-group-body ${collapsedGroups.has('uncategorized') ? 'collapsed' : ''}">
        ${services.map(s => renderServiceRow(s)).join('')}
      </div>
    </div>
  `;
}

function renderServiceRow(service) {
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(service.price || 0);
  return `
    <div class="svc-row">
      <div class="svc-row-info">
        <div class="svc-row-name">${escapeHtml(service.name)}</div>
        <div class="svc-row-desc">${escapeHtml(service.description || '')}</div>
      </div>
      <span class="svc-row-price">${price} / UNIT</span>
      <div class="svc-row-actions">
        <button class="btn-icon-xs" onclick="openServiceModal('${service.id}')" title="Edit service" data-scope-id="svc-edit-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon-xs btn-delete" onclick="openDeleteModal('service', '${service.id}', '${escapeHtml(service.name)}')" title="Delete service" data-scope-id="svc-remove-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `;
}

/* ---- Group Toggle ---- */

function toggleGroup(groupId) {
  const groupEl = document.querySelector(`.svc-group[data-group-id="${groupId}"]`) ||
                  (groupId === 'uncategorized' ? document.querySelector('.svc-group-uncategorized') : null);
  if (!groupEl) return;

  const body = groupEl.querySelector('.svc-group-body');
  const chevron = groupEl.querySelector('.svc-group-chevron');
  if (!body) return;

  if (collapsedGroups.has(groupId)) {
    // Expand
    collapsedGroups.delete(groupId);
    body.style.maxHeight = body.scrollHeight + 'px';
    body.classList.remove('collapsed');
    if (chevron) chevron.classList.add('open');
    // After transition, remove inline maxHeight so it adapts to content changes
    body.addEventListener('transitionend', function handler() {
      body.style.maxHeight = '';
      body.removeEventListener('transitionend', handler);
    });
  } else {
    // Collapse: set explicit height first so transition works from a known value
    collapsedGroups.add(groupId);
    body.style.maxHeight = body.scrollHeight + 'px';
    // Force reflow then set to 0
    body.offsetHeight; // eslint-disable-line no-unused-expressions
    body.style.maxHeight = '0px';
    body.classList.add('collapsed');
    if (chevron) chevron.classList.remove('open');
  }
}

/* ---- Modals ---- */

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

/* Service Modal */
function openServiceModal(serviceId) {
  const titleEl = document.getElementById('service-modal-title');
  const form = document.getElementById('service-form');
  const editIdEl = document.getElementById('svc-edit-id');

  updateGroupSelect();

  if (serviceId) {
    // Edit mode
    const service = Store.getServices().find(s => s.id === serviceId);
    if (!service) return;
    titleEl.textContent = 'Edit Service';
    document.getElementById('svc-name').value = service.name;
    document.getElementById('svc-desc').value = service.description || '';
    document.getElementById('svc-price').value = service.price || 0;
    document.getElementById('svc-group').value = service.groupId || '';
    editIdEl.value = serviceId;
  } else {
    // Add mode
    titleEl.textContent = 'Add New Service';
    form.reset();
    editIdEl.value = '';
  }

  openModal('service-modal');
}

function handleServiceSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('svc-name').value.trim();
  const description = document.getElementById('svc-desc').value.trim();
  const price = parseInt(document.getElementById('svc-price').value) || 0;
  const groupId = document.getElementById('svc-group').value || null;
  const editId = document.getElementById('svc-edit-id').value;

  if (!name) return;

  if (editId) {
    Store.updateService(editId, { name, description, price, groupId });
    showToast('Service updated', 'success');
  } else {
    Store.addService({ name, description, price, groupId });
    showToast('Service added', 'success');
  }

  closeModal('service-modal');
  render();
}

/* Group Modal */
function openGroupModal(groupId) {
  const titleEl = document.getElementById('group-modal-title');
  const form = document.getElementById('group-form');
  const editIdEl = document.getElementById('grp-edit-id');

  if (groupId) {
    const group = Store.getServiceGroups().find(g => g.id === groupId);
    if (!group) return;
    titleEl.textContent = 'Edit Group';
    document.getElementById('grp-name').value = group.name;
    editIdEl.value = groupId;
  } else {
    titleEl.textContent = 'Add New Group';
    form.reset();
    editIdEl.value = '';
  }

  openModal('group-modal');
}

function handleGroupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('grp-name').value.trim();
  const editId = document.getElementById('grp-edit-id').value;

  if (!name) return;

  if (editId) {
    Store.updateServiceGroup(editId, { name });
    showToast('Group updated', 'success');
  } else {
    Store.addServiceGroup({ name });
    showToast('Group added', 'success');
  }

  closeModal('group-modal');
  render();
}

/* Delete Modal */
function openDeleteModal(type, id, name, childCount) {
  deleteTarget = { type, id };
  const titleEl = document.getElementById('delete-modal-title');
  const descEl = document.getElementById('delete-modal-desc');

  if (type === 'service') {
    titleEl.textContent = 'Delete Service?';
    descEl.innerHTML = `Are you sure you want to remove <strong>"${escapeHtml(name)}"</strong> from the catalog? This action cannot be undone.`;
  } else {
    titleEl.textContent = 'Delete Group?';
    let msg = `Are you sure you want to remove <strong>"${escapeHtml(name)}"</strong>? This action cannot be undone.`;
    if (childCount > 0) {
      msg += `<br><br>This will unassign ${childCount} service${childCount !== 1 ? 's' : ''} from this group.`;
    }
    descEl.innerHTML = msg;
  }

  openModal('delete-modal');
}

function confirmDelete() {
  if (!deleteTarget) return;

  if (deleteTarget.type === 'service') {
    Store.deleteService(deleteTarget.id);
    showToast('Service removed', 'info');
  } else {
    Store.deleteServiceGroup(deleteTarget.id);
    showToast('Group removed', 'info');
  }

  deleteTarget = null;
  closeModal('delete-modal');
  render();
}

/* ---- Helpers ---- */

function updateGroupSelect() {
  const select = document.getElementById('svc-group');
  const groups = Store.getServiceGroups();
  const currentValue = select.value;

  select.innerHTML = '<option value="">Uncategorized</option>' +
    groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');

  select.value = currentValue;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
