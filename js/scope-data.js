/* ==========================================================================
   Scope Overlay — Requirement Data per Page
   Each page has groups of requirements. The last group per page is "OUT OF SCOPE".
   Items in regular groups = MVP. Items in out-of-scope group = excluded.
   ========================================================================== */

const SCOPE_DATA = {

  /* ------------------------------------------------------------------ */
  upload: {
    title: 'Upload — Scope',
    groups: [
      {
        id: 'upload-file-ingestion',
        title: 'File Ingestion',
        items: [
          {
            id: 'upload-drag-drop',
            title: 'Drag & Drop Upload',
            description: 'Users can drag files onto the upload zone or click to browse. The zone shows visual feedback on drag-over.',
            targetSelector: '#upload-local'
          },
          {
            id: 'upload-formats',
            title: 'Supported Formats',
            description: 'Accept PDF, FDX, TXT, and Fountain screenplay formats.',
            targetSelector: '#upload-local .upload-zone-subtitle'
          },
          {
            id: 'upload-gdrive',
            title: 'Google Drive Import',
            description: 'Paste a Google Drive folder URL to import scripts from cloud storage.',
            targetSelector: '#upload-gdrive'
          },
          {
            id: 'upload-file-list',
            title: 'File List with Remove',
            description: 'Uploaded files are shown in a list with individual remove buttons and a clear-all action.',
            targetSelector: '#file-list'
          }
        ]
      },
      {
        id: 'upload-process',
        title: 'Process Action',
        items: [
          {
            id: 'upload-process-btn',
            title: 'Process Scripts Button',
            description: 'Button triggers AI analysis of all uploaded scripts and navigates to the processing page.',
            targetSelector: '#process-section'
          }
        ]
      },
      {
        id: 'upload-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'upload-oos-batch',
            title: 'Batch Upload de Múltiples Proyectos',
            description: 'Uploading multiple projects at once with separate processing pipelines.'
          },
          {
            id: 'upload-oos-dropbox',
            title: 'Dropbox / OneDrive Integration',
            description: 'Import scripts from cloud providers other than Google Drive.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  processing: {
    title: 'Processing — Scope',
    groups: [
      {
        id: 'proc-pipeline',
        title: 'Analysis Pipeline',
        items: [
          {
            id: 'proc-phases',
            title: '6-Phase Timeline',
            description: 'Animated timeline showing Script Analysis, Scene Detection, Character Detection, Environment Detection, Opportunity Detection, and Complete.',
            targetSelector: '.phase-timeline'
          },
          {
            id: 'proc-terminal',
            title: 'Real-Time Terminal Log',
            description: 'Scrolling terminal output showing AI analysis progress messages in real time.',
            targetSelector: '#terminal'
          },
          {
            id: 'proc-progress',
            title: 'Progress Bar',
            description: 'Horizontal progress bar with percentage label that updates as analysis advances.',
            targetSelector: '.processing-progress'
          }
        ]
      },
      {
        id: 'proc-discovery',
        title: 'Discovered Items',
        items: [
          {
            id: 'proc-live-cards',
            title: 'Live Discovery Cards',
            description: 'Cards appear in real-time as scenes, characters, and environments are detected. Tabs allow switching between types.',
            targetSelector: '.processing-right'
          },
          {
            id: 'proc-summary',
            title: 'Summary & Navigation',
            description: 'Summary statistics shown after analysis completes with a link to view generated proposals.',
            targetSelector: '#summary'
          }
        ]
      },
      {
        id: 'proc-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'proc-oos-cancel',
            title: 'Cancel Analysis in Progress',
            description: 'Ability to stop the AI analysis mid-process and discard partial results.'
          },
          {
            id: 'proc-oos-incremental',
            title: 'Incremental / Partial Analysis',
            description: 'Re-analyzing only changed parts of a screenplay instead of the full document.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  catalog: {
    title: 'Proposals — Scope',
    groups: [
      {
        id: 'cat-display',
        title: 'Proposal Display',
        items: [
          {
            id: 'cat-grid',
            title: 'Grid View',
            description: 'Responsive grid of proposal cards showing poster image, title, platform, category, and estimated cost.',
            targetSelector: '#project-grid'
          },
          {
            id: 'cat-stats',
            title: 'Stats Header',
            description: 'Displays total number of proposals and aggregate portfolio value at the top of the page.',
            targetSelector: '#catalog-stats'
          }
        ]
      },
      {
        id: 'cat-filtering',
        title: 'Filtering & Sorting',
        items: [
          {
            id: 'cat-filters',
            title: 'Category Filters',
            description: 'Pill-style filter buttons to show all proposals or filter by category (Animation, Drama, Live Action, etc.).',
            targetSelector: '#catalog-filters'
          },
          {
            id: 'cat-sort',
            title: 'Sort Options',
            description: 'Dropdown to sort proposals by date, quote amount, or studio name in ascending/descending order.',
            targetSelector: '.sort-control'
          }
        ]
      },
      {
        id: 'cat-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'cat-oos-search',
            title: 'Text Search',
            description: 'Free-text search across proposal titles, categories, and content.'
          },
          {
            id: 'cat-oos-export',
            title: 'Export Proposal List',
            description: 'Exporting the full list of proposals as CSV or PDF.'
          },
          {
            id: 'cat-oos-table-view',
            title: 'Table View',
            description: 'Alternative table/list view for proposals instead of the card grid.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  detail: {
    title: 'Detail — Scope',
    groups: [
      {
        id: 'det-navigation',
        title: 'Category Navigation',
        items: [
          {
            id: 'det-sidebar',
            title: 'Category Sidebar',
            description: 'Left sidebar with tabs for Scenes, Characters, and Environments. Each card shows thumbnail, name, opportunity count, and cost.',
            targetSelector: '.scene-sidebar'
          },
          {
            id: 'det-header',
            title: 'Project Header',
            description: 'Displays project title, platform badge, total cost, and aggregate stats (opportunities, scenes, characters, environments). Includes back link and finalize button.',
            targetSelector: '.detail-header'
          }
        ]
      },
      {
        id: 'det-preview',
        title: 'Item Preview & Editing',
        items: [
          {
            id: 'det-item-detail',
            title: 'Item Detail Preview',
            description: 'Large preview area with image/video, description, VFX notes, script excerpt, and metadata for the selected item.',
            targetSelector: '.scene-detail'
          },
          {
            id: 'det-opportunities',
            title: 'Opportunities List',
            description: 'Checkboxes for each VFX opportunity with editable cost. Selecting/deselecting updates the running total in real-time.',
            targetSelector: '.detail-lists'
          },
          {
            id: 'det-script',
            title: 'Script Viewer',
            description: 'Tab showing the original script text with highlighted passages relevant to the selected scene.',
            targetSelector: '[data-scope-id="script-viewer"]'
          },
          {
            id: 'det-cost-calc',
            title: 'Real-Time Cost Calculation',
            description: 'Cost updates live as opportunities are toggled on/off. Reflected in the header total and sidebar card.',
            targetSelector: '.detail-header-cost'
          }
        ]
      },
      {
        id: 'det-actions',
        title: 'Actions',
        items: [
          {
            id: 'det-finalize',
            title: 'Finalize Button',
            description: 'Navigates to the confirmation page with the current approval/decline state for all items.',
            targetSelector: '[data-scope-id="finalize-btn"]'
          }
        ]
      },
      {
        id: 'det-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'det-oos-complexity',
            title: 'Shot-Level Complexity Scoring',
            description: 'AI-generated complexity ratings per shot within a scene.'
          },
          {
            id: 'det-oos-storyboard',
            title: 'Storyboard Analysis',
            description: 'Uploading and analyzing storyboard images alongside the screenplay.'
          },
          {
            id: 'det-oos-inline-edit',
            title: 'Inline Script Editing',
            description: 'Editing the screenplay text directly within the script viewer.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  confirmation: {
    title: 'Confirmation — Scope',
    groups: [
      {
        id: 'conf-summary',
        title: 'Summary',
        items: [
          {
            id: 'conf-card',
            title: 'Summary Card',
            description: 'Top card showing project title, platform, date, total estimated cost, scene/character/environment counts, and services.',
            targetSelector: '.confirm-summary'
          },
          {
            id: 'conf-totals',
            title: 'Approved / Declined Totals',
            description: 'Breakdown showing approved total, declined total, and grand total with color-coded values.',
            targetSelector: '.confirm-breakdown'
          }
        ]
      },
      {
        id: 'conf-tables',
        title: 'Breakdown Tables',
        items: [
          {
            id: 'conf-scene-table',
            title: 'Scene Breakdown Table',
            description: 'Table with per-scene opportunities, individual costs, and approval status badges.',
            targetSelector: '[data-scope-id="scene-breakdown"]'
          },
          {
            id: 'conf-char-table',
            title: 'Character Breakdown Table',
            description: 'Same table format for characters with their opportunities and costs.',
            targetSelector: '[data-scope-id="char-breakdown"]'
          },
          {
            id: 'conf-env-table',
            title: 'Environment Breakdown Table',
            description: 'Same table format for environments with their opportunities and costs.',
            targetSelector: '[data-scope-id="env-breakdown"]'
          }
        ]
      },
      {
        id: 'conf-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'conf-oos-auto-send',
            title: 'Automatic Client Delivery',
            description: 'Sending the final proposal directly to the client via email from within the app.'
          },
          {
            id: 'conf-oos-signature',
            title: 'Digital Signature',
            description: 'Client signature capture and approval workflow within the platform.'
          },
          {
            id: 'conf-oos-versions',
            title: 'Version History',
            description: 'Tracking and comparing different versions/revisions of the same proposal.'
          }
        ]
      }
    ]
  }
};
