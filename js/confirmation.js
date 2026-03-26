/* ==========================================================================
   Proposal Confirmation Page — Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();
  if (!requireAuth()) return;

  document.getElementById('app-navbar').innerHTML = renderNavbar('proposals');

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');
  const project = Store.getProject(projectId);

  if (!project) {
    document.getElementById('confirm-content').innerHTML = '<div style="padding:80px;text-align:center;color:#6A7887;">Project not found. <a href="catalog.html" style="color:#9375C0">Back to catalog</a></div>';
    return;
  }

  renderConfirmation(project);

  function renderItemRow(item) {
    const rowClass = item.status === 'declined' ? 'declined' : '';
    const statusBadge = item.status === 'approved'
      ? '<span class="badge badge-success">APPROVED</span>'
      : item.status === 'declined'
      ? '<span class="badge badge-error">DECLINED</span>'
      : '<span class="badge">PENDING</span>';

    const selectedOpps = (item.opportunityList || [])
      .filter(o => o.selected)
      .sort((a, b) => (a.custom ? 1 : 0) - (b.custom ? 1 : 0));
    const oppsText = selectedOpps
      .map(o => o.name + ' (' + formatCurrency(o.amount || 0) + ')' + (o.custom ? ' *' : ''))
      .join(', ') || '—';

    return '<tr class="' + rowClass + '">' +
      '<td class="td-scene-name">' + item.name + '</td>' +
      '<td class="td-opps">' + oppsText + '</td>' +
      '<td class="td-cost">' + formatCurrency(item.cost) + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '</tr>';
  }

  function renderCategoryTable(items, categoryLabel, itemLabel) {
    if (!items || items.length === 0) return '';

    const hasCustom = items.some(function(s) {
      return (s.opportunityList || []).some(function(o) { return o.selected && o.custom; });
    });
    const catApproved = items.filter(function(s) { return s.status !== 'declined'; })
      .reduce(function(sum, s) { return sum + (s.cost || 0); }, 0);

    const rows = items.map(renderItemRow).join('');

    return '<div class="confirm-table-wrap">' +
      '<div class="confirm-table-header"><h3>' + categoryLabel + ' Breakdown</h3></div>' +
      '<table class="confirm-table">' +
      '<thead><tr><th>' + itemLabel + '</th><th>Opportunities</th><th>Cost</th><th>Status</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td class="total-label" colspan="2">APPROVED TOTAL</td>' +
      '<td class="total-value" colspan="2">' + formatCurrency(catApproved) + '</td></tr></tfoot>' +
      (hasCustom ? '<div class="confirm-footnote">* Custom opportunity</div>' : '') +
      '</table></div>';
  }

  function renderConfirmation(p) {
    const categories = typeof ALL_CATEGORIES !== 'undefined' ? ALL_CATEGORIES : ['scenes', 'characters', 'environments'];
    let approvedCost = 0;
    let declinedCost = 0;
    let totalOpps = 0;
    let totalApprovedItems = 0;
    let totalItems = 0;

    categories.forEach(function(cat) {
      (p[cat] || []).forEach(function(item) {
        totalItems++;
        if (item.status !== 'declined') {
          approvedCost += item.cost || 0;
          totalApprovedItems++;
          totalOpps += (item.opportunityList || []).filter(function(o) { return o.selected; }).length;
        } else {
          declinedCost += item.cost || 0;
        }
      });
    });

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const charsCount = (p.characters || []).length;
    const envsCount = (p.environments || []).length;

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
              ${totalItems !== totalApprovedItems ? '<div class="confirm-total-approved">' + totalApprovedItems + ' of ' + totalItems + ' items approved</div>' : ''}
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
              <span class="confirm-meta-value">${(p.scenes || []).length}</span>
            </div>
            ${charsCount > 0 ? '<div class="confirm-meta-item"><span class="confirm-meta-label">CHARACTERS</span><span class="confirm-meta-value">' + charsCount + '</span></div>' : ''}
            ${envsCount > 0 ? '<div class="confirm-meta-item"><span class="confirm-meta-label">ENVIRONMENTS</span><span class="confirm-meta-value">' + envsCount + '</span></div>' : ''}
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

      <!-- Breakdown Tables -->
      <div data-scope-id="scene-breakdown">${renderCategoryTable(p.scenes, 'Scene', 'Scene')}</div>
      <div data-scope-id="char-breakdown">${renderCategoryTable(p.characters, 'Character', 'Character')}</div>
      <div data-scope-id="env-breakdown">${renderCategoryTable(p.environments, 'Environment', 'Environment')}</div>

      <!-- Totals -->
      <div class="confirm-table-wrap">
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
