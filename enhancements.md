# Pathway AI — Global Mobility & Immigration Platform Roadmap
## Comprehensive Product Enhancement Strategy & Technical Timeline

---

### 🏛️ Executive Summary & Multi-Disciplinary Audit

Pathway AI is built to serve as an enterprise-grade statutory relocation engine for digital nomads, remote workers, global talent, and corporate HR teams. This document details completed core enhancements and establishes the strategic engineering roadmap for Q3 2026 through Q4 2027.

---

### ✅ Phase 1: Completed Enhancements (Production Ready)

#### 1. Statutory Pre-Departure Visa & Eligibility Audit Engine (`/src/components/PreDepartureAssessmentView.tsx`)
- **Statutory Rules Engine**: Dynamic evaluation matching passport nationality, tax residence, purpose of travel, monthly proven income, liquid savings, employment contract structure, clean police clearance, and medical insurance against statutory thresholds.
- **Official Authority Mapping**: Direct statutory agency linking (AIMA Portugal, UKVI, IRCC Canada, USCIS USA, BAMF Germany, ICP UAE).
- **Interactive Requirement Simulation**: Real-time scoring adjustment upon toggling statutory prerequisites (health insurance, passport validity, proof of accommodation, background checks).
- **PDF Report Export**: Print-formatted report generator for consular appointments and legal review.

#### 2. Legal Risk Mitigation & 183-Day Tax Physical Presence Controls
- **183-Day Rule Warning**: Physical presence tracker to prevent accidental worldwide tax residency triggers in host countries.
- **Permanent Establishment (PE) Risk**: Employer risk alert regarding corporate tax exposure from remote workers abroad without appropriate nomad/work visas.
- **Statutory Legal Disclaimer**: Transparent notification framing software output as algorithmic statutory intelligence rather than formal legal counsel.

#### 3. Attorney Retainer & Lead Generation Portal
- **Consular Case File Packet**: Automated aggregation of user eligibility scores, document status, and route parameters into a confidential packet for partner law firms.
- **Direct Attorney Review Modal**: In-app workflow for scheduling file reviews with vetted immigration counsel.

#### 4. Humanitarian, Student (F-1) & Vulnerable Status Relief Suite (`/src/components/HumanitarianAndStudentReliefView.tsx`)
- **F-1 Student Status Safeguards**: Clear rulebooks for 60-day post-completion grace periods, OPT 90-day / STEM OPT 150-day cumulative unemployment limits, CPT course compliance, and DSO authorized withdrawals.
- **SEVIS "Out of Status" Emergency Reinstatement Engine**: Interactive statutory evaluator for USCIS Form I-539 reinstatement under 8 CFR 214.2(f)(16), assessing 150-day violation windows, unauthorized employment bars, and travel/re-entry reset options.
- **Spousal Visa Independence & Dispute Controls (H-4, F-2, L-2, CR-1)**: Guidance for document retention (FOIA I-797 requests), divorce grace period protections, independent bank accounts, and L-2/H-4 EAD work authorization rights.
- **VAWA Abuse Relief (Form I-360)**: Self-petitioning Green Card workflow for abused spouses of US Citizens/LPRs under 8 U.S.C. 1367 complete confidentiality.
- **T-Visa (Form I-914) & U-Visa (Form I-918) Relief**: Dedicated statutory pathways and 24/7 direct hotlines for victims of human trafficking and qualifying crimes.
- **Quick Safety Exit Button**: Instant one-click ESC trigger redirecting to a benign search page to protect users in unsafe domestic situations.

---

### 🗺️ Phase 2: Implementation Roadmap & Technical Timeline (Q3 2026 – Q4 2027)

| Quarter | Module / Feature Name | Core Functionality & Legal / Travel Hook | Technical Architecture & APIs |
|:--- |:--- |:--- |:--- |
| **Q3 2026** | **Hague Apostille & Translation Verification Agent** | Automated validation of whether certificates (birth, marriage, police record) require Hague Apostille stamps or sworn certified translations. | Tesseract OCR / Gemini Multimodal Vision API + Legal Registry DB |
| **Q4 2026** | **Family & Dependent Relocation Suite** | Spousal work authorization rules, child education visa requirements, and scaled minimum financial income thresholds per dependent. | Dynamic Dependent Multiplier Matrix Engine |
| **Q1 2027** | **Direct Embassy & Consular API Gateway** | Real-time tracking of Schengen VFS/BLS/TLS appointment slot availability and live consular processing time estimates. | WebSockets, Puppeteer/Playwright Scrapers & VFS/BLS Connectors |
| **Q2 2027** | **Global Housing & Lease Attestation Hub** | Verifying host country lease agreements for official immigration compliance (e.g. Junta de Freguesia in Portugal, Anmeldung in Germany). | Smart Contract Lease Verification + Local Municipal APIs |
| **Q3 2027** | **Enterprise B2B Global Mobility Portal** | Corporate HR dashboard to monitor remote employee visa compliance, Schengen 90/180 day limits, and corporate tax liability. | Multi-tenant Firebase / Cloud SQL RBAC + SSO Integration |
| **Q4 2027** | **Automated Consular Form Auto-Fill** | Instant auto-population of complex PDF consular visa application forms from scanned passport & user profile. | PDF-Lib / PDFForm Filler Engine + Encrypted Local Storage |

---

### 🔒 Security, Compliance & Data Privacy Standard

1. **Client-Side Document Encryption**: Sensitive passport scans and financial statements encrypted via AES-GCM before persistent cloud storage.
2. **GDPR / CCPA Right-to-be-Forgotten**: Instant purging of client PII (Personally Identifiable Information) upon user request or visa completion.
3. **Statutory Accuracy Guarantees**: Quarterly algorithmic audits of income thresholds against host country minimum wage adjustments.

---
*Maintained by Pathway AI Product & Legal Engineering Team*
