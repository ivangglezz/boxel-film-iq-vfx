/* ==========================================================================
   Scope Overlay — Requirement Data per Page
   Each page has groups of requirements. The last group per page is "OUT OF SCOPE".
   Items in regular groups = MVP. Items in out-of-scope group = excluded.
   Rule: 1 FR = 1 item, always. Sequential, no duplicates, no combinations.
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
            fr: 'FR1',
            title: 'Drag & Drop Upload',
            description: 'Specialist can upload screenplay files via drag & drop or file browser. The upload zone shows visual feedback on drag-over.',
            targetSelector: '#upload-local'
          },
          {
            id: 'upload-gdrive',
            fr: 'FR2',
            title: 'Google Drive Import',
            description: 'Specialist can import screenplays from a Google Drive folder URL.',
            targetSelector: '#upload-gdrive'
          },
          {
            id: 'upload-formats',
            fr: 'FR3',
            title: 'Supported Formats',
            description: 'System accepts PDF, FDX, TXT, and Fountain screenplay formats.',
            targetSelector: '#upload-local .upload-zone-subtitle'
          },
          {
            id: 'upload-file-list',
            fr: 'FR4',
            title: 'File List Preview',
            description: 'Specialist can view a list of uploaded files before processing.',
            targetSelector: '#file-list'
          },
          {
            id: 'upload-remove-files',
            fr: 'FR5',
            title: 'Remove Files',
            description: 'Specialist can remove individual files or clear all files from the upload list.',
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
            fr: 'FR6',
            title: 'Trigger AI Analysis',
            description: 'Specialist can trigger AI analysis of all uploaded screenplays. Navigates to the processing page.',
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
        id: 'proc-detection',
        title: 'AI Detection',
        items: [
          {
            id: 'proc-scene-detection',
            fr: 'FR7',
            title: 'VFX Scene Detection',
            description: 'System can analyze a screenplay and detect VFX scenes.',
            targetSelector: '.phase-timeline'
          },
          {
            id: 'proc-character-detection',
            fr: 'FR8',
            title: 'VFX Character Detection',
            description: 'System can analyze a screenplay and detect VFX characters.',
            targetSelector: '.phase-timeline'
          },
          {
            id: 'proc-environment-detection',
            fr: 'FR9',
            title: 'VFX Environment Detection',
            description: 'System can analyze a screenplay and detect VFX environments.',
            targetSelector: '.phase-timeline'
          },
          {
            id: 'proc-asset-detection',
            fr: 'FR10',
            title: 'VFX Asset Detection',
            description: 'System can analyze a screenplay and detect VFX assets (props, vehicles, weapons, etc.).',
            targetSelector: '.phase-timeline'
          },
          {
            id: 'proc-catalog-mapping',
            fr: 'FR11',
            title: 'Service Catalog Mapping',
            description: 'System can map detected items to services from the studio\'s service catalog for initial pricing.',
            targetSelector: '.phase-timeline'
          }
        ]
      },
      {
        id: 'proc-pipeline',
        title: 'Analysis Pipeline',
        items: [
          {
            id: 'proc-progress',
            fr: 'FR12',
            title: 'Analysis Progress Display',
            description: 'System can display analysis progress per phase — animated timeline, real-time terminal log, and progress bar with percentage.',
            targetSelector: '.processing-progress'
          },
          {
            id: 'proc-live-cards',
            fr: 'FR13',
            title: 'Real-Time Discovery Cards',
            description: 'System can display discovered items in real time as each phase completes. Tabs allow switching between scenes, characters, environments, and assets.',
            targetSelector: '.processing-right'
          },
          {
            id: 'proc-summary',
            fr: 'FR14',
            title: 'Analysis Summary',
            description: 'System can display a summary of all detected items after analysis completes, with a link to view generated proposals.',
            targetSelector: '#summary'
          },
          {
            id: 'proc-historical-pricing',
            fr: 'FR15',
            title: 'Historical Pricing Reference',
            description: 'System can reference historical quotes to inform pricing suggestions for newly detected items.',
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
          },
          {
            id: 'proc-oos-pm-integration',
            title: 'External PM Tool Integration',
            description: 'Integration with external project management tools like ShotGrid or ftrack.'
          },
          {
            id: 'proc-oos-api-integrations',
            title: 'API Integrations',
            description: 'API integrations with production tracking and accounting systems. Phase 3 feature.'
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
            fr: 'FR16',
            title: 'Proposal Grid & List Views',
            description: 'Specialist can view all generated proposals in a responsive grid layout or a table/list layout, toggling between views. Cards show poster image, title, platform, category, status, and estimated cost.',
            targetSelector: '#project-grid'
          },
          {
            id: 'cat-filters',
            fr: 'FR17',
            title: 'Multi-Dimension Filters',
            description: 'Specialist can filter proposals by status (Draft/Finalized), category (Animation, VFX), and client platform. Pill-style filter buttons for status and category, dropdown for platform.',
            targetSelector: '#catalog-filters'
          },
          {
            id: 'cat-sort',
            fr: 'FR18',
            title: 'Sort Options',
            description: 'Specialist can sort proposals by date, quote amount, or studio name in ascending/descending order.',
            targetSelector: '.sort-control'
          },
          {
            id: 'cat-stats',
            fr: 'FR19',
            title: 'Aggregate Stats',
            description: 'Specialist can view aggregate stats — total proposals, portfolio value, draft count, and finalized count — at the top of the page. Stats update reactively with active filters.',
            targetSelector: '#catalog-stats'
          },
          {
            id: 'cat-select-proposal',
            fr: 'FR20',
            title: 'Proposal Selection',
            description: 'Specialist can select a proposal to view its full detail. Clicking a card or table row navigates to the detail page.',
            targetSelector: '#project-grid'
          }
        ]
      },
      {
        id: 'cat-dashboard',
        title: 'Executive Dashboard',
        items: [
          {
            id: 'cat-quote-list',
            fr: 'FR43',
            title: 'Quote List',
            description: 'Manager can view a list of all quotes with status summary, project name, date, and total cost via the table/list view.',
            targetSelector: '#project-list'
          },
          {
            id: 'cat-insights',
            fr: 'FR44',
            title: 'Executive Insights Sidebar',
            description: 'Manager can view executive-level summary of quoting activity — platform breakdown and top services — in an insights sidebar that splits the view alongside a compact quote list.',
            targetSelector: '#catalog-insights'
          },
          {
            id: 'cat-view-quote',
            fr: 'FR45',
            title: 'View Quote Detail',
            description: 'Manager can open any quote to view its full detail by clicking a card or table row.',
            targetSelector: '#project-list'
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
            id: 'cat-oos-mobile',
            title: 'Mobile-Optimized Interface',
            description: 'Responsive mobile-first layout for proposal browsing on phones and tablets.'
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
            fr: 'FR21',
            title: 'Category Browsing',
            description: 'Specialist can browse detected items by category (scenes, characters, environments, assets) in a sidebar. Each card shows thumbnail, name, opportunity count, and cost.',
            targetSelector: '.scene-sidebar'
          }
        ]
      },
      {
        id: 'det-preview',
        title: 'Item Preview & Editing',
        items: [
          {
            id: 'det-item-detail',
            fr: 'FR22',
            title: 'Item Detail Preview',
            description: 'Specialist can view item detail with image/video, description, VFX notes, script excerpt, and metadata for the selected item.',
            targetSelector: '.scene-detail'
          },
          {
            id: 'det-opportunities',
            fr: 'FR23',
            title: 'Opportunity Selection',
            description: 'Specialist can select or deselect individual VFX opportunities per item via checkboxes.',
            targetSelector: '.detail-lists'
          },
          {
            id: 'det-cost-notes',
            fr: 'FR24',
            title: 'Cost Editing & Notes',
            description: 'Specialist can edit the cost and add notes to individual opportunities.',
            targetSelector: '.detail-lists'
          },
          {
            id: 'det-cost-calc',
            fr: 'FR25',
            title: 'Real-Time Cost Calculation',
            description: 'System can update the running total cost in real time as opportunities are toggled or edited. Reflected in the header and sidebar.',
            targetSelector: '.detail-header-cost'
          },
          {
            id: 'det-script',
            fr: 'FR26',
            title: 'Script Viewer',
            description: 'Specialist can view the original script text with highlighted passages relevant to the selected scene.',
            targetSelector: '[data-scope-id="script-viewer"]'
          }
        ]
      },
      {
        id: 'det-actions',
        title: 'Actions',
        items: [
          {
            id: 'det-finalize',
            fr: 'FR27',
            title: 'Finalize Quote',
            description: 'Specialist can finalize a quote and proceed to confirmation with the current approval/decline state for all items.',
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
            fr: 'FR28',
            title: 'Summary Card',
            description: 'Specialist can view a summary card with project title, platform, date, total estimated cost, item counts by category, and services.',
            targetSelector: '.confirm-summary'
          },
          {
            id: 'conf-totals',
            fr: 'FR29',
            title: 'Approved / Declined Totals',
            description: 'Specialist can view approved and declined totals with a breakdown showing color-coded values and grand total.',
            targetSelector: '.confirm-breakdown'
          }
        ]
      },
      {
        id: 'conf-tables',
        title: 'Breakdown Tables',
        items: [
          {
            id: 'conf-breakdown-tables',
            fr: 'FR30',
            title: 'Category Breakdown Tables',
            description: 'Specialist can view per-scene, per-character, per-environment, and per-asset breakdown tables with individual opportunities, costs, and approval status badges.',
            targetSelector: '[data-scope-id="scene-breakdown"]'
          }
        ]
      },
      {
        id: 'conf-export',
        title: 'Export & Persistence',
        items: [
          {
            id: 'conf-pdf-export',
            fr: 'FR31',
            title: 'PDF Export',
            description: 'Specialist can export the finalized quote as a formatted PDF document.',
            targetSelector: '[data-scope-id="pdf-export-btn"]'
          },
          {
            id: 'conf-quote-persist',
            fr: 'FR32',
            title: 'Quote Persistence',
            description: 'System can persist every completed quote for historical reference and future pricing suggestions.',
            targetSelector: '[data-scope-id="quote-persist"]'
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
          },
          {
            id: 'conf-oos-client-portal',
            title: 'Client Portal',
            description: 'Client portal for direct quote viewing and response. Phase 2 feature.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  'service-catalog': {
    title: 'Service Catalog — Scope',
    groups: [
      {
        id: 'svc-display',
        title: 'Service Display',
        items: [
          {
            id: 'svc-view-catalog',
            fr: 'FR33',
            title: 'View Service Catalog',
            description: 'Specialist can view the studio\'s VFX service catalog with all services and pricing.',
            targetSelector: '[data-scope-id="svc-catalog-list"]'
          },
          {
            id: 'svc-add',
            fr: 'FR34',
            title: 'Add Service',
            description: 'Specialist can add new services to the catalog with name, description, and base pricing.',
            targetSelector: '[data-scope-id="svc-add-btn"]'
          },
          {
            id: 'svc-edit',
            fr: 'FR35',
            title: 'Edit Service',
            description: 'Specialist can edit existing services including name, description, and pricing.',
            targetSelector: '[data-scope-id="svc-edit-btn"]'
          },
          {
            id: 'svc-remove',
            fr: 'FR36',
            title: 'Remove Service',
            description: 'Specialist can remove services from the catalog.',
            targetSelector: '[data-scope-id="svc-remove-btn"]'
          }
        ]
      },
      {
        id: 'svc-access',
        title: 'Access & Organization',
        items: [
          {
            id: 'svc-manager-access',
            fr: 'FR37',
            title: 'Manager Catalog Access',
            description: 'Manager can view, add, edit, and remove services with the same permissions as the specialist.',
            targetSelector: null
          },
          {
            id: 'svc-group-management',
            fr: 'FR38',
            title: 'Service Group Management',
            description: 'Specialist can create, edit, and remove service groups for categorizing services (e.g., Animation, Compositing, FX).',
            targetSelector: '[data-scope-id="svc-groups"]'
          },
          {
            id: 'svc-assign-group',
            fr: 'FR39',
            title: 'Assign Service to Group',
            description: 'Specialist can assign or reassign a service to a service group for categorization.',
            targetSelector: '[data-scope-id="svc-assign-group"]'
          }
        ]
      },
      {
        id: 'svc-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'svc-oos-versioning',
            title: 'Service Pricing Version History',
            description: 'Tracking historical changes to service pricing over time.'
          },
          {
            id: 'svc-oos-import',
            title: 'Bulk Import/Export of Services',
            description: 'Importing or exporting the service catalog as CSV or other formats.'
          }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  auth: {
    title: 'Authentication — Scope',
    groups: [
      {
        id: 'auth-login',
        title: 'Authentication',
        items: [
          {
            id: 'auth-login-form',
            fr: 'FR40',
            title: 'User Authentication',
            description: 'Users can authenticate with role-based access (specialist or manager).',
            targetSelector: '[data-scope-id="auth-login-form"]'
          },
          {
            id: 'auth-restricted',
            fr: 'FR41',
            title: 'Restricted Access',
            description: 'System can restrict access to authenticated users only. Unauthenticated users are redirected to login.',
            targetSelector: null
          },
          {
            id: 'auth-role-access',
            fr: 'FR42',
            title: 'Role-Based Permissions',
            description: 'System can enforce role-based permissions across the application at both UI and API levels.',
            targetSelector: null
          }
        ]
      },
      {
        id: 'auth-out-of-scope',
        title: 'Out of Scope',
        isOutOfScope: true,
        items: [
          {
            id: 'auth-oos-sso',
            title: 'SSO / OAuth Integration',
            description: 'Single sign-on via Google, Microsoft, or other identity providers.'
          },
          {
            id: 'auth-oos-mfa',
            title: 'Multi-Factor Authentication',
            description: 'Two-factor or multi-factor authentication beyond username/password.'
          },
          {
            id: 'auth-oos-self-register',
            title: 'Self-Registration',
            description: 'Users creating their own accounts. MVP users are provisioned by an admin.'
          },
          {
            id: 'auth-oos-multi-tenant',
            title: 'Multi-Studio / Multi-Tenant',
            description: 'Multi-studio SaaS with isolated data per tenant. Phase 3 feature.'
          }
        ]
      }
    ]
  },

  /* Manager Dashboard — ABSORBED into catalog (Proposals) page.
     FR43-FR45 now live under catalog > cat-dashboard group. */
};
