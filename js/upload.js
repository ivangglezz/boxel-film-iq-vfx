/* ==========================================================================
   Upload Scripts Page — Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  // Render navbar
  document.getElementById('app-navbar').innerHTML = renderNavbar('upload');

  const localZone = document.getElementById('upload-local');
  const gdriveZone = document.getElementById('upload-gdrive');
  const fileInput = document.getElementById('file-input');
  const gdriveInput = document.getElementById('gdrive-url');
  const fileListEl = document.getElementById('file-list');
  const processSection = document.getElementById('process-section');

  let files = [];

  // --- Local Upload Zone ---
  localZone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') fileInput.click();
  });

  localZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    localZone.classList.add('drag-over');
  });

  localZone.addEventListener('dragleave', () => {
    localZone.classList.remove('drag-over');
  });

  localZone.addEventListener('drop', (e) => {
    e.preventDefault();
    localZone.classList.remove('drag-over');
    addFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener('change', () => {
    addFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });

  // --- Google Drive Zone ---
  gdriveInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = gdriveInput.value.trim();
      if (url) {
        addFiles([{ name: `Google Drive: ${url.substring(0, 50)}...`, type: 'gdrive', size: 0 }]);
        gdriveInput.value = '';
      }
    }
  });

  // Prevent zone click from interfering with input
  gdriveZone.addEventListener('click', (e) => {
    if (e.target !== gdriveInput) {
      gdriveInput.focus();
    }
  });

  // --- File Management ---
  function addFiles(newFiles) {
    newFiles.forEach(f => {
      const ext = f.name.split('.').pop().toUpperCase();
      files.push({
        id: Date.now() + Math.random(),
        name: f.name || f,
        type: f.type === 'gdrive' ? 'GDRIVE' : ext,
        size: f.size || 0
      });
    });
    renderFileList();
  }

  function removeFile(id) {
    files = files.filter(f => f.id !== id);
    renderFileList();
  }

  function renderFileList() {
    if (files.length === 0) {
      fileListEl.innerHTML = '';
      processSection.style.display = 'none';
      return;
    }

    processSection.style.display = 'flex';

    fileListEl.innerHTML = `
      <div class="file-list-header">
        <h3>${files.length} Script${files.length > 1 ? 's' : ''} Ready</h3>
        <button class="btn btn-ghost btn-sm" onclick="clearFiles()">CLEAR ALL</button>
      </div>
      ${files.map(f => `
        <div class="file-item">
          <div class="file-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <span class="file-item-name">${f.name}</span>
          <span class="file-item-type">${f.type}</span>
          <button class="file-item-remove" onclick="removeFileById(${f.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `).join('')}
    `;
  }

  // Expose to global scope for inline handlers
  window.removeFileById = (id) => removeFile(id);
  window.clearFiles = () => { files = []; renderFileList(); };

  // --- Process Scripts ---
  window.processScripts = () => {
    if (files.length === 0) return;

    // Save file names and redirect to processing screen
    Store.setUploadedFiles(files.map(f => f.name));
    window.location.href = 'processing.html';
  };
});
