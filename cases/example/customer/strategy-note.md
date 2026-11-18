# Morild 2030 – Strategy note: Accounts and data

> **Fictional document.** Created for a portfolio demonstration. Internal strategy note from the fictional Morild Bank, shared with suppliers before the RFP.

Owner: Chief Operating Officer. Contributors: Head of Retail, Head of Business Banking, CIO, Chief Risk Officer, Chief Data Officer.

## 1. Where we are

- The core account system is 19 years old. Balances and transactions are updated in real time for card payments only; other account events are processed in overnight batches.
- Customer and account data is spread across the core system, the CRM, the data warehouse and several spreadsheets. The same term (for example "active customer") has three definitions.
- Launching a new account product takes 6–9 months, mainly because of changes in the core system and manual testing.
- Partners get account data through two old file-based integrations and one API that only covers payment initiation.
- Regulatory reporting requires about 1 400 hours of manual work per year in the finance and risk departments.

## 2. What we want to achieve by 2030

1. **Real-time customer service.** Customers and advisers see the same up-to-date account information in all channels.
2. **Faster product launches.** A new account product can be configured and launched in less than 8 weeks.
3. **Open and secure platform.** Partners can use well-documented APIs to access account information and services with the customer's consent.
4. **One version of the truth.** A common data model, data ownership and data products that both the business and reporting can trust.
5. **Simpler operations.** Halve the manual work in regulatory reporting by 2029.
6. **Responsible AI.** Use AI where it gives clear value – for example insight for advisers and better data quality – with people in charge of decisions.

## 3. Constraints and concerns

- **Delivery risk.** The board will not accept a "big bang" replacement. The change must be phased, with value delivered at each step and the old system running in parallel until each step is proven.
- **Capacity.** The bank's own IT team is small (about 35 people) and cannot run a large project alone.
- **Budget.** The total investment must fit within the existing IT budget plus a one-off strategic investment approved by the board.
- **Regulation.** DORA, data protection (GDPR), EU/EEA data residency, the EU AI Act and the coming changes to EU payment services rules.
- **Lock-in.** The bank wants standard, documented interfaces so that it is not locked to one supplier.

## 4. Open questions we want to explore with suppliers

- What should come first: real-time account data, the data platform or the APIs?
- How can AI help our advisers without creating new risks?
- What is a realistic plan and pace for a bank of our size?
- How do other banks organise data ownership and data products?

## 5. Stakeholders

| Role | Main interest |
|---|---|
| COO (sponsor) | Simpler operations, delivery risk, cost |
| Head of Retail | Customer experience in the app, faster products |
| Head of Business Banking | Integration with SME accounting platforms |
| CIO | Architecture, migration, capacity, lock-in |
| Chief Data Officer | Data model, data ownership, data quality |
| Chief Risk Officer | DORA, operational risk, AI governance |
| Head of Procurement | A fair process, contract terms, exit |
