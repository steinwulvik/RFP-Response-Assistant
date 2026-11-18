# SPEC – RFP Response Assistant

Author: Stein Wulvik. This file is the source of truth for the project: the spec is changed first, then the code.

## 1. Purpose

A portfolio pilot that shows how AI can support a solution manager and bid team through an RFP response – from customer insight to a quality-assured draft bid – with people in control of every decision.

It shows, with a working example, what solution and bid work in banking software needs:

| Need | Where the pilot shows it |
|---|---|
| Lead discovery and agree where to focus (value, readiness, pace) | Module 1 – Customer insight and bid strategy |
| Own the solution content of proposals and RFI/RFP responses | Modules 2–4 – RFP analysis, answer drafts, QA |
| Assess feasibility, assumptions and delivery risk with Engineering | Gap analysis and risk register (Module 2 and 5) |
| Make the use of AI, its limits and human responsibilities clear | Agent chain with two human gates, review status on every AI output |
| Develop reusable ways of working for discovery, proposals and bids | Three reusable skills, the prompt files and a pipeline that runs on any RFP (PDF, Word) |
| Assess the quality of AI results | Evaluation with a hand-labelled answer key (section 7) |

## 2. Scenario (all fictional, synthetic data)

- **Customer:** Morild Bank, a fictional Nordic savings bank (same fictional bank as in Bank Resilience Map).
- **Need:** Morild Bank issues an RFP for a modernised **account services and data platform**: real-time account data, account services via APIs (open banking), data products for customer insight, and better data for regulatory reporting.
- **Supplier:** a fictional banking software vendor, *Nordlys Banking Software*, with a short fictional capability sheet. No real company, product or customer is named or imitated.
- **User of the app:** the vendor's Solution Manager and bid team (sales manager, project manager, product owners, information security, commercial lead).

All source documents (annual report extract, strategy note, RFP, capability sheet) are written for this project and labelled as fictional. The RFP follows the structure of the public templates from DFØ (anskaffelser.no) for competition rules and requirement specifications, so it looks like a real Nordic tender.

## 3. Modules

### Module 1 – Customer insight and bid strategy
In an RFP process the supplier cannot run its own discovery meetings: the competition rules forbid contact with the bank's employees, and questions go in writing through the tender portal. Discovery therefore means turning what the bank has published into insight for the bid, and preparing for the solution workshop if the supplier is invited to negotiations.

Input: Morild Bank's annual report extract and strategy note, the RFP and the capability sheet.
AI output (draft):
- Summary of strategy and stated goals, with source references.
- 5–8 hypotheses about business challenges and where the supplier can create value.
- 3–5 win themes tied to stated customer needs and documented capabilities, with the weak spot each must handle honestly.
- Stakeholder map (business, IT, risk/compliance, procurement): what each cares about and where the bid must answer it.
- Written clarification questions for the tender portal – neutral, since they are shared with all suppliers.
- Questions and a 120-minute agenda for the solution workshop, if invited to negotiations.
- Prioritisation matrix: each opportunity scored on **value**, **customer readiness** and **realistic pace of delivery**, with the reasoning shown.

### Module 2 – RFP analysis
Input: the fictional RFP (competition rules, requirement specification, evaluation criteria, contract terms summary).
AI output (draft):
- **Requirement matrix:** ID, requirement text, type (shall/should/information), category, source reference (section/page), linked evaluation criterion, suggested owner role, status.
- Key dates and formal requirements (deadline, format, signature, language).
- **Gap analysis** against the capability sheet: covered / partly covered / not covered / needs specialist.
- Clarification questions to the buyer.

### Module 3 – Answer drafts
- Draft answer per requirement, grounded only in the capability sheet, with a reference to the capability it relies on.
- If there is no supporting evidence, the AI writes no answer and flags **"Needs specialist input"** instead of guessing.

### Module 4 – Red-team review, revision and re-check
- A red-team agent reviews the draft answers against the requirements and evaluation criteria and reports: unanswered shall-requirements, claims without evidence, inconsistencies, unclear language, and answers that do not address the evaluation criterion. It reports – it does not rewrite.
- A revision agent fixes the answers the findings point to, using only the capability sheet. What only a person can resolve (price, contract terms, capabilities the sheet does not document) is handed to a specialist instead of being invented. Each revised answer keeps the original and a one-line change note.
- The red-team agent checks the revised answers once more. One revision round only, so the chain cannot loop; what is still open goes to people.

### Module 5 – Bid overview and handover
- Bid status (requirements covered, open questions, owners), risk register (delivery, commercial, information security) based on the findings still open after revision, go/no-go facts, and a short handover note: solution scope, assumptions and open items for delivery.

### Agent chain and human checkpoints
Eight agents work in series; each one's output is the next one's input, in a fixed JSON format:

1. Customer insight → 2. Requirement extraction → 3. Gap analysis → **Gate 1** → 4. Answer writer → 5. Red-team reviewer → 6. Revision agent → 7. Red-team re-check → 8. Bid summary → **Gate 2**

- **Gate 1 – coverage confirmed.** Errors travel down a chain: a wrong gap analysis gives confident but wrong answers. The chain therefore stops after the gap analysis until product, information security and the commercial lead have checked coverage and the bid manager has recorded the approval.
- **Gate 2 – final approval.** The chain ends with a draft bid, never a finished one. The bid manager approves it for final human quality assurance.
- An approval records who, in which role, when, and a fingerprint of what was approved. If the approved result changes, the approval no longer counts.
- Gates can only be skipped with an explicit option for tests and evaluation, and the run log records it.

### Human control (all modules)
- Every AI output has a review status: **AI draft → Reviewed → Approved**, and an owner role. The AI can never set "Approved".
- The app shows the agent chain and the gates, which content is AI-generated and which is reviewed, and a "How AI is used" page: what the AI does, its limits, and what people are responsible for.

## 4. Architecture

```
source-docs/ (demo case, fictional)   cases/<name>/ (any RFP: PDF, Word, Markdown)
      │
pipeline/ (agent chain, runs locally with API keys in .env)
  one prompt file per agent → model calls → JSON results
  approve.cjs records human approvals at the gates
      │
eval/ (answer key, planted-error test set, evaluate.cjs, REPORT.md)
      │
app/ (static web app, reads the JSON results; no AI calls, no keys)
      → Cloudflare Pages
```

- **Pipeline:** Node.js, model calls with built-in fetch, model-agnostic: Claude as default and one OpenAI model for comparison. Two small libraries read PDF and Word files. Structured JSON output per agent. Long RFPs are read in parts and merged. A mock mode (`--model mock`) builds results from the answer key to test the chain and the evaluation without API calls. Keys only in `.env`, never in code or GitHub.
- **App:** React + TypeScript, same set-up as Bank Resilience Map 2.0. English and Norwegian (switch in the header). Static hosting on Cloudflare Pages.
- **Reusable method:** the prompt files are reusable instructions (role, inputs, output schema, rules such as "no evidence – no answer"). The same method is packaged as three skills (`skills/`) for working directly with an AI assistant: customer insight, requirement matrix and gap analysis, answers and review.

## 5. Screens

1. **Overview** – the case, the agent chain with the two human gates, the bid team, and where to start.
2. **Customer insight** – strategy summary, hypotheses, win themes, stakeholder map, priorities, clarification questions and solution workshop preparation.
3. **Requirements** – filterable requirement matrix (type, category, owner, coverage, status), key dates, clarification questions.
4. **Answers** – requirement and answer side by side, evidence, review status; revised answers show the original and what the revision agent changed.
5. **Quality check** – red-team findings with severity, what the revision agent did with each, and what the re-check still reports.
6. **Bid overview** – coverage numbers, open items per owner, risk register, go/no-go facts, handover note and the status of the human gates.
7. **How AI is used / Evaluation** – method, limits, human responsibilities and the evaluation results (section 7).
8. **Source documents** – the fictional input documents, readable in the app.

## 6. Non-goals

- No live AI calls or file upload in the published demo.
- No real customers, banks, vendors or tender documents.
- No pricing engine; commercial content is limited to the risk register and assumptions.
- Not a production tool; it is a demonstration of method and judgement.

## 7. Evaluation

Answer key, made by hand before the pipeline is run:
- All requirements in the RFP with correct type, category, expected coverage against the capability sheet and owner role (`eval/answer-key-requirements.json`: 63 requirements – 42 shall, 20 should, 1 information request; 48 covered, 8 partly covered, 7 needing specialist input). About a third of the requirements are written in running text without an ID, as in real tenders.
- 10 deliberately planted errors in a set of 26 draft answers (`eval/planted-answers.json`, key in `eval/planted-errors.json`): missing shall-requirement, unsupported claims, contradiction, wrong numbers and deadline, non-responsive answer.

Metrics (computed by `eval/evaluate.cjs`, no extra dependencies; the method is the same as in a Promptfoo set-up – fixed test cases, deterministic checks and thresholds):

| Metric | Target |
|---|---|
| Recall of shall-requirements in the matrix | ≥ 95 % |
| Precision of extracted requirements | ≥ 90 % |
| Correct type (shall/should) | ≥ 95 % |
| Answers with a correct evidence reference | ≥ 90 % |
| "Needs specialist input" used where the capability sheet has no evidence | 100 % |
| Planted errors found by the red-team step | ≥ 80 % |
| Planted errors resolved by the revision agent (changed, and the re-check no longer reports them) | ≥ 80 % |

Results, including misses, are shown on the Evaluation screen and in `eval/REPORT.md`. Every change to the answer key, test set, evaluation or prompts made after reading results is recorded in `eval/LOG.md`. A requirement the model splits into several rows counts as found once, with the strictest coverage of its rows. Both models are compared on the same answer key.

## 8. Quality

- A shared test pack checks all screens in five widths and both languages, accessibility with axe (WCAG 2.2 AA), print, robustness against broken storage and unknown links, and user flows.
- Only fictional data, no real company names or personal data, no keys in the repository.

## 9. Decisions

- Pipeline in Node.js, the same language as the app.
- Scenario limited to Norway.
- Claude as the default model; GPT-6 Luna as the comparison model.
