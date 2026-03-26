---
stepsCompleted: [1, 2, 2b, 2c, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-bmad-2026-03-23.md
  - js/scope-data.js
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 1
classification:
  projectType: web_app
  domain: entertainment_vfx_production
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - Boxel Quoting Agent

**Author:** Ivan
**Date:** 2026-03-24

## Executive Summary

Boxel Quoting Agent automates VFX bidding: ingests screenplays, detects VFX opportunities via AI, and generates draft quotes using historical pricing. Reduces the specialist's work from building a quote from scratch (1 week) to reviewing and refining an AI-generated draft (hours).

### What Makes This Special

- **Detection quality:** The AI produces breakdowns that make sense to the specialist — 80%+ of the work done right, not noise to curate.
- **Institutional memory:** Every completed quote builds a proprietary pricing knowledge base, replacing what currently lives in people's heads.
- **Timing:** Current AI models are reliable enough for screenplay comprehension. The tool is viable today and improves as models improve.

## Project Classification

- **Type:** Web App (MPA)
- **Domain:** Entertainment / VFX Production — Bidding & Quoting
- **Complexity:** Medium
- **Context:** Brownfield — 5-screen prototype approved by client (Upload, Processing, Proposals, Detail, Confirmation)

## Success Criteria

### User Success

- The specialist finds the AI-generated breakdown useful enough to start from it rather than building from scratch
- The specialist modifies fewer than 30% of AI-detected items per quote (70% accuracy target)
- The "aha" moment: the breakdown makes sense on first review — scenes, characters, environments, assets feel right

### Business Success

- 100% of new quotes go through the system — it becomes the default workflow, not an optional tool
- Historical quotes accumulate in the system, building the institutional knowledge base
- Quote turnaround time drops from ~1 week to hours

### Technical Success

- **Detection accuracy is the #1 priority.** The quality of VFX opportunity detection (scenes, characters, environments, assets) determines whether the tool is useful or not
- Response time is not a concern — accuracy over speed
- The system must reliably parse screenplay formats (PDF, FDX, TXT, Fountain)

### Measurable Outcomes

| Metric | Target |
|--------|--------|
| AI detection accuracy | ≥70% of items kept as-is by specialist |
| Quote adoption | 100% of new quotes use the system |
| Knowledge base growth | Every completed quote stored |
| Specialist verdict | "I wouldn't go back to doing it manually" |

## Product Scope & Phased Development

### MVP Strategy

**MVP Approach:** Problem-solving MVP — prove AI can reliably detect VFX opportunities from screenplays at ≥70% accuracy, and that the specialist finds the tool useful enough to make it their default workflow.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Carlos — New Screenplay Quote (full 5-screen flow)
- Carlos — Service Catalog management
- Diana — Executive view of quotes (read-only dashboard)

**Already prototyped (5 screens):**
1. **Upload** — Screenplay ingestion (drag & drop, Google Drive)
2. **Processing** — AI analysis pipeline with real-time feedback
3. **Proposals** — Grid view of generated proposals with filtering/sorting
4. **Detail** — Item preview, opportunity selection, real-time cost calculation
5. **Confirmation** — Summary with approved/declined breakdown

**Must-Have Capabilities (still needed):**
1. Historical Pricing Engine — starts empty, AI references past quotes as they accumulate
2. Service Catalog Management — studio's proprietary VFX service catalog (CRUD, both roles)
3. Manager Dashboard — executive summary of all quotes, read-only
4. Authentication — role-based access (specialist vs. manager)
5. PDF export of final quote
6. Quote storage — every completed quote persisted for historical context

**Not a blocker:** Manager approval is not required to complete a quote. The flow is specialist-driven end-to-end.

### Phase 2 (Growth)

- Manager edit/approval workflow on quotes
- Analytics dashboard (win/loss tracking, pricing trends)
- Expanded input support (storyboards, shot lists, director's notes)
- Client portal for direct quote viewing/response

### Phase 3 (Expansion)

- Multi-studio SaaS with isolated data per tenant
- API integrations (ShotGrid, ftrack, accounting systems)
- Near-full AI automation — specialist only validates edge cases

## User Journeys

### Journey 1: Carlos — New Screenplay Quote (Happy Path)

Carlos receives a screenplay PDF from a production company requesting a VFX bid. He opens Boxel Quoting Agent and drops the file into the **Upload** screen. The system accepts it and he hits "Process Scripts."

The **Processing** screen kicks in — he watches the AI analyze the screenplay in real time, seeing scenes, characters, environments, and assets appear as they're detected. In minutes, the analysis completes with a summary of everything found.

He moves to the **Proposals** screen and sees the generated proposal card with the project details and estimated cost. He clicks into it.

On the **Detail** screen, Carlos browses through detected scenes, characters, environments, and assets in the sidebar. Each item shows its VFX opportunities with editable costs. He spots a few things to adjust — removes an environment the AI misidentified, tweaks pricing on two scenes, adds a note to an opportunity — but 70%+ of the breakdown is solid. He toggles opportunities on/off, watches the total update in real time, and feels confident in the result.

He hits "Finalize" and lands on the **Confirmation** screen — a clean summary with approved/declined breakdowns by scene, character, environment, and asset. He exports the quote as PDF. Done.

**What this reveals:** The core 5-screen pipeline must be seamless end-to-end. Detection quality is make-or-break. Real-time cost calculation and easy editing are essential.

### Journey 2: Carlos — Returning to a Similar Project

A production company sends Carlos a screenplay for Season 2 of a show he quoted last year. He uploads and processes it. This time, the AI references the historical data from the Season 1 quote — pricing suggestions are closer to what he'd expect, characters and environments carry over contextually.

Carlos reviews the breakdown and finds he needs to adjust even less than usual. The institutional memory is working.

**What this reveals:** Historical pricing engine is critical for repeat/similar projects. The system must connect new screenplays to relevant past quotes.

### Journey 3: Diana — Executive Quote Overview

Diana opens the **Manager Dashboard** and sees a list of all quotes with status and summary data. She opens a completed quote and sees the full confirmation summary — project details, total cost, breakdown by category.

She reviews the numbers and compares against her understanding of the project scope. The dashboard gives her visibility into quoting activity without slowing down the specialist's workflow.

**What this reveals:** Manager Dashboard needs clear status tracking and read-only access to quote details. It's an informational/executive view, not an approval gate.

### Journey 4: Carlos — Managing the Service Catalog

Before processing a new screenplay, Carlos realizes the studio has added a new VFX service (volumetric capture). He opens the **Service Catalog**, creates a new service group if needed, and adds the new service with its base pricing. Next time the AI analyzes a screenplay, it can map opportunities to this new service.

Diana also accesses the catalog occasionally to update pricing tiers based on business decisions.

**What this reveals:** Service catalog must be editable by both roles. Changes should be reflected in future AI analysis. Simple CRUD for services and service groups with pricing.

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|--------------------------|
| Carlos — New Quote | Upload, AI processing, proposal display, detail editing, cost calculation, confirmation, PDF export |
| Carlos — Similar Project | Historical pricing engine, quote storage, contextual AI suggestions |
| Diana — Executive Overview | Manager dashboard, status tracking, read-only quote details |
| Carlos/Diana — Service Catalog | Service CRUD, service group management, pricing, AI integration with catalog |

## Domain-Specific Requirements

### Data Confidentiality

- **Screenplays are NDA-protected material.** Access restricted to authenticated users within the studio.
- **Historical pricing is competitive intelligence.** Quote data, service pricing, and cost breakdowns protected with the same level of confidentiality.
- Role-based access ensures only authorized users (specialist, manager) can view/edit quotes and pricing data.

### AI Processing & Third-Party Privacy

- MVP uses external LLM APIs for screenplay analysis.
- **Requirement:** Enterprise-tier API license — no data retention, no training on submitted data, contractual privacy protections.
- Screenplay content sent to the API scoped to the minimum necessary per analysis phase.

### Data Handling

- Uploaded screenplays stored securely with encryption at rest.
- Quote data and pricing history encrypted at rest and in transit.
- Single-tenant for MVP, isolation by design for future multi-tenant.
- Studios control their own data lifecycle.

## Innovation & Novel Patterns

### Detected Innovation Areas

- **First-of-its-kind application:** No known tool automates VFX bidding from screenplay analysis. The entire industry operates on manual expertise and spreadsheets.
- **LLM applied to a domain-specific professional workflow:** A structured pipeline that reads screenplays and outputs actionable VFX breakdowns (scenes, characters, environments, assets with service mapping and pricing).
- **Institutional memory as competitive moat:** Each studio's historical quotes create a proprietary dataset that makes the tool increasingly valuable and hard to replicate.

### Market Context & Competitive Landscape

- No identified direct competitors offering AI-powered VFX bidding.
- First-mover advantage, but unproven demand beyond the initial client.
- Closest alternatives: general-purpose spreadsheets and the specialist's own memory.

### Validation Approach

- **Modification delta tracking:** Measure items the specialist adds, removes, or modifies per quote.
  - Scenes, characters, environments, assets added/removed
  - Services added/removed within each item
- **Target:** ≤30% modification rate (70% accuracy) from launch
- **Trend tracking:** Modification rate should decrease as historical data accumulates

## Web App Specific Requirements

### Project-Type Overview

Internal web application behind authentication. Multi-page architecture (MPA) with vanilla HTML/CSS/JS — no framework overhead. Desktop-only for MVP. No SEO, no accessibility beyond standard HTML semantics.

### Technical Architecture Considerations

- **Architecture:** MPA — separate HTML pages per screen, shared CSS/JS. No SPA framework needed.
- **Browser support:** Modern desktop browsers (Chrome, Firefox, Safari, Edge). No mobile/tablet optimization for MVP.
- **Real-time:** Only the Processing screen requires updates. Sequential per phase — call scene detection, display results when complete, then call character detection, etc. No WebSocket needed.
- **No concurrent editing:** Single specialist works on a quote at a time.

### Implementation Considerations

- **Priority:** Speed of development. Simplest tech that works.
- **Frontend:** Vanilla HTML/CSS/JS (proven by prototype). No build step, no bundler, no framework.
- **Backend:** Needs to be defined — API for AI processing, data storage, authentication.
- **State:** localStorage for prototype; production needs server-side persistence (database).
- **AI integration:** Sequential API calls to external LLM per analysis phase. Each phase completes before the next begins.

## Functional Requirements

### Screenplay Ingestion (Upload)

- FR1: Specialist can upload screenplay files via drag & drop or file browser
- FR2: Specialist can import screenplays from a Google Drive folder URL
- FR3: System can accept PDF, FDX, TXT, and Fountain screenplay formats
- FR4: Specialist can view a list of uploaded files before processing
- FR5: Specialist can remove individual files or clear all files from the upload list
- FR6: Specialist can trigger AI analysis of all uploaded screenplays

### AI Analysis Pipeline (Processing)

- FR7: System can analyze a screenplay and detect VFX scenes
- FR8: System can analyze a screenplay and detect VFX characters
- FR9: System can analyze a screenplay and detect VFX environments
- FR10: System can analyze a screenplay and detect VFX assets
- FR11: System can map detected items to services from the studio's service catalog
- FR12: System can display analysis progress per phase (scene detection, character detection, etc.)
- FR13: System can display discovered items in real time as each phase completes
- FR14: System can display a summary of all detected items after analysis completes
- FR15: System can reference historical quotes to inform pricing suggestions for detected items

### Proposal Management (Proposals / Catalog)

- FR16: Specialist can view all generated proposals in a grid layout
- FR17: Specialist can filter proposals by service group (e.g., Animation, VFX)
- FR18: Specialist can sort proposals by date, quote amount, or studio name
- FR19: Specialist can view aggregate stats (total proposals, portfolio value)
- FR20: Specialist can select a proposal to view its full detail

### Quote Editing (Detail)

- FR21: Specialist can browse detected items by category (scenes, characters, environments, assets) in a sidebar
- FR22: Specialist can view item detail with image/video, description, VFX notes, and script excerpt
- FR23: Specialist can select or deselect individual VFX opportunities per item
- FR24: Specialist can edit the cost and add notes to individual opportunities
- FR25: System can update the running total cost in real time as opportunities are toggled or edited
- FR26: Specialist can view the original script text with relevant passages highlighted
- FR27: Specialist can finalize a quote and proceed to confirmation

### Quote Confirmation & Export (Confirmation)

- FR28: Specialist can view a summary card with project details and total estimated cost
- FR29: Specialist can view approved/declined totals with breakdown
- FR30: Specialist can view per-scene, per-character, per-environment, and per-asset breakdown tables
- FR31: Specialist can export the final quote as PDF
- FR32: System can persist every completed quote for historical reference

### Service Catalog Management

- FR33: Specialist can view the studio's VFX service catalog
- FR34: Specialist can add new services to the catalog with base pricing
- FR35: Specialist can edit existing services and pricing
- FR36: Specialist can remove services from the catalog
- FR37: Manager can view, add, edit, and remove services (same permissions as specialist)
- FR38: Specialist can create, edit, and remove service groups for categorization
- FR39: Specialist can assign services to a service group

### User & Access Management

- FR40: Users can authenticate with role-based access (specialist or manager)
- FR41: System can restrict access to authenticated users only
- FR42: System can enforce role-based permissions across the application

### Manager Dashboard

- FR43: Manager can view a list of all quotes with status summary
- FR44: Manager can view executive-level summary of quoting activity
- FR45: Manager can open any quote to view its confirmation details (read-only)

## Non-Functional Requirements

### Security

- All screenplay data and quote data encrypted at rest and in transit (TLS)
- Authentication required for all application access
- Role-based access enforced at API level, not just UI
- Session management with automatic timeout
- No screenplay or pricing data exposed in client-side storage or logs

### Integration

- External LLM API calls must use enterprise-tier endpoints with contractual privacy guarantees
- API calls must handle timeouts and failures gracefully — if a detection phase fails, the specialist is informed and can retry
- Screenplay content sent to LLM should be scoped to the minimum needed per analysis phase

## Risk Summary

| Category | Risk | Mitigation |
|----------|------|-----------|
| Technical | AI detection below 70% target | Specialist retains full editing control; tool is useful even at lower accuracy |
| Technical | Screenplay parsing fails on edge cases | Support multiple formats; manual fallback for problematic files |
| Security | Screenplay leak via external API | Enterprise API license with contractual privacy guarantees |
| Security | Unauthorized access to pricing data | Role-based authentication, encrypted storage |
| Market | Unproven demand beyond initial client | Single-studio MVP validates before investing in multi-tenant |
| Resource | MPA + vanilla JS limits future scale | Acceptable for MVP; can migrate to framework post-validation |
