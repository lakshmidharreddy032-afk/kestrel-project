# Kestrel Finance — Credit Document Workflow Prototype (First Slice: S1, S3, S4)

A complete, clickable, and accessible prototype proving how analysts and relationship managers (RMs) at Kestrel Finance can decide simple SME loans faster by removing manual document chasing and retyping.

Based strictly on the source of truth: **`kestrel-discover-shape-document.html`** (Discover and Shape Pack).

---

## 🏛 Project Architecture

```
kestrel-prototype/
├── design/                      # Design source and exports (read-only reference)
│   ├── exports/                 # Vector SVG exports, one per screen (01 to 09)
│   ├── tokens.json              # Colors, type, spacing, radii from source document
│   └── README.md                # Link to design file and screen-to-export map
├── public/
│   └── fonts/                   # Local font files & CDN configuration
├── src/
│   ├── main.tsx                 # App entry
│   ├── App.tsx                  # Router, state and role switcher wrapper
│   ├── styles/
│   │   ├── tokens.css           # CSS variables (light and dark) from source doc
│   │   └── global.css           # Reset, layout, typography, focus outlines
│   ├── data/                    # Mock data only, no real customer data
│   │   ├── applications.json    # 12 SME applications (< ₹25L vs out of scope)
│   │   ├── documents.json       # Bank statements, GST returns, KYC, business proof
│   │   ├── extractions.json     # Pre-written mock extraction output with bounding boxes
│   │   ├── sheet.json           # Spreading sheet ratios & legacy scorecard placeholder
│   │   ├── auditLog.json        # Immutable chronological audit event history
│   │   └── metrics.json         # Section 6 KPIs & Gross NPA 3.1% vs 3.5% guardrail
│   ├── domain/                  # Business rules, no UI code
│   │   ├── rules/
│   │   │   ├── checklist.ts     # S1: required documents per application
│   │   │   ├── gapCheck.ts      # S3: missing, duplicate, period coverage
│   │   │   ├── eligibility.ts   # Under ₹25 lakh, out-of-scope blocking
│   │   │   └── signOff.ts       # Blocks sign-off until all figures are checked
│   │   ├── types.ts             # Shared TypeScript domain types
│   │   └── constants.ts         # Thresholds, targets (18→12 days, NPA 3.5%)
│   ├── services/                # Data access layer (reads JSON, holds state)
│   │   ├── store.ts             # Reactive App state (in memory + localStorage)
│   │   ├── auditLogger.ts       # Writes every action to the audit log
│   │   └── mockExtraction.ts    # Returns mock figures, labelled as mock
│   ├── roles/
│   │   ├── roles.ts             # RM, Analyst, Credit Officer permissions
│   │   └── RoleSwitcher.tsx     # Persona switcher component
│   ├── components/              # Reusable UI, shared across screens
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Header with "Prototype: mock data" label
│   │   │   ├── Sidebar.tsx      # Main navigation with [1-9] shortcuts
│   │   │   └── MockBanner.tsx   # "Mock extraction. Not a live model." banner
│   │   ├── ui/                  # Reusable buttons, cards, chips, tables, inputs
│   │   └── documents/
│   │       ├── SplitView.tsx    # Source page on left, figures on right
│   │       └── SourceHighlight.tsx # Interactive bounding box highlights
│   ├── screens/                 # One folder per screen, named after the design
│   │   ├── applications/
│   │   │   ├── ApplicationsList.tsx
│   │   │   └── ApplicationsList.test.tsx
│   │   ├── checklist/
│   │   │   ├── DocumentChecklist.tsx
│   │   │   └── RequestPreview.tsx
│   │   ├── gapCheck/
│   │   │   └── GapCheckResults.tsx
│   │   ├── extraction/
│   │   │   └── ExtractionReview.tsx
│   │   ├── sheet/
│   │   │   ├── SpreadingSheet.tsx
│   │   │   └── ScorecardPanel.tsx   # Read-only placeholder
│   │   ├── signOff/
│   │   │   └── CreditSignOff.tsx
│   │   ├── auditLog/
│   │   │   └── AuditLogTable.tsx
│   │   └── dashboard/
│   │       └── MetricsDashboard.tsx
│   └── test/
│       └── setup.ts             # Vitest test setup
├── tests/
│   └── e2e/                     # Playwright walkthrough of one full case
├── README.md                    # Run steps, assumptions, screen-to-section map
├── package.json                 # Project dependencies & scripts
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🚀 How to Run

### 1. Development Mode (Vite)
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Run Tests
```bash
npm test
# or: npm run test:rules
```

---

## 🗺 Screen Mapping Table

| # | Screen Name | Component Location | Source Section & Solution ID |
|---|---|---|---|
| **1** | **Applications List** | `src/screens/applications/ApplicationsList.tsx` | Section 6: First Slice (< ₹25L Simple Loans) |
| **2** | **Day-One Checklist** | `src/screens/checklist/DocumentChecklist.tsx` | Solution **S1** (ICE 336): Day-one checklist & one request |
| **3** | **Missing & Duplicate Check** | `src/screens/gapCheck/GapCheckResults.tsx` | Solution **S3** (ICE 216): Missing and duplicate document check |
| **4** | **Extraction Split View** | `src/screens/extraction/ExtractionReview.tsx` | Solution **S4** (ICE 288): Extraction with source pages (pilot) |
| **5** | **Analyst Check Gate** | `src/screens/extraction/ExtractionReview.tsx` | Section 7: Step 3 & 4 (Human checks every figure) |
| **6** | **Spreading Sheet & Scorecard** | `src/screens/sheet/SpreadingSheet.tsx` | Section 7: Step 4 & 5 (Spreading sheet & legacy scorecard) |
| **7** | **Credit Officer Sign-off** | `src/screens/signOff/CreditSignOff.tsx` | Section 7: Step 6 (Human signs every credit decision) |
| **8** | **Immutable Audit Log** | `src/screens/auditLog/AuditLogTable.tsx` | Section 7: Step 7 (Audit log for compliance) |
| **9** | **Metrics & NPA Guardrails** | `src/screens/dashboard/MetricsDashboard.tsx` | Section 6: Success measures & Gross NPA 3.1% vs 3.5% |

---

## 🔒 Hard Rules & Governance Controls

1. **The Model Only Reads Documents**: OCR/extraction extracts data with source bounding boxes; it never scores or decides loans.
2. **A Person Must Check Every Figure**: Spreading sync is hard-blocked until an analyst verifies 100% of figures.
3. **A Person Must Sign Every Decision**: System auto-approval is strictly forbidden. Only a named Credit Officer (Arjun Iyer) can sign off with mandatory rationale ($\ge 10$ chars).
4. **Loans $\ge$ ₹25 Lakh Blocked**: Larger corporate loans are flagged out of scope.
5. **No Real Customer Data**: 100% fictional SME names, account numbers, and figures.

---

## 📋 Mock Data Seed List
- `APP-1001`: Malabar Spices & Agro LLP (₹18,00,000) — Eligible
- `APP-1002`: Apex Precision Engineering Pvt Ltd (₹22,00,000) — Eligible (has missing KYC & duplicate statement)
- `APP-1003`: Deccan Logistics Solutions (₹15,00,000) — Eligible
- `APP-1004`: Horizon Infra Developers (₹45,00,000) — Blocked ($\ge$ ₹25L)
- `APP-1005`: GreenValley Organic Foods (₹12,00,000) — Eligible
- `APP-1006`: Royal Textile Mills (₹24,00,000) — Eligible
- `APP-1007`: BlueWave Cold Storage (₹19,50,000) — Eligible (short statement period)
- `APP-1008`: SunTech Heavy Engineering (₹75,00,000) — Blocked ($\ge$ ₹25L)
- `APP-1009`: Zenith Pharma Distributors (₹16,00,000) — Eligible
- `APP-1010`: Metro Auto Ancillaries (₹20,00,000) — Eligible
- `APP-1011`: Bharat Heavy Fabrication (₹60,00,000) — Blocked ($\ge$ ₹25L)
- `APP-1012`: Kaveri Retail Chains (₹14,00,000) — Eligible

---

## ⚠️ Known Gaps (What the Prototype Does Not Prove)
1. **Real Model Extraction Accuracy**: Uses pre-extracted bounding box coordinates.
2. **Production Core Banking Timestamps**: Session-generated timestamps instead of live core banking integration.
3. **Live Applicant Dispatch**: Preview panel generates consolidated message without transmitting live email/SMS.
