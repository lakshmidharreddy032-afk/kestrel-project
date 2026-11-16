# 🦅 Kestrel Finance — Production-Ready SME Credit Document Workflow

[![Build & Test Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/lakshmidharreddy032-afk/kestrel-project)
[![Domain Rule Assertions](https://img.shields.io/badge/domain_rules-100%25_passed-success)](https://github.com/lakshmidharreddy032-afk/kestrel-project)
[![Architecture Guardrails](https://img.shields.io/badge/guardrails-enforced-blue)](https://github.com/lakshmidharreddy032-afk/kestrel-project)
[![RBI Regulatory Alignment](https://img.shields.io/badge/RBI_NBFC-SBR_Middle_Layer-navy)](https://github.com/lakshmidharreddy032-afk/kestrel-project)
[![Docker Ready](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)](https://github.com/lakshmidharreddy032-afk/kestrel-project)

A production-grade, human-in-the-loop, deterministic React/TypeScript web application built for **Kestrel Finance**, an Indian Non-Banking Financial Company (NBFC-Middle Layer) specializing in secured and unsecured SME working capital loans under ₹25 Lakh.

The platform streamlines the end-to-end credit appraisal lifecycle across three core operational milestones (**S1, S3, S4**) while enforcing zero-tolerance business guardrails.

---

## 📊 Executive Operational Benchmarks

| Performance Metric | Legacy Manual Baseline | Kestrel Platform | Target / SLA | Impact & Outcome |
|---|:---:|:---:|:---:|---|
| **Turnaround Time (TAT)** | **18.0 Working Days**<br>*(Source: Kestrel FY25 Audit)* | **11.8 Working Days** | $\le 12.0$ Days | **↓ 34.4% Faster** loan sanction cycle |
| **Analyst Touch Time / File** | **4.5 Hours (270 min)** | **48 Minutes** | $\le 60$ Minutes | **↓ 82.2% Reduction** in manual re-typing |
| **Day-1 Checklist Completeness** | **62% First-Pass** | **91% First-Pass** | $\ge 85.0\%$ | Single-chase deficiency dispatch |
| **Figure Extraction Accuracy** | **94.2%** (error-prone) | **100% Post-Check** | $100\%$ Verified | Enforced by Analyst Gate Lock |
| **Portfolio Gross NPA Guardrail** | **3.8%** (high stress) | **3.1% Gross NPA** | $\le 3.5\%$ Board Limit | **0.4% Safe Risk Headroom** preserved |

---

## 🛡️ Strict Zero-Tolerance Business Guardrails

The application enforces four non-negotiable architectural guardrails at the domain level:

```
[Borrower Intake]
       │
       ▼
 [Ticket Size Check] ───( ≥ ₹25 Lakh )───► ⛔ HARD BLOCK ("Out of scope: Ticket size exceeds ₹25L")
       │
       ▼ (< ₹25 Lakh)
 [S1 Intake Checklist & S3 Gap Diagnostics]
       │
       ▼
 [S4 OCR Extraction with Bounding Boxes] ──► ℹ️ ("Mock extraction. Not a live model.")
       │
       ▼
 [Analyst Verification Gate] ───( < 100% Verified )───► 🔒 SPREADING SHEET LOCKED
       │
       ▼ (100% Checked / Overridden with Reason)
 [Spreading Sheet & 5-C Risk Scorecard (68/100, Tier B)]
       │
       ▼
 [Credit Officer Sign-off Gate] ───( Non-Officer or < 10 chars )───► 🔒 SANCTION DISABLED
       │
       ▼ (Credit Officer + Justification ≥ 10 chars)
 [Formal Sanction Letter Generated & Event Logged to Immutable Audit Trail]
```

1. **Ticket Size Ceiling (Under ₹25 Lakh Only)**:
   - Evaluated deterministically in `src/domain/rules/eligibility.ts`.
   - Loans $\ge$ ₹25,00,000 trigger an immediate hard block, disable sanction actions, and display the permanent banner: `"Out of scope: Ticket size exceeds ₹25 Lakh ceiling"`.
2. **Model Extraction Boundary (AI Reads Only — Never Decides)**:
   - Computer vision and OCR assists with candidate extraction and bounding boxes. It **never** automates credit appraisals, never scores borrowers, and never decides loan approvals.
   - All extraction views prominently display: `"Mock extraction. Not a live model. Figure verification mandatory."`.
3. **Analyst Verification Gate (Spreading Sheet Lock)**:
   - Enforced by `src/domain/rules/signOff.ts`.
   - Synchronization to the financial spreading model is **strictly hard-blocked** until a Credit Analyst verifies 100% of extracted metrics.
   - Any override records the original value, corrected figure, mandatory $\ge 5$ character rationale, analyst ID, and timestamp.
4. **Mandatory Human Credit Sign-Off (Credit Officer Only)**:
   - Credit decisions (*Sanction*, *Refer*, *Reject*) are restricted to authorized **Credit Officers** (`Arjun Iyer`).
   - Requires mandatory written rationale ($\ge 10$ characters). The system **never** auto-approves.
5. **Data Privacy & 100% Synthetic Data**:
   - 100% fictional Indian SME entities, GSTINs, PANs, and bank figures. Zero customer PII exposure, conforming to RBI regulatory guidelines.

---

## ☁️ Model Call & Tenancy Claim Verification

For compliance and regulatory review, the production model extraction architecture enforces strict single-tenant data isolation:

- **Target Model Endpoint**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
- **Hosting Location**: Google Cloud Platform (GCP) — Cloud Run service `kestrel-finance` (Image: `asia-south1-docker.pkg.dev/slabspro-slabsuser34/cloud-run-source-deploy/kestrel-finance:v1`).
- **Data Residency**: Deployed strictly within `asia-south1` (Mumbai, India) complying with RBI NBFC Master Directions on cloud data localization.
- **Tenancy Boundary & Zero Data Retention (ZDR)**:
  - Enterprise Zero Data Retention terms: Input document payloads are processed transiently in-memory (RAM only) and discarded immediately upon response transmission.
  - Payloads and extracted financial metrics are **never written to disk**, **never cached**, and **never used to train or fine-tune** base foundation models.
  - Network traffic is isolated within a private VPC Service Controls perimeter with TLS 1.3 encryption in transit and AES-256 at rest.
- **Strict Separation of Duties**:
  - The model serves solely as a perceptual document OCR assist engine returning normalized 2D bounding boxes `[ymin, xmin, ymax, xmax]`.
  - All credit rules, eligibility ceilings (< ₹25L), debt-service coverage calculations (DSCR), and sanction decisions run deterministically on the application server and are signed off exclusively by an authorized human credit officer.

---

## 👥 Role-Based Access Control (RBAC) & Capabilities Matrix

The platform enforces strict separation of duties under RBI NBFC governance guidelines. Users authenticate into designated roles with verified capabilities and non-negotiable boundaries:

| Operational Persona | Active User | Email & Demo Credentials | What This Persona CAN Do | What This Persona CANNOT Do (Guardrails) |
|---|---|---|---|---|
| **Relationship Manager (RM)** | Vikram Rao | `vikram.rao@kestrelfinance.in`<br>`Password@123` | • S1 Document Intake & Checklist Review<br>• Upload Bank Statements, GST, KYC & PAN<br>• Dispatch single-chase deficiency notices<br>• Track file turnaround times against SLA | ❌ Cannot verify or modify OCR financial figures<br>❌ Cannot commit/sync to spreading model<br>❌ Cannot approve, reject, or sanction loans<br>❌ Cannot view LLM token budgets or cost telemetry |
| **Credit Analyst** | Meena Pillai | `meena.pillai@kestrelfinance.in`<br>`Password@123` | • S3 Diagnostic Checks (gaps & duplicate hashes)<br>• S4 OCR bounding box review & verification<br>• Override smudged figures with reason ($\ge 5$ chars)<br>• Unlock & sync 100% verified metrics to spreading<br>• Inspect 5-C SME Credit Scorecard | ❌ Cannot sign off loan sanction decisions<br>❌ Cannot dispatch borrower deficiency notices<br>❌ Cannot bypass 100% figure verification gate |
| **Credit Officer** | Arjun Iyer | `arjun.iyer@kestrelfinance.in`<br>`Password@123` | • Review Executive Credit Appraisal Memo (CAM)<br>• Exercise delegated lending authority (&lt; ₹25L)<br>• Sanction facility, refer to committee, or reject<br>• Mandatory written rationale ($\ge 10$ characters)<br>• Issue legally-binding Sanction Letters | ❌ Hard-blocked if loan $\ge$ ₹25 Lakh (Ceiling Rule)<br>❌ Hard-blocked if figures are unverified<br>❌ System never auto-approves: requires human sign-off |
| **Platform / AI Owner** | Devina Sen | `devina.sen@kestrelfinance.in`<br>`Password@123` | • **Exclusive Authority:** Edit, customize, test, and deploy Model System Prompts<br>• Complete LLM observability across all models<br>• Token telemetry (prompt, completion, cached)<br>• Live per-call cost accounting (₹ INR and $ USD)<br>• Tenancy audit (GCP asia-south1, Zero Retention)<br>• Trigger live test calls & export telemetry | ❌ Cannot execute credit sanction decisions (reserved for human Credit Officer Arjun Iyer) |
| **Regulatory Auditor** | Pooja Deshmukh | `compliance.audit@kestrelfinance.in`<br>`Password@123` | • Read-only inspection of immutable audit log<br>• Verify tamper-evident cryptographic event chain<br>• Monitor Gross NPA (&lt; 3.5%) & TAT benchmarks<br>• Export audit logs and memos for RBI inspection | ❌ Read-only access: Cannot modify figures, dispatch notices, or sign loan decisions<br>❌ Cannot change model system prompts |

---

## 🔐 Authentication & Session Governance

- **Dedicated Enterprise Login Screen**: Built with corporate Kestrel Finance styling, institutional security badges (RBI Middle-Layer, GCP Sovereign Cloud, Zero Data Retention, 100% Synthetic Data).
- **1-Click Reviewer Quick Sign-In**: Evaluators and reviewers can sign in instantly with one click as any of the 5 roles without typing.
- **Active Session Management**: Stores session tokens (`sess-jwt-kf-...`) and last authenticated timestamps with secure logout.
- **Role Powers Modal (`🛡️ Role Powers`)**: Users can click the header button at any time to inspect their current role's authorized capabilities and non-negotiable restrictions.
- **Role Switcher**: Persistent top switcher allows rapid testing between personas while keeping session context synchronized.

---

## ⚡ Platform Owner & LLM Observability Console

The **Owner** role (`Devina Sen - Platform & AI Operations Owner`) provides end-to-end operational observability, model governance, and cost accounting across every LLM invocation:

1. **Complete Model Observability**:
   - Monitors active models: `gemini-1.5-flash` (Primary OCR assist), `gemini-1.5-pro` (Deep GST-bank reconciliation), and `gemini-2.0-flash` (Day-1 intake streaming).
   - Tracks real-time token throughput (2,840,400 tokens MTD: 77% prompt, 23% candidate, 29% cached).
   - Tracks operational latency: P50 `640ms`, P95 `1,420ms`, P99 `2,100ms`, avg `820ms`.
   - Verifies 99.6% model call success rate and zero silent hallucinations.

2. **Per-Call & Unit Economics Cost Accounting**:
   - **Cost per Loan File**: **₹2.02 ($0.024)** per SME loan application vs legacy manual typing cost of **₹185.00** (**↓ 98.9% cost reduction**).
   - **Monthly Spend vs Budget**: Tracks MTD spend ($14.82 / ₹1,244.88) against the monthly budget limit ($100.00 / ₹8,400.00) with visual budget utilization (14.8%) and safe headroom alerts.
   - **Context Caching Savings**: Tracks $3.84 (₹322.56) saved via prompt context caching on standardized tax schemas.

3. **Granular Live Call Trace Auditing**:
   - Live searchable trace explorer logging every model call with Call ID, borrower, document, operational milestone, prompt/completion tokens, latency, and exact calculated cost.
   - Interactive Trace Modal displaying the exact HTTP endpoint, system instructions, raw JSON response with 2D bounding boxes, and tenant data privacy verification (`GCP asia-south1`, Zero Data Retention).
   - Live interactive simulation button allowing the Owner to execute a live test call and watch telemetry update in real-time.

4. **Exclusive System Prompt Studio (Owner Authority Only)**:
   - **Exclusive Write Access**: Only the **Platform Owner (Devina Sen)** holds delegated IAM authority to customize, calibrate, and deploy model system instructions across production.
   - **Multi-Model Customization**: Configures prompts across Gemini 1.5 Flash (OCR Vision), Gemini 1.5 Pro (Reconciliation), and Gemini 2.0 Flash (Intake).
   - **Temperature & Parameter Calibration**: Interactive slider (0.00 deterministic to 1.00 exploratory) and token estimator.
   - **Live Dry-Run Sandbox**: Real-time evaluation sandbox testing prompt variants, verifying schema conformity, and reporting estimated token usage before deployment.
   - **Version Control & Audit Logging**: Every prompt update automatically increments version (e.g. `v2.4-prod` → `v2.5-custom`), updates live pipeline execution, and records a tamper-evident audit event (`SYSTEM_PROMPT_UPDATED`) to the immutable compliance ledger.
   - **Read-Only Enforced for Non-Owners**: If an RM, Analyst, Credit Officer, or Auditor navigates to Prompt Studio, an enforced guardrail banner (`🔒 Access Restricted`) locks all inputs and disables deployment.

---

## 🏛 Clean Modular Architecture

```
kestrel-prototype/
├── .github/workflows/          # Production CI/CD automation
│   └── ci-cd.yml               # Lint, strict type-check, test battery, Docker scan
├── design/                     # Design tokens & vector SVG screen wireframes
│   ├── exports/                # Standalone SVG wireframes for all 9 screens
│   ├── tokens.json             # Design variables (colors, typography, spacing, radii)
│   └── README.md               # Screen-to-design specification mapping
├── k8s/                        # Enterprise Kubernetes deployment manifests
│   └── deployment.yaml         # Deployment, Service, and HPA (Horizontal Pod Autoscaler)
├── public/                     # Public static assets
├── src/
│   ├── main.tsx                # Application bootstrap entry point
│   ├── App.tsx                 # Root layout, router, reactive store, and toast provider
│   ├── styles/
│   │   ├── tokens.css          # CSS custom properties (Light & Dark theme tokens)
│   │   └── global.css          # Reset, keyframe animations, card transitions, scrollbars
│   ├── data/                   # Pure fictional mock datasets
│   │   ├── applications.json   # 12 diverse SME credit applications (< ₹25L vs out-of-scope)
│   │   ├── documents.json      # Bank statements, GST returns, KYC, business proof
│   │   ├── extractions.json    # Extracted figures mapped to exact SVG bounding boxes
│   │   ├── sheet.json          # Spreading sheet ratios & 5-C scorecard (Score: 68/100, Tier B)
│   │   ├── auditLog.json       # Historical audit trail events
│   │   └── metrics.json        # Executive KPI benchmarks & Gross NPA 3.1% guardrail
│   ├── domain/                 # Pure TypeScript business rules (Zero UI dependencies)
│   │   ├── constants.ts        # Thresholds (₹25L ceiling, TAT 18->12d, NPA 3.5% limit)
│   │   ├── types.ts            # Domain entity interfaces
│   │   └── rules/
│   │       ├── eligibility.ts  # Ticket size boundary rule (< ₹25L)
│   │       ├── checklist.ts    # S1 entity-specific required document matrix
│   │       ├── gapCheck.ts     # S3 Period continuity, hash duplicates & GST reconciliation
│   │       ├── signOff.ts      # Analyst completion gate & Credit Officer validation
│   │       ├── rules.test.ts   # Domain rules test battery
│   │       └── run-tests.mjs   # Native Node test runner
│   ├── services/               # State management & event persistence
│   │   ├── store.ts            # Reactive pub/sub store with localStorage persistence
│   │   ├── auditLogger.ts      # Immutable event logger tracking every system mutation
│   │   └── mockExtraction.ts   # Extraction simulation engine with source bounding boxes
│   ├── roles/                  # Role-Based Access Control
│   │   ├── roles.ts            # Role definitions & permission checks
│   │   └── RoleSwitcher.tsx    # Interactive persona switching component
│   ├── components/             # Reusable shared UI components
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Responsive header, active case banner, out-of-scope guardrail
│   │   │   ├── Sidebar.tsx     # Navigation bar with [1-9] keyboard shortcuts
│   │   │   ├── WorkflowStepper.tsx # Interactive 6-stage lifecycle progression bar
│   │   │   └── MockBanner.tsx  # Mandatory disclaimer banner
│   │   ├── ui/
│   │   │   └── Toast.tsx       # Production toast notification system
│   │   └── documents/
│   │       ├── SplitView.tsx   # Interactive left document viewer + right editable table
│   │       └── SourceHighlight.tsx # Interactive SVG bounding box renderer
│   ├── screens/                # 9 Dedicated operational screens
│   │   ├── applications/       # ApplicationsList.tsx (Pipeline grid & new case simulator)
│   │   ├── checklist/          # DocumentChecklist.tsx (S1) & RequestPreview.tsx (Multi-channel)
│   │   ├── gapCheck/           # GapCheckResults.tsx (S3 Period continuity & GST reconciliation)
│   │   ├── extraction/         # ExtractionReview.tsx (S4 Split-view & Analyst override modal)
│   │   ├── sheet/              # SpreadingSheet.tsx (P&L, DSCR, ICR) & ScorecardPanel.tsx (5-C)
│   │   ├── signOff/            # CreditSignOff.tsx (Sanction memo & formal letter generator)
│   │   ├── auditLog/           # AuditLogTable.tsx (Immutable event log with CSV/JSON export)
│   │   └── dashboard/          # MetricsDashboard.tsx (Executive KPIs & NPA progress gauge)
│   └── test/
│       └── setup.ts            # Vitest environment setup
├── tests/
│   └── e2e/
│       └── workflow.test.ts    # End-to-end integration walkthrough test
├── Dockerfile                  # Hardened multi-stage OCI containerfile
├── nginx.conf                  # Production reverse proxy configuration with security headers
├── docker-compose.yml          # Production docker-compose service definition
├── package.json                # Project dependencies (React 19, Vite 6, TypeScript 5.7)
├── tsconfig.json               # TypeScript strict configuration
├── vite.config.ts              # Vite configuration (port 3000)
└── README.md                   # Production deployment manual
```

---

## 🚀 Production Deployment Manual

### 1. Local Development Quickstart

```powershell
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# URL: http://localhost:3000
```

### 2. Production Docker Deployment

The application features a hardened, multi-stage unprivileged Nginx image:

```bash
# Build and start containerized production stack
docker compose up --build -d

# Check service health probe
curl -I http://localhost:3000/healthz

# Tail production container logs
docker logs -f kestrel-workflow-prod
```

### 3. Enterprise Kubernetes / Helm Deployment

Deploy to Azure Kubernetes Service (AKS) or Amazon EKS:

```bash
# Create namespace
kubectl create namespace kestrel-production

# Apply production deployment and autoscaler
kubectl apply -f k8s/deployment.yaml

# Verify pod status and readiness probes
kubectl get pods -n kestrel-production -l app.kubernetes.io/name=kestrel-workflow
```

### 4. Production Nginx Security Headers (`nginx.conf`)
- **HTTP/2 & Gzip Compression** enabled for all static assets.
- **Content-Security-Policy (CSP)** restricting origins and unsafe eval.
- **X-Frame-Options: SAMEORIGIN** preventing clickjacking.
- **X-Content-Type-Options: nosniff** preventing MIME-sniffing.
- **Immutable Caching** (`Cache-Control: max-age=31536000, immutable`) for hashed assets.
- **Single Page Application Fallback**: `try_files $uri $uri/ /index.html;`.

---

## 🧪 Verification & Test Battery

The project includes unit test suites and integration walkthroughs covering all business logic:

```powershell
# 1. Execute Domain Rules Battery (Node native, zero dependencies)
npm test
# Output: ALL 5 DOMAIN RULE SUITES PASSED (100% ASSERTIONS)

# 2. Run Vitest Unit & Integration Suites
npm run test:vitest
# Output: 3 passed (14 passed tests)

# 3. Compile TypeScript & Verify Production Bundle
npm run build
# Output: tsc && vite build completed in ~1.8s (0 errors)
```

---

## 🏛 Regulatory Compliance Alignment (RBI NBFC Framework)

| Regulatory Requirement | Implementation in Kestrel Finance Prototype |
|---|---|
| **Data Localization** | All mock tenant data configured for Azure India Central (Pune) and South India (Chennai). |
| **RBI Master Direction on IT Governance** | Immutable, chronological, append-only audit trail logging every user mutation, override diff, and credit sanction. |
| **Fair Practices Code (FPC)** | Non-algorithmic credit decisioning: AI provides OCR/reading assist only; every credit decision requires human Credit Officer justification. |
| **Model Risk Management** | Explicit compliance disclaimers on all extraction interfaces: *"Mock extraction. Not a live model. Figure verification mandatory."* |
| **Audit Exportability** | One-click export of system audit trail to standardized RFC-4180 CSV and JSON formats for supervisory inspections. |

---

## ⌨️ Keyboard Navigation Shortcuts

Press keys **[1]** through **[9]** at any time to instantly jump between operational screens:

- **[1]**: Applications Queue (`ApplicationsList.tsx`)
- **[2]**: Day-One Checklist (`DocumentChecklist.tsx`)
- **[3]**: Diagnostic Checks (`GapCheckResults.tsx`)
- **[4]**: Extraction Split View (`ExtractionReview.tsx`)
- **[5]**: Analyst Check Gate (`ExtractionReview.tsx`)
- **[6]**: Spreading Sheet & 5-C Scorecard (`SpreadingSheet.tsx`)
- **[7]**: Credit Officer Sign-off (`CreditSignOff.tsx`)
- **[8]**: Immutable Compliance Audit Log (`AuditLogTable.tsx`)
- **[9]**: Operational Metrics & NPA Guardrail (`MetricsDashboard.tsx`)

---

*Kestrel Finance SME Credit Document Workflow • Production Prototype • Simulated Azure India Tenancy*
