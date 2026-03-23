---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-03-23
author: Ivan
---

# Product Brief: bmad

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

Boxel Quoting Agent is an AI-powered web application that transforms how VFX studios estimate project costs. By ingesting screenplays, automatically detecting VFX opportunities, and generating draft quotes informed by historical pricing data, the tool reduces the bidding process from one week to a fraction of that time. The bidding specialist remains in full control — the AI provides an intelligent starting point that gets smarter with every quote stored in the system.

---

## Core Vision

### Problem Statement

VFX studios face a critical bottleneck in their bidding process: estimating costs from a screenplay is a manual, time-intensive task that depends on 1-2 bidding specialists. This process typically takes a full week, during which production decisions stall and potential revenue is at risk. The specialists must read the screenplay, identify VFX opportunities (scenes, characters, environments, assets), map them to available services, and price them — all while drawing on institutional knowledge that lives primarily in their heads and scattered spreadsheets.

### Problem Impact

- **Revenue at risk:** Every week spent on a quote is potential money lost — studios can't pursue enough opportunities simultaneously
- **Bottleneck dependency:** When bidding specialists are unavailable, the entire quoting pipeline stops
- **Knowledge fragility:** Historical pricing intelligence is trapped in people's memory and old spreadsheets, not systematically leveraged
- **Competitive disadvantage:** Studios that can't turn around estimates quickly lose bids to faster competitors

### Why Existing Solutions Fall Short

The VFX bidding industry operates largely on spreadsheets and personal expertise. There are no known specialized tools addressing this workflow. Current approaches fail because:
- They don't automate screenplay analysis for VFX opportunity detection
- Historical pricing data isn't systematically captured or reused
- Each quote starts nearly from scratch, even for similar projects (e.g., Season 2 of a show that was already quoted for Season 1)
- The process is entirely manual with no AI augmentation

### Proposed Solution

A web application that serves as an intelligent assistant for VFX bidding specialists, following a four-step workflow:
1. **Screenplay Ingestion** — Upload a screenplay PDF for automated analysis
2. **AI-Powered VFX Detection** — Identify scenes, characters, environments, and assets that represent VFX opportunities
3. **Service Catalog Mapping** — Map detected opportunities to the studio's proprietary service catalog
4. **Historical-Informed Quote Generation** — Generate a draft quote leveraging pricing data from past bids

The specialist always retains full control: they can add, remove, or modify any element — services, scenes, characters, environments, assets, and pricing. The AI delivers an excellent blueprint to start from, not a final answer.

### Key Differentiators

- **Institutional Memory as a Feature:** The system captures and leverages historical pricing data that currently lives only in specialists' heads, becoming more accurate with every stored quote
- **AI + Human Partnership:** Unlike full automation approaches, this tool augments the specialist rather than replacing them — respecting the expertise-driven nature of VFX bidding
- **Proprietary Data Moat:** Each studio's historical quotes and service catalog create a unique, hard-to-replicate dataset that makes the tool increasingly valuable over time
- **Industry Timing:** AI capabilities have matured enough to reliably analyze screenplays and detect VFX opportunities, making this solution viable now in a way it wasn't before

## Target Users

### Primary Users

**Carlos — VFX Bidding Specialist**

- **Role & Background:** Senior specialist with VFX technical background. Responsible for analyzing screenplays, identifying VFX opportunities, and building cost estimates. Has years of experience that allow them to spot VFX needs — characters, environments, assets, scenes — with a trained eye.
- **Current Pain:** Spends up to a week per quote, manually reading screenplays, cross-referencing past projects from memory, and building estimates in spreadsheets. When multiple projects need quoting simultaneously, becomes the bottleneck.
- **Motivation:** Wants to focus their expertise on refining and validating estimates, not on the tedious initial breakdown. Values accuracy and speed equally.
- **Success Vision:** Upload a screenplay, get an intelligent first draft in minutes instead of days, adjust what needs adjusting, and deliver a polished quote — all in a fraction of the current time.
- **MVP Core Flow:** Upload screenplay → Review AI-generated VFX breakdown → Add/remove/modify services, scenes, characters, environments, assets, and pricing → Generate final quote for review.

### Secondary Users

**Diana — Studio Manager / Production Executive**

- **Role & Background:** Oversees the quoting pipeline and has final approval on quotes before they go to clients. Not involved in the day-to-day breakdown work but needs visibility into what's being quoted and at what price points.
- **Current Pain:** Limited visibility into quoting activity. Relies on the specialist to provide updates, making it hard to track pipeline or spot issues before quotes go out.
- **Motivation:** Wants confidence that quotes are accurate and competitive before they reach clients.
- **MVP Core Flow:** View dashboard of active quotes → Review/edit a completed quote → Approve for client delivery.

### User Journey

1. **Discovery:** Internal tool — specialists and managers are onboarded directly by the studio
2. **Onboarding:** Specialist uploads their first screenplay and sees the AI breakdown, immediately understanding the value
3. **Core Usage:** Specialist uses the tool for every new quoting request; manager reviews and approves quotes from the dashboard
4. **Success Moment ("Aha!"):** The first time a specialist gets back a VFX breakdown that closely matches what they would have done manually — in minutes instead of days
5. **Long-term Value:** As more quotes are stored, the AI's pricing suggestions become increasingly accurate, making the tool indispensable

## Success Metrics

### User Success
- **Specialist Adoption:** The bidding specialist finds the tool useful and chooses to keep using it for new quotes (qualitative validation)
- **AI Accuracy Delta:** Track the number of items (services, scenes, characters, environments, assets, prices) the specialist adds, removes, or modifies from the AI-generated draft. Fewer changes over time = higher AI accuracy
- **Quote Consistency:** Similar projects produce similar estimates — the system prevents unexplained pricing drift between comparable projects (e.g., Season 1 vs Season 2)

### Business Objectives
- **MVP Validation:** The specialist actively uses the tool for real quoting work and provides positive feedback on its utility
- **Knowledge Capture:** Historical quotes are being stored in the system, building the institutional pricing memory that currently lives only in people's heads
- **Accuracy Improvement Over Time:** The AI accuracy delta trends downward as more quotes are stored, demonstrating the system's learning effect

### Key Performance Indicators
| KPI | Measurement | Target |
|-----|------------|--------|
| AI Accuracy Delta | Avg. number of modifications per quote | Decreasing trend over time |
| Quote Completion | Quotes successfully generated through the tool | 100% of new quotes use the tool |
| Knowledge Base Growth | Number of historical quotes stored in system | Growing consistently |
| Specialist Satisfaction | Qualitative feedback from primary user | "Useful, want to keep using it" |

## MVP Scope

### Core Features

**Already Prototyped (approved by client):**
1. **Screenplay Upload** — PDF, FDX, TXT, Fountain file upload via drag & drop or file browser, plus Google Drive folder URL import
2. **AI-Powered VFX Detection** — Automated analysis of screenplay to identify VFX opportunities: scenes, characters, environments, assets
3. **Quote Editor** — Full control for the specialist to add, remove, and modify detected items (services, scenes, characters, environments, assets) and adjust pricing
4. **Quote Generation** — Produce the final quote with all line items and pricing

**Still Needed for MVP:**
5. **Historical Pricing Engine** — Store all completed quotes and use that context when analyzing new screenplays to inform AI-generated pricing suggestions
6. **Service Catalog Management** — Studio's proprietary catalog of VFX services mapped to detected opportunities
7. **Manager Dashboard** — Simple list view of all quotes with status (draft, pending review, approved), ability to open, edit, and approve quotes
8. **Authentication** — User accounts with role-based access (specialist vs. manager)
9. **Quote Export** — PDF export and web-based view/print of final quotes

### Out of Scope for MVP
- Advanced analytics or reporting on quoting trends
- Multi-studio / multi-tenant support
- Integration with external project management tools
- Automated client delivery / email sending
- Advanced AI features like shot-level complexity scoring
- Storyboard or visual reference analysis
- Mobile-optimized interface

### MVP Success Criteria
- Specialist completes at least 3 real quotes using the tool and provides positive feedback
- AI-generated breakdowns require decreasing modifications over successive quotes
- Historical pricing is successfully referenced when quoting similar projects
- Manager can review and approve quotes through the dashboard without needing workarounds
- All quotes are stored and building the institutional knowledge base

### Future Vision
- **Smarter AI:** As the quote database grows, the system predicts pricing with increasing accuracy, eventually suggesting complete quotes that need minimal adjustment
- **Analytics Dashboard:** Win/loss tracking, quoting trends, pricing benchmarks across projects
- **Client Portal:** Clients can view and respond to quotes directly in the platform
- **Multi-Studio:** SaaS model where multiple studios run their own instance with isolated data
- **Expanded Input:** Support for storyboards, shot lists, director's notes as additional context for AI analysis
- **API Integrations:** Connect with production management tools (ShotGrid, ftrack) and accounting systems
