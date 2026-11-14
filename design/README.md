# 🎨 Kestrel Finance — Design Reference, UI Tokens & Prototype Exports

This directory holds the complete design system specification, design tokens, high-fidelity vector SVG exports, and a self-contained interactive prototype for the **Kestrel Finance SME Credit Document Appraisal Workflow**.

---

## 🚀 Standalone Interactive Prototype

For executive reviews, design audits, and stakeholder walkthroughs without compiling or running Node.js:
👉 **[`design/interactive-prototype.html`](./interactive-prototype.html)**

- **Zero Dependencies**: Pure HTML5, CSS3, and Vanilla JavaScript. Runs directly in any web browser.
- **Full 9-Screen Workflow**: Navigate between Intake Queue, Day-1 Checklist, Gap Diagnostics, OCR Split-View, Spreading Sheet, Credit Sanction, Audit Log, and Metrics Dashboard.
- **Interactive Role Switcher**: Toggle between Relationship Manager (Vikram), Credit Analyst (Meena), and Credit Officer (Arjun).
- **Interactive Split-View**: Click bounding box coordinates mapped to scanned HDFC bank statements and GSTR-3B filings.
- **Dark Mode Support**: Real-time CSS custom property theme switcher.

---

## 🗺 Screen to Vector SVG Export Map

Every screen in the workflow is exported as a standalone, high-resolution vector SVG (1200 × 800) in [`design/exports/`](./exports/):

| Screen # | Screen Title | Vector SVG Export | Architectural Milestone & Solution ID | Key Interactive Elements |
|:---:|---|---|---|---|
| **01** | **Applications Pipeline** | [`exports/01-applications-list.svg`](./exports/01-applications-list.svg) | Section 6: First Slice (&lt; ₹25L Simple Loans) | 4 KPI summary cards, ticket size ceiling filter, search input, data grid with out-of-scope badges |
| **02** | **Day-One Checklist** | [`exports/02-day-one-checklist.svg`](./exports/02-day-one-checklist.svg) | Solution **S1** (ICE 336): Day-one checklist &amp; single request | Entity-specific checklist, upload simulator, WhatsApp Business encrypted chat preview |
| **03** | **Gap Diagnostics** | [`exports/03-gap-check-results.svg`](./exports/03-gap-check-results.svg) | Solution **S3** (ICE 216): Missing &amp; duplicate document check | GST vs Banking turnover reconciliation card (+4.32%), 6-month period continuity calendar, diagnostic rule cards |
| **04** | **Extraction Split-View** | [`exports/04-extraction-split-view.svg`](./exports/04-extraction-split-view.svg) | Solution **S4** (ICE 288): Extraction with source pages (pilot) | Left HDFC statement with interactive colored bounding boxes; Right table with confidence scores and status pills |
| **05** | **Analyst Verification Gate** | [`exports/05-analyst-check.svg`](./exports/05-analyst-check.svg) | Section 7: Step 3 &amp; 4 (Human checks every figure) | Verification progress bar (14/14, 100%), Spreading sheet sync lock state, Accept/Edit actions, Override diff modal |
| **06** | **Spreading Sheet &amp; 5-C** | [`exports/06-spreading-sheet.svg`](./exports/06-spreading-sheet.svg) | Section 7: Step 4 &amp; 5 (Pre-filled sheet &amp; legacy scorecard) | Revenue shock sensitivity stress-test slider, calculated ratios (DSCR 1.82x, ICR 3.4x), 5-C Risk Scorecard (68/100, Tier B) |
| **07** | **Credit Officer Sign-Off** | [`exports/07-credit-signoff.svg`](./exports/07-credit-signoff.svg) | Section 7: Step 6 (Human signs every credit decision) | Executive Credit Appraisal Memo (CAM), character counter (&ge; 10 chars), Sanction/Refer/Reject actions, Formal Sanction Letter |
| **08** | **Compliance Audit Log** | [`exports/08-audit-log.svg`](./exports/08-audit-log.svg) | Section 7: Step 7 (Audit log for compliance) | Chronological tamper-evident audit trail with IST timestamps, actor IDs, mutation details, RFC-4180 CSV &amp; JSON export |
| **09** | **Executive Dashboard** | [`exports/09-metrics-dashboard.svg`](./exports/09-metrics-dashboard.svg) | Section 6: Success measures &amp; Gross NPA 3.1% guardrail | 4 core KPI comparison cards, TAT stage-by-stage elimination table, branch selector, Gross NPA risk appetite gauge |

---

## 🎨 Design Tokens & Visual Hierarchy

Defined in [`tokens.json`](./tokens.json) and mirrored in `src/styles/tokens.css`:

### 1. Primary Brand Palette
- **Primary Navy / Brand Blue**: `#1e56a0` (Hover: `#163e75`, Background: `#eaf1fb`, Border: `#bcd5f6`)
- **Dark Gradient Brand Header**: `linear-gradient(135deg, #173d74 0%, #1e56a0 100%)`

### 2. Status & Governance Accents
- **Sanction Approved / Passed**: `#0e6245` (Background: `#e6f7ef`, Border: `#a3e6cb`)
- **Warning / Checklist Deficiencies**: `#8a5700` (Background: `#fef7e6`, Border: `#fde09e`)
- **Hard Block / Out-of-Scope (≥ ₹25L) / Rejections**: `#a52336` (Background: `#fdf0f2`, Border: `#f8b4be`)
- **Analyst Overrides / Human Edits**: `#5534b8` (Background: `#f3effe`, Border: `#d4c5fb`)

### 3. Typography Scale
- **Headings & Brand**: `Inter`, system-ui, -apple-system, sans-serif
- **Financial Figures, PAN, GSTIN & Timestamps**: `JetBrains Mono`, Consolas, monospace (`font-variant-numeric: tabular-nums`)
- **Body Hierarchy**:
  - Display Title: `20px` (Weight 800)
  - Section Header: `16px` (Weight 700)
  - Card Titles: `14px` (Weight 700)
  - Body Text: `13px` / `13.5px` (Line height 1.5)
  - Captions & Badges: `10.5px` / `11px` (Weight 700)

### 4. Elevation & Surface Depth
- `shadow-xs`: `0 1px 2px rgba(0,0,0,0.04)`
- `shadow-sm`: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`
- `shadow-md`: `0 4px 14px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.04)`
- `shadow-lg`: `0 12px 28px -4px rgba(0,0,0,0.09), 0 4px 10px -2px rgba(0,0,0,0.04)`
- `shadow-emerald`: `0 0 0 3px rgba(16, 185, 129, 0.25)`

---

*Kestrel Finance Design System • Production Blueprint • Discover & Shape Pack Specification*
