/* ==========================================================================
   Proposal Confirmation Page — Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  document.getElementById('app-navbar').innerHTML = renderNavbar('proposals');

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const project = Store.getProject(projectId);

  if (!project) {
    document.getElementById('confirm-content').innerHTML = '<div style="padding:80px;text-align:center;color:#6A7887;">Project not found. <a href="catalog.html" style="color:#9375C0">Back to catalog</a></div>';
    return;
  }

  renderConfirmation(project);

  function renderConfirmation(p) {
    const approvedScenes = p.scenes.filter(s => s.status !== 'declined');
    const declinedScenes = p.scenes.filter(s => s.status === 'declined');
    const approvedCost = approvedScenes.reduce((sum, s) => sum + s.cost, 0);
    const declinedCost = declinedScenes.reduce((sum, s) => sum + s.cost, 0);
    const totalOpps = approvedScenes.reduce((count, s) => count + (s.opportunityList || []).filter(o => o.selected).length, 0);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('confirm-content').innerHTML = `
      <!-- Summary Card -->
      <div class="confirm-summary">
        <div class="confirm-summary-gradient"></div>
        <div class="confirm-summary-body">
          <div class="confirm-summary-top">
            <div>
              <h1 class="confirm-summary-title">${p.title}</h1>
              <p class="confirm-summary-subtitle">Production Proposal — ${p.category}</p>
            </div>
            <div class="confirm-total">
              <div class="confirm-total-label">ESTIMATED TOTAL</div>
              <div class="confirm-total-value">${formatCurrency(approvedCost)}</div>
              ${declinedScenes.length > 0 ? `<div class="confirm-total-approved">${approvedScenes.length} of ${p.scenes.length} scenes approved</div>` : ''}
            </div>
          </div>
          <div class="confirm-meta">
            <div class="confirm-meta-item">
              <span class="confirm-meta-label">PLATFORM</span>
              <span class="confirm-meta-value">${p.platform}</span>
            </div>
            <div class="confirm-meta-item">
              <span class="confirm-meta-label">DATE</span>
              <span class="confirm-meta-value">${today}</span>
            </div>
            <div class="confirm-meta-item">
              <span class="confirm-meta-label">SCENES</span>
              <span class="confirm-meta-value">${approvedScenes.length} approved</span>
            </div>
            <div class="confirm-meta-item">
              <span class="confirm-meta-label">OPPORTUNITIES</span>
              <span class="confirm-meta-value">${totalOpps}</span>
            </div>
            <div class="confirm-meta-item">
              <span class="confirm-meta-label">SERVICES</span>
              <span class="confirm-meta-value">${p.services.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Breakdown Table -->
      <div class="confirm-table-wrap">
        <div class="confirm-table-header">
          <h3>Scene Breakdown</h3>
        </div>
        <table class="confirm-table">
          <thead>
            <tr>
              <th>Scene</th>
              <th>Opportunities</th>
              <th>Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${p.scenes.map(scene => {
              const rowClass = scene.status === 'declined' ? 'declined' : '';
              const statusBadge = scene.status === 'approved'
                ? '<span class="badge badge-success">APPROVED</span>'
                : scene.status === 'declined'
                ? '<span class="badge badge-error">DECLINED</span>'
                : '<span class="badge">PENDING</span>';

              const selectedOpps = (scene.opportunityList || [])
                .filter(o => o.selected)
                .sort((a, b) => (a.custom ? 1 : 0) - (b.custom ? 1 : 0));
              const hasCustom = selectedOpps.some(o => o.custom);
              const oppsText = selectedOpps
                .map(o => `${o.name} (${formatCurrency(o.amount || 0)})${o.custom ? ' *' : ''}`)
                .join(', ') || '—';

              return `
                <tr class="${rowClass}">
                  <td class="td-scene-name">${scene.name}</td>
                  <td class="td-opps">${oppsText}</td>
                  <td class="td-cost">${formatCurrency(scene.cost)}</td>
                  <td>${statusBadge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td class="total-label" colspan="2">APPROVED TOTAL</td>
              <td class="total-value" colspan="2">${formatCurrency(approvedCost)}</td>
            </tr>
          </tfoot>
          ${p.scenes.some(s => (s.opportunityList || []).some(o => o.selected && o.custom)) ? '<div class="confirm-footnote">* Custom opportunity</div>' : ''}
        </table>
        <div class="confirm-breakdown">
          <div class="confirm-breakdown-item">
            <span class="confirm-breakdown-label">APPROVED</span>
            <span class="confirm-breakdown-value success">${formatCurrency(approvedCost)}</span>
          </div>
          ${declinedCost > 0 ? `
            <div class="confirm-breakdown-item">
              <span class="confirm-breakdown-label">DECLINED</span>
              <span class="confirm-breakdown-value error">${formatCurrency(declinedCost)}</span>
            </div>
          ` : ''}
          <div class="confirm-breakdown-item">
            <span class="confirm-breakdown-label">GRAND TOTAL</span>
            <span class="confirm-breakdown-value accent">${formatCurrency(p.totalCost)}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="confirm-actions no-print">
        <a href="detail.html?id=${p.id}" class="btn btn-ghost btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          BACK TO DETAIL
        </a>
        <button class="btn btn-primary" onclick="downloadPDF()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          DOWNLOAD PDF
        </button>
        <button class="btn btn-outline" onclick="showEmailModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          SEND BY EMAIL
        </button>
        <button class="btn btn-secondary" onclick="saveValidated()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          SAVE AS VALIDATED
        </button>
      </div>

      <!-- Footer -->
      <div class="confirm-footer no-print">
        Generated by Boxel Studio Quoting Tool — ${today}
      </div>

      <!-- Email Modal -->
      <div id="email-modal" class="modal-overlay">
        <div class="modal">
          <div class="email-modal-content">
            <h3>Send Proposal</h3>
            <div class="input-group">
              <label class="input-label">RECIPIENT EMAIL</label>
              <input type="email" id="email-input" placeholder="client@example.com">
            </div>
            <div class="input-group">
              <label class="input-label">MESSAGE (OPTIONAL)</label>
              <textarea id="email-message" rows="3" placeholder="Add a note to the proposal..." style="resize:vertical;min-height:80px;"></textarea>
            </div>
            <div class="email-modal-actions">
              <button class="btn btn-ghost btn-sm" onclick="closeEmailModal()">CANCEL</button>
              <button class="btn btn-secondary btn-sm" onclick="sendEmail()">SEND</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Action handlers
  window.downloadPDF = () => {
    window.print();
  };

  window.showEmailModal = () => {
    document.getElementById('email-modal').classList.add('active');
  };

  window.closeEmailModal = () => {
    document.getElementById('email-modal').classList.remove('active');
  };

  window.sendEmail = () => {
    const email = document.getElementById('email-input').value;
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }
    closeEmailModal();
    showToast(`Proposal sent to ${email}`, 'success');
  };

  window.saveValidated = () => {
    Store.validateProject(projectId);
    showToast('Proposal saved as validated', 'success');
  };
});
