# RFP Response Assistant

AI support for a bid team from customer insight to a quality-assured draft bid – with people in control at the critical points.

Eight specialised AI agents work in series, and each agent's output is the next one's input. The chain stops at two human checkpoints: after the gap analysis, where product, information security and the commercial lead confirm coverage before any answer is written, and at the end, where the bid manager approves the draft for human quality assurance.

All data is fictional: Morild Bank (buyer) and Nordlys Banking Software (supplier) are invented for this demonstration.

**Live demo:** https://rfp-response-assistant.pages.dev

## The agent chain

| # | Agent | What it does |
|---|---|---|
| 1 | Customer insight | Hypotheses, win themes, priorities and neutral clarification questions from what the buyer has published |
| 2 | Requirement extraction | Every requirement in the RFP – also those in running text – with type, category and owner |
| 3 | Gap analysis | Each requirement checked against the supplier's capability sheet |
| ✋ | **Gate 1: coverage confirmed** | Product, information security and the commercial lead check the gap analysis; the bid manager records the approval |
| 4 | Answer writer | Drafts from documented capabilities only – no evidence, no answer |
| 5 | Red-team reviewer | Reads the drafts as the buyer would and reports problems |
| 6 | Revision agent | Fixes what the findings point to, and hands to a specialist what only a person can resolve |
| 7 | Red-team re-check | Checks the revised answers once more; one round only |
| 8 | Bid summary | Risk register, go/no-go facts and handover note |
| ✋ | **Gate 2: final approval** | The bid manager approves the draft for final human quality assurance |

An approval records who approved, in which role, when, and a fingerprint of what was approved. If the approved result changes, the approval no longer counts.

## Evaluation

The results are measured against an answer key made by hand before the first AI run: 63 requirements (42 shall) and a test set of draft answers with 10 deliberately planted errors. Claude and GPT run on the same documents and prompts. See `eval/REPORT.md` for the numbers and `eval/LOG.md` for what each run showed and what was changed.

## Contents

- `SPEC.md` – the specification (source of truth)
- `source-docs/` – fictional input documents: annual report extract, strategy note, RFP, capability sheet
- `pipeline/` – the agent chain; `pipeline/prompts/` holds one reusable instruction file per agent
- `results/<model>/` – results from each model, including the approvals
- `eval/` – answer key, planted-error test set, evaluation script, report and log
- `skills/` – the same method as three reusable skills for working directly with an AI assistant: customer insight, requirement matrix and gap analysis, answers and review
- `cases/` – one folder per RFP for running the chain on new documents (PDF, Word, Markdown)
- `app/` – static web app in English and Norwegian that shows the results

## Run

Requires Node.js 18 or newer.

```
npm install
copy .env.example .env      (then add your API keys to .env)
node pipeline/run.cjs --model claude
```

The chain stops at Gate 1 and writes `results/claude/gap-review.md` for the people who confirm coverage. Then:

```
node pipeline/approve.cjs coverage --by "<name>" --role "bid manager"
node pipeline/run.cjs --model claude --only answers,redteam,revise,recheck,overview
node pipeline/approve.cjs final --by "<name>" --role "bid manager"
```

Evaluation: `node pipeline/run.cjs --model openai --skip-gates`, then `node eval/evaluate.cjs claude openai`. Gates can only be skipped for tests and evaluation, and the run log records it.

Other options: `--case <name>` runs a case in `cases/` (see `cases/README.md`); `--model mock` runs the demo case without API calls; `--only <steps>` reruns selected agents.

App: `cd app`, `npm install`, `npm run build` (the build reads the results and the evaluation).
