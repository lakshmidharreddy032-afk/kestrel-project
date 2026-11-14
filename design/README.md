# Kestrel Finance — Design Reference & Exports

This folder contains design artifacts, design tokens, and vector exports for the Kestrel Finance Credit Document Workflow (First Slice: S1, S3, S4).

---

## 🎨 Source Document
- **Source of Truth**: `kestrel-discover-shape-document.html` (Discover and Shape Pack)
- **Design Tokens**: Defined in [`tokens.json`](./tokens.json)

---

## 🗺 Screen to Export Map

| Screen # | Screen Name | Design Export | Source Section & Solution ID |
|---|---|---|---|
| `01` | Applications List | [`exports/01-applications-list.svg`](./exports/01-applications-list.svg) | Section 6: First Slice (< ₹25L Simple Loans) |
| `02` | Day-One Checklist | [`exports/02-day-one-checklist.svg`](./exports/02-day-one-checklist.svg) | Solution S1: Day-one document checklist & single request |
| `03` | Gap Check Results | [`exports/03-gap-check-results.svg`](./exports/03-gap-check-results.svg) | Solution S3: Missing & duplicate document check |
| `04` | Extraction Split View | [`exports/04-extraction-split-view.svg`](./exports/04-extraction-split-view.svg) | Solution S4: Extraction with source pages (pilot) |
| `05` | Analyst Verification Gate | [`exports/05-analyst-check.svg`](./exports/05-analyst-check.svg) | Section 7: Step 3 & 4 (Human checks every figure) |
| `06` | Spreading Sheet & Scorecard | [`exports/06-spreading-sheet.svg`](./exports/06-spreading-sheet.svg) | Section 7: Step 4 & 5 (Pre-filled sheet & legacy scorecard) |
| `07` | Credit Officer Sign-Off | [`exports/07-credit-signoff.svg`](./exports/07-credit-signoff.svg) | Section 7: Step 6 (Human signs every credit decision) |
| `08` | Immutable Audit Log | [`exports/08-audit-log.svg`](./exports/08-audit-log.svg) | Section 7: Step 7 (Audit log for compliance) |
| `09` | Metrics Dashboard & NPA Guardrail | [`exports/09-metrics-dashboard.svg`](./exports/09-metrics-dashboard.svg) | Section 6: Success measures & Gross NPA 3.1% vs 3.5% |
