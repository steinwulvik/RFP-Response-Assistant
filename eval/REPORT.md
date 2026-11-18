# Evaluation report

Generated 2026-11-18. Answer key: 63 requirements (42 shall), 10 planted errors. All data is fictional.

| Metric | Target | claude | openai |
|---|---|---|---|
| Recall of shall-requirements | 95 % | 100 % | 100 % |
| Recall of all requirements | – | 100 % | 100 % |
| Precision (extracted rows that are real requirements) | 90 % | 100 % | 100 % |
| Requirement ID or section kept (traceability) | 95 % | 100 % | 100 % |
| Correct type (shall/should/info) | 95 % | 100 % | 100 % |
| Correct coverage in gap analysis | – | 96.8 % | 90.5 % |
| Answers with a correct evidence reference | 90 % | 100 % | 100 % |
| "Needs specialist input" where expected | 100 % | 100 % | 100 % |
| Planted errors found by red-team | 80 % | 100 % | 100 % |
| Planted errors resolved by the revision agent (re-check clean) | 80 % | 100 % | 60 % |
| Rows extracted / requirements matched / extra rows from splitting | – | 64 / 63 / 1 | 65 / 63 / 2 |
| Red-team findings outside the planted errors (read them – they can be real) | – | 0 | 0 |

## claude: what was missed

**shall not found** (0)
- none

**not found other** (0)
- none

**extra extracted** (0)
- none

**wrong type** (0)
- none

**wrong coverage** (2)
- API-06: expected covered, got partly – APIs for SME accounting platforms
- RR-01: expected covered, got partly – Data for regulatory reporting (Finanstilsynet, Norges Bank, SSB) with documented calculation rules

**found without right reference** (0)
- none

**split into several rows** (1)
- 2.4: Tender in English, submitted through the portal before the deadline (22 Jan 2027 12:00 CET) → 2 rows

**specialist not flagged** (0)
- none

**planted not found** (0)
- none

**planted not resolved after revision** (0)
- none

## openai: what was missed

**shall not found** (0)
- none

**not found other** (0)
- none

**extra extracted** (0)
- none

**wrong type** (0)
- none

**wrong coverage** (6)
- Q-03: expected covered, got needs_specialist – Sufficient financial capacity
- API-06: expected covered, got partly – APIs for SME accounting platforms
- SEC-06: expected covered, got partly – Documented exit plan
- Q-02: expected covered, got partly – At least two Nordic/EU/EEA bank references within five years
- AI-05: expected covered, got partly – Describe support for the bank's EU AI Act obligations
- 5.9: expected covered, got partly – Start where value is highest and risk lowest, explain why

**found without right reference** (0)
- none

**split into several rows** (2)
- 2.4: Tender valid for six months after the deadline → 2 rows
- 2.4: Tender in English, submitted through the portal before the deadline (22 Jan 2027 12:00 CET) → 2 rows

**specialist not flagged** (0)
- none

**planted not found** (0)
- none

**planted not resolved after revision** (4)
- K043 (unsupported): Support access includes a team outside the EU/EEA unless the paid option is bought (CAP-71).
- K050 (wrong_fact): Standard SLA is 99.9 %; 99.95 % is the premium SLA at extra cost.
- K051 (contradiction): The standard maintenance window is 00:00–04:00.
- K052 (unsupported): Norwegian-speaking support is weekdays 08:00–16:00 only.

## How to read this

The matching between extracted requirements and the answer key is automatic (same reference, best text overlap). A key requirement split into several rows counts as found, and its coverage is the strictest coverage of its rows. Read the lists before trusting a number: a "wrong coverage" can be a judgement call. Changes made after reading results are recorded in eval/LOG.md.
