# Nordlys Banking Software – Capability sheet: Nordlys Accounts & Data

> **Fictional document.** Nordlys Banking Software and its products are invented for a portfolio demonstration. This is the internal fact sheet the bid team uses as its only source when drafting answers. Anything not stated here must be checked with a specialist.

Version: November 2026. Owner: Product management, Accounts & Data.

## Company

| ID | Fact |
|---|---|
| CAP-01 | Nordlys Banking Software is a Nordic supplier of banking software with about 900 employees and annual revenue of NOK 2.1 billion (2025). Audited annual accounts for the last three years are available. |
| CAP-02 | ISO/IEC 27001 certified for development, hosting and operation of all Nordlys Accounts & Data services. Certificate valid until September 2028. |
| CAP-03 | Reference customers for Accounts & Data: a Swedish savings bank (live 2023) and a Danish regional bank (live 2025). Both have agreed to act as references. A Norwegian reference is not yet available. |
| CAP-04 | Provides a standard information package for customers' DORA register of information, including all subcontractors that support critical functions. |

## Account services

| ID | Capability |
|---|---|
| CAP-10 | Deposit accounts for retail and business customers: current accounts, savings accounts, fixed-term deposits. |
| CAP-11 | Interest and fee engine with rule-based configuration, including tiered and date-dependent rates. |
| CAP-12 | Product configurator: new account products are set up by the bank's product team in a configuration tool, without code changes. Typical time from decision to launch at reference customers: 4–6 weeks. |
| CAP-13 | Joint accounts and multiple authorised users with individual rights. |
| CAP-14 | Sub-accounts ("pots") linked to a main account. |
| CAP-15 | Full account lifecycle (open, change, close) with complete audit history. |
| CAP-16 | Blocking of accounts and of specific amounts, with reason codes. |

## Real-time and integration

| ID | Capability |
|---|---|
| CAP-20 | Real-time posting: balances and transactions are updated in under one second after booking (measured at reference customers). |
| CAP-21 | Account events are published to an event streaming platform that other systems can subscribe to. |
| CAP-22 | Parallel-run toolkit with daily automatic reconciliation of balances between the legacy core system and Nordlys. |
| CAP-23 | Horizontally scalable; load-tested at 5 times normal peak volume. |

## APIs and open banking

| ID | Capability |
|---|---|
| CAP-30 | All services available as REST APIs with OpenAPI 3 specifications. |
| CAP-31 | PSD2 access-to-account and payment initiation APIs following the Berlin Group NextGenPSD2 standard, including consent management. |
| CAP-32 | Roadmap: PSD3/PSR readiness programme; changes will be delivered as part of standard releases once the final rules apply. |
| CAP-33 | Developer portal with sandbox and test data for partners. |
| CAP-34 | API logging with time, caller and consent reference. Retention period is configurable, up to 10 years. |
| CAP-35 | Connector framework for SME accounting platforms; ready-made connectors for selected Nordic accounting platforms. |

## Data platform

| ID | Capability |
|---|---|
| CAP-40 | Documented common data model for customers, accounts, products and transactions, delivered to the bank. |
| CAP-41 | Data product catalogue where each data product has an owner, definition and quality rules. |
| CAP-42 | Data quality dashboards measuring completeness, accuracy and timeliness. |
| CAP-43 | Data lineage from source systems into the data platform. Lineage from the data platform into the bank's own reporting tools is **not** included. |
| CAP-44 | Export of all data in open formats (Parquet, CSV) with documentation, at any time and at contract end. |
| CAP-45 | Governed SQL workspace for analysts. Python notebooks are on the roadmap for 2027. |

## Regulatory reporting

| ID | Capability |
|---|---|
| CAP-50 | Standard reporting data feeds for Norwegian regulatory reports, with documented calculation rules, delivered through a reporting partner. |
| CAP-51 | Automatic reconciliation of reporting data against the general ledger, with alerts on differences. |
| CAP-52 | Regulatory changes are implemented in quarterly releases; Nordlys monitors changes and is responsible for updating standard reports. |

## AI

| ID | Capability |
|---|---|
| CAP-60 | Data quality assistant (in production): finds anomalies and suggests corrections; every correction must be approved by a person. |
| CAP-61 | Adviser insight summary (pilot, general availability planned 2027): summarises a customer's account activity for the adviser. Shows the data each summary is based on. No automated decisions. |
| CAP-62 | Customer data is never used to train models outside the customer's own environment without written consent. |
| CAP-63 | AI documentation package per AI function: purpose, data used, explanation method, human review points, and a risk classification under the EU AI Act. |

## Security and resilience

| ID | Capability |
|---|---|
| CAP-70 | Hosting in data centres in Norway and Finland, backups in the same countries. |
| CAP-71 | Third-line technical support uses a follow-the-sun model that includes an engineering team outside the EU/EEA. Support access can be limited to EU/EEA staff only as a paid option. |
| CAP-72 | Encryption in transit (TLS 1.3) and at rest (AES-256). |
| CAP-73 | Role-based access control and multi-factor authentication for all users. |
| CAP-74 | Incident notification to customers within two hours of detection for serious incidents. |
| CAP-75 | Takes part in customers' resilience testing, including TLPT. |
| CAP-76 | Standard exit plan and exit assistance, described in the service agreement. |
| CAP-77 | ISAE 3402 type 2 report issued annually. |

## Operations and service levels

| ID | Capability |
|---|---|
| CAP-80 | Standard SLA: 99.9 % availability per month. Premium SLA: 99.95 % (extra cost). |
| CAP-81 | Standard maintenance window: 00:00–04:00, announced 14 days in advance. |
| CAP-82 | Support 24/7 in English for critical incidents. Norwegian-speaking support on weekdays 08:00–16:00. |
| CAP-83 | Recovery: RTO 2 hours, RPO 1 minute. |
| CAP-84 | Monthly service report: availability, incidents, capacity, service requests. |

## Delivery

| ID | Capability |
|---|---|
| CAP-90 | Phased delivery method: typically starts with the data platform and read-only APIs (low risk, early value), then real-time account services, then migration of products and history. |
| CAP-91 | Migration toolkit with test migrations, automatic reconciliation and rollback per migration step. |
| CAP-92 | Typical customer-side capacity: 6–10 FTE in each phase (product owner, architects, testers, data owners). |
