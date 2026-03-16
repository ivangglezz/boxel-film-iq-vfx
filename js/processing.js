/* ==========================================================================
   Processing Screen — Agent Animation Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  // Render navbar
  document.getElementById('app-navbar').innerHTML = renderNavbar('upload');

  // Get data
  const uploadedFiles = Store.getUploadedFiles();
  const projects = Store.getProjects();

  // If no files were uploaded, redirect back
  if (!uploadedFiles.length) {
    window.location.href = 'index.html';
    return;
  }

  // Use first project as the one being "analyzed"
  const project = projects[0];
  const scenes = project.scenes || [];

  // Set file badge
  document.getElementById('file-badge-name').textContent = uploadedFiles[0];

  // DOM refs
  const terminalEl = document.getElementById('terminal');
  const progressFill = document.getElementById('progress-fill');
  const progressStatus = document.getElementById('progress-status');
  const progressPercent = document.getElementById('progress-percent');
  const scenesContainer = document.getElementById('scenes-container');
  const scenesHeader = document.getElementById('scenes-header');
  const summaryEl = document.getElementById('summary');
  const summaryStats = document.getElementById('summary-stats');
  const summaryActions = document.getElementById('summary-actions');

  // Helpers
  function delay(ms) {
    const jitter = (Math.random() - 0.5) * 80;
    return new Promise(r => setTimeout(r, ms + jitter));
  }

  function getTimestamp() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function addTerminalLine(text, type = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.innerHTML = `
      <span class="terminal-timestamp">[${getTimestamp()}]</span>
      <span class="terminal-text">${text}</span>
    `;
    terminalEl.appendChild(line);
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }

  function updateProgress(percent, status) {
    progressFill.style.width = percent + '%';
    progressPercent.textContent = percent + '%';
    if (status) progressStatus.textContent = status;
  }

  function setPhase(num, state) {
    const el = document.getElementById(`phase-${num}`);
    el.className = `phase-step ${state}`;
  }

  function setPhaseCounter(num, html) {
    document.getElementById(`phase-${num}-counter`).innerHTML = html;
  }

  function extractLocation(scriptText) {
    if (!scriptText) return 'UNKNOWN';
    const lines = scriptText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/i)) {
        return trimmed;
      }
    }
    return lines[0] || 'UNKNOWN';
  }

  function createSceneCard(scene, index) {
    const location = extractLocation(scene.scriptText);
    const card = document.createElement('div');
    card.className = 'scene-card';
    card.id = `scene-card-${index}`;
    card.innerHTML = `
      <div class="scene-card-header">
        <span class="scene-number">SC ${String(index + 1).padStart(2, '0')}</span>
        <span class="scene-name">${scene.name}</span>
      </div>
      <div class="scene-meta">
        <span>${location}</span>
        <span>${scene.duration || scene.estimatedLength || ''}</span>
        <span class="complexity-badge complexity-${scene.complexity || 'medium'}">${(scene.complexity || 'medium').toUpperCase()}</span>
      </div>
      <div class="scene-opportunities" id="scene-opps-${index}"></div>
    `;
    return card;
  }

  // ---- Phase orchestration ----
  async function runProcessing() {
    await phase1_scriptAnalysis();
    await phase2_sceneDetection();
    await phase3_opportunities();
    await phase4_summary();
  }

  // Phase 1: Script Analysis (0s - 4s)
  async function phase1_scriptAnalysis() {
    setPhase(1, 'active');
    updateProgress(0, 'Analyzing screenplay...');

    const fileName = uploadedFiles[0];
    const lines = [
      { text: `> Loading screenplay: <strong>${fileName}</strong>`, type: 'highlight' },
      { text: '> Initializing NLP pipeline...', type: '' },
      { text: '> Parsing document structure...', type: '' },
      { text: '> Extracting dialogue and scene headings...', type: '' },
      { text: `> Found <strong>${scenes.length * 18} pages</strong>, <strong>${scenes.length} acts</strong>`, type: 'info' },
      { text: '> Screenplay format: Standard US format detected', type: '' },
      { text: '> Character extraction complete — 12 principal characters identified', type: 'highlight' },
      { text: '> Scene structure analysis ready. Proceeding to detection...', type: 'success' },
    ];

    for (let i = 0; i < lines.length; i++) {
      addTerminalLine(lines[i].text, lines[i].type);
      const progress = Math.round((i + 1) / lines.length * 25);
      updateProgress(progress, 'Analyzing screenplay...');
      await delay(450);
    }

    setPhase(1, 'complete');
  }

  // Phase 2: Scene Detection (4s - 10s)
  async function phase2_sceneDetection() {
    setPhase(2, 'active');
    updateProgress(25, 'Detecting scenes...');

    addTerminalLine('> Beginning scene detection pass...', '');
    await delay(400);

    scenesHeader.style.display = 'block';

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const location = extractLocation(scene.scriptText);
      const shortLocation = location.length > 50 ? location.substring(0, 50) + '...' : location;

      addTerminalLine(
        `> Scene ${i + 1} detected: "<strong>${scene.name}</strong>" [${shortLocation}]`,
        'highlight'
      );

      const card = createSceneCard(scene, i);
      scenesContainer.appendChild(card);

      const progress = 25 + Math.round((i + 1) / scenes.length * 30);
      updateProgress(progress, 'Detecting scenes...');
      setPhaseCounter(2, `Scenes found: <span class="count-value">${i + 1}</span>`);

      await delay(650);
    }

    addTerminalLine(`> All <strong>${scenes.length} scenes</strong> identified successfully.`, 'success');
    setPhase(2, 'complete');
    await delay(300);
  }

  // Phase 3: Opportunity Detection (10s - 16s)
  async function phase3_opportunities() {
    setPhase(3, 'active');
    updateProgress(55, 'Detecting opportunities...');

    addTerminalLine('> Scanning scenes for VFX/service opportunities...', '');
    await delay(400);

    let totalOpps = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const selectedOpps = (scene.opportunityList || []).filter(o => o.selected);
      const oppsContainer = document.getElementById(`scene-opps-${i}`);

      if (selectedOpps.length > 0) {
        const oppNames = selectedOpps.map(o => o.name).join(', ');
        addTerminalLine(
          `> Scene ${i + 1}: Detected <strong>${selectedOpps.length}</strong> opportunities — ${oppNames}`,
          'highlight'
        );

        // Add badges one by one with stagger
        for (let j = 0; j < selectedOpps.length; j++) {
          const badge = document.createElement('span');
          badge.className = 'scene-opp-badge';
          badge.textContent = selectedOpps[j].name;
          badge.style.animationDelay = `${j * 80}ms`;
          oppsContainer.appendChild(badge);
          totalOpps++;
        }

        // Show cost
        if (scene.cost) {
          const costEl = document.createElement('div');
          costEl.className = 'scene-cost';
          costEl.innerHTML = `<span class="cost-label">Est. Cost</span>${formatCurrency(scene.cost)}`;
          document.getElementById(`scene-card-${i}`).appendChild(costEl);
        }
      } else {
        addTerminalLine(`> Scene ${i + 1}: No VFX opportunities detected`, '');
      }

      setPhaseCounter(3, `Opportunities: <span class="count-value">${totalOpps}</span>`);
      const progress = 55 + Math.round((i + 1) / scenes.length * 35);
      updateProgress(progress, 'Detecting opportunities...');

      await delay(800);
    }

    addTerminalLine(`> Total: <strong>${totalOpps} opportunities</strong> across ${scenes.length} scenes.`, 'success');
    setPhase(3, 'complete');
    await delay(300);
  }

  // Phase 4: Summary (16s - 18s)
  async function phase4_summary() {
    setPhase(4, 'active');
    updateProgress(92, 'Generating proposal...');

    addTerminalLine('> Calculating cost estimates...', '');
    await delay(500);
    addTerminalLine('> Compiling opportunity matrix...', '');
    await delay(500);
    addTerminalLine(`> Proposal generated for "<strong>${project.title}</strong>"`, 'success');
    await delay(400);
    addTerminalLine('> Analysis complete. Ready for review.', 'success');

    updateProgress(100, 'Analysis complete');
    setPhase(4, 'complete');
    setPhaseCounter(4, '<span class="count-value">Done</span>');

    // Show summary stats
    const totalCost = scenes.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalOpps = scenes.reduce((sum, s) => {
      return sum + (s.opportunityList || []).filter(o => o.selected).length;
    }, 0);

    summaryStats.innerHTML = `
      <div class="summary-stat" style="animation-delay: 0s">
        <div class="summary-stat-value">${scenes.length}</div>
        <div class="summary-stat-label">Scenes</div>
      </div>
      <div class="summary-stat" style="animation-delay: 0.15s">
        <div class="summary-stat-value">${totalOpps}</div>
        <div class="summary-stat-label">Opportunities</div>
      </div>
      <div class="summary-stat" style="animation-delay: 0.3s">
        <div class="summary-stat-value">${formatCurrency(totalCost)}</div>
        <div class="summary-stat-label">Estimated Budget</div>
      </div>
    `;

    summaryEl.classList.add('visible');
    await delay(600);

    // Point "VIEW PROPOSALS" link to the detail page for this project
    const viewLink = summaryActions.querySelector('a');
    if (viewLink) viewLink.href = `detail.html?id=${project.id}`;
    summaryActions.style.display = 'flex';
  }

  // Start!
  runProcessing();
});
