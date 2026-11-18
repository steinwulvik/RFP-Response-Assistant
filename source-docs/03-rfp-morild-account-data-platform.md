# Request for Proposal – Account Services and Data Platform

**Buyer:** Morild Bank (fictional)
**Reference:** MB-2026-014
**Issued:** 16 November 2026

> **Fictional document.** Created for a portfolio demonstration. The structure is inspired by the public tender templates from the Norwegian Agency for Public and Financial Management (DFØ, anskaffelser.no). Morild Bank is a private savings bank and is not bound by public procurement law, but runs a structured and fair process.

---

## 1. Introduction

Morild Bank wants a partner to deliver and operate a modern **account services and data platform**. The platform shall give customers and advisers real-time account information, let the bank launch account products faster, offer secure APIs to partners, and provide trusted data for analysis and regulatory reporting.

Background on the bank and its strategy is given in the attached *Annual Report 2025 (extract)* and *Morild 2030 – Strategy note: Accounts and data*. Suppliers are encouraged to use these documents to understand the bank's priorities.

The contract is expected to run for 6 years, with an option to extend by 2 + 2 years.

## 2. Competition rules

### 2.1 Procedure

The bank will use a negotiated procedure. After the first evaluation, up to three suppliers will be invited to negotiations and a solution workshop. The bank may also award the contract on the basis of the first tenders without negotiations.

### 2.2 Timeline

| Activity | Date |
|---|---|
| RFP issued | 16 November 2026 |
| Deadline for questions | 18 December 2026, 12:00 CET |
| Answers to questions published | 8 January 2027 |
| **Tender deadline** | **22 January 2027, 12:00 CET** |
| Solution workshops with selected suppliers | Weeks 6–7, 2027 |
| Expected contract signature | April 2027 |

### 2.3 Communication

All questions must be sent in writing through the bank's tender portal. Questions and answers will be shared anonymously with all suppliers. Suppliers shall not contact other employees of the bank about this competition during the process.

### 2.4 Formal requirements for the tender

The tender must be written in English and submitted through the tender portal before the deadline. Tenders received after the deadline will be rejected.

The tender shall be signed by a person authorised to bind the supplier, and must be valid for six months after the tender deadline.

The solution description (Appendix B) should not exceed 60 pages. Marketing material will not be evaluated.

Any reservations or deviations from the requirements or the draft contract must be stated clearly in a separate list. Reservations that are not stated in this list will not be taken into account, and significant reservations may lead to rejection.

## 3. Qualification requirements

| ID | Requirement |
|---|---|
| Q-01 | The supplier shall hold a valid ISO/IEC 27001 certification covering the services offered. |
| Q-02 | The supplier shall document at least two reference customers among banks in the Nordic region or the EU/EEA, where comparable account or data solutions have been delivered within the last five years. |
| Q-03 | The supplier shall have a credit rating or financial statements showing sufficient financial capacity for a contract of this size. |
| Q-04 | The supplier shall confirm that it can provide the information the bank needs for its DORA register of information, including subcontractors that support critical functions. |

## 4. Award criteria

| Criterion | Weight | What is evaluated |
|---|---|---|
| Solution quality | 40 % | How well the solution meets the bank's needs and the "should" requirements in chapter 5; clarity of the solution description |
| Delivery plan and risk | 20 % | Realism of the phased plan, migration approach, parallel running, how delivery risk is reduced, the supplier's team |
| Data and AI governance | 10 % | Data model, data ownership support, responsible use of AI, explainability and human control |
| Price | 30 % | Total cost over six years according to the price form (Appendix C) |

All "shall" requirements must be met. A tender that does not meet a "shall" requirement may be rejected. "Should" requirements are evaluated under the award criteria.

## 5. Requirement specification

Suppliers shall answer each requirement in Appendix A, stating whether it is met, partly met or not met, and describe how. Requirements without an ID in the text below shall also be answered; reference the section number.

### 5.1 Account services

| ID | Requirement |
|---|---|
| AS-01 | The solution shall support deposit accounts for retail and business customers, including current accounts, savings accounts and fixed-term deposits. |
| AS-02 | The solution shall calculate interest and fees according to product rules set by the bank, including tiered interest rates. |
| AS-03 | The bank should be able to configure and launch a new account product without changes to program code. |
| AS-04 | The solution shall support joint accounts and accounts with several authorised users, with different rights per user. |
| AS-05 | The solution should support sub-accounts or "savings pots" linked to a main account. |
| AS-06 | The solution shall handle account opening, changes and closure, including a full history of all changes. |
| AS-07 | The solution shall support blocking of accounts and amounts, for example in connection with fraud cases or legal seizure. |

### 5.2 Real-time account information

Today, most account events are processed in overnight batches. With the new platform, balances and transactions must be updated in real time, so that the mobile app, online bank and adviser tools show the same information within two seconds of a booking.

The solution should publish account events (for example "booking made", "balance changed", "account blocked") as event streams that other systems can subscribe to.

During the transition, the solution must be able to run in parallel with the current core system, with daily reconciliation of balances between the old and the new solution.

We would also like the supplier to describe how the solution handles peak loads, such as salary days and the days before Christmas.

### 5.3 APIs and open banking

| ID | Requirement |
|---|---|
| API-01 | All account services shall be available through documented REST APIs, with an OpenAPI specification. |
| API-02 | The solution shall support third-party access to account information and payment initiation based on the customer's consent, in line with PSD2 and the Berlin Group NextGenPSD2 standard. |
| API-03 | The solution should be prepared for the changes that follow from the EU's revised payment services rules (PSD3 and the Payment Services Regulation). Describe your plan. |
| API-04 | The solution should offer a developer portal with a test environment (sandbox) for partners. |
| API-05 | The solution shall log all API calls with time, caller and consent reference, and keep the logs for at least five years. |
| API-06 | The solution should support APIs for SME accounting platforms, so that business customers can get account data directly into their accounting system. |

### 5.4 Data platform and data products

| ID | Requirement |
|---|---|
| DP-01 | The solution shall provide a common data model for customers, accounts, products and transactions, documented and available to the bank. |
| DP-02 | The bank should be able to define data products (for example "customer engagement" or "deposit flows") with a named owner, definition and quality rules. |
| DP-03 | The solution shall measure and report data quality (completeness, accuracy, timeliness) for the data products. |
| DP-04 | The solution should keep the full data lineage from source system to report. |
| DP-05 | The bank shall be able to extract all its data in an open, documented format at any time, and at the end of the contract. |

The bank's analysts work in SQL and Python. The data platform should allow them to use their own tools on governed data, without copying data to unmanaged spreadsheets.

### 5.5 Regulatory reporting

| ID | Requirement |
|---|---|
| RR-01 | The solution shall deliver the account and transaction data the bank needs for regulatory reporting to Finanstilsynet, Norges Bank and Statistics Norway, with documented calculation rules. |
| RR-02 | The solution should support reconciliation between the reporting data and the general ledger, with automatic alerts on differences. |
| RR-03 | The supplier should describe how changes in reporting requirements are handled, and who is responsible for updating the solution. |

### 5.6 AI and analytics

The bank wants to use AI where it gives clear value, with people in charge of decisions. The bank's AI policy is available on request.

| ID | Requirement |
|---|---|
| AI-01 | The supplier should describe AI functions in the solution, or planned in the roadmap, that can help advisers or improve data quality. |
| AI-02 | For every AI function, the supplier shall describe what data is used, how results can be explained, and where a person must review or approve the result. |
| AI-03 | AI functions shall not make automated decisions about customers without human review, unless the bank has explicitly approved it. |
| AI-04 | Customer data shall not be used to train AI models outside the bank's own environment without the bank's written consent. |
| AI-05 | The supplier should describe how the solution supports the bank's obligations under the EU AI Act. |

### 5.7 Information security and operational resilience

| ID | Requirement |
|---|---|
| SEC-01 | Customer data shall be stored and processed within the EU/EEA, including backups and support access. |
| SEC-02 | All data shall be encrypted in transit and at rest. |
| SEC-03 | Access to the solution shall be controlled with role-based access and multi-factor authentication for all administrative users. |
| SEC-04 | The supplier shall notify the bank of serious ICT incidents without undue delay and no later than four hours after detection. |
| SEC-05 | The supplier shall take part in the bank's resilience testing, including threat-led penetration testing (TLPT) when required by the authorities. |
| SEC-06 | The supplier shall have a documented exit plan that allows the bank to move the service to another supplier or back in-house. |
| SEC-07 | The supplier should provide a recent independent assurance report (ISAE 3402 type 2 or equivalent) each year. |

### 5.8 Operations and service levels

The solution shall be available 99.95 % of the time per month for customer-facing services, measured outside agreed maintenance windows. Planned maintenance must be done at night (between 01:00 and 05:00) and announced at least 14 days in advance.

The supplier shall offer support in English and Norwegian, 24/7 for critical incidents.

The solution should support recovery after a serious incident with a recovery time objective (RTO) of no more than 4 hours and a recovery point objective (RPO) of no more than 5 minutes.

The supplier should report monthly on availability, incidents, capacity and service requests.

### 5.9 Delivery, migration and plan

The bank will not accept a "big bang" replacement. The supplier shall propose a phased delivery plan, where each phase gives value to customers or the bank and can be taken into use on its own.

The plan should start with the area where the supplier believes the value is highest and the risk lowest, and explain why.

The supplier shall describe the migration approach for accounts and history, including test migrations, reconciliation and fallback if a migration step fails.

The bank's own IT team has about 35 people. The supplier should describe which roles and how much capacity the bank must provide in each phase.

The supplier shall name the key persons for the delivery (at least project manager and solution architect) and describe their relevant experience.

### 5.10 Commercial terms

The price shall be given in the price form (Appendix C), in NOK excluding VAT, and cover all costs needed to deliver the requirements.

The supplier should offer a price model where part of the payment is linked to the delivery of agreed milestones.

The draft contract (Appendix D) is based on a standard agreement for IT services. The supplier shall accept the bank's right to audit, which is required by Finanstilsynet's rules on outsourcing.

## 6. Appendices

- Appendix A – Requirement response form
- Appendix B – Solution description (max 60 pages)
- Appendix C – Price form
- Appendix D – Draft contract

*Appendices B–D are not included in this demonstration.*
