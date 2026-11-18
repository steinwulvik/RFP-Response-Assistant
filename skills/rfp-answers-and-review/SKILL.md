---
name: rfp-answers-and-review
description: Use when the user wants draft answers to RFP or tender requirements, a red-team or quality review of a bid, a bid risk register, go/no-go facts or a handover note from bid to delivery.
---

# RFP answer drafts, red-team review and bid overview

Drafts answers from documented capabilities only, has a critical second review find overclaims and gaps before the buyer does, and summarises risks and handover for the bid team and the delivery team.

Everything produced is an **AI draft** with a named owner. The AI never approves.

## Communication

- Talk to the user in the language they write in. Write answers in the language of the RFP.

## Before you start

1. **Inputs.** You need the requirements (ideally the matrix from the requirement matrix skill, with coverage) and the supplier's capability source. Ask for what is missing. For the review, you need the draft answers.
2. **Confidentiality.** For a real customer's RFP or internal material, confirm that this environment is approved or that names are anonymised.

## Step 1 – Answer drafts

- **No evidence – no answer.** Use only facts from the capability source. If coverage is "needs specialist" or nothing supports an answer, leave the answer empty, mark **Needs specialist input** and say who must provide what.
- Start with the compliance status: **Met.**, **Partly met.** or **Not met.** Then 2–4 short sentences on how, written to the buyer.
- For partly met: be honest about the gap and say what the supplier offers instead. Never hide a gap.
- Reference the evidence for every factual claim.
- Answer what the requirement and its award criterion ask. Plain, concrete language; no marketing words.
- Prices, signatures, named persons, reservations and contract terms are always left to people.

## Step 2 – Red-team review

Read the draft answers as the buyer's evaluation team would. Report – do not rewrite or approve.

Look for:
- **missing** – a shall-requirement without an answer or specialist flag,
- **unsupported** – a claim the capability source does not support, or "met" where it is only partly met,
- **contradiction** – answers that disagree with each other or with the source (numbers, time windows, locations),
- **wrong fact** – wrong number, date, deadline or name,
- **not responsive** – does not answer what the requirement or award criterion asks,
- **unclear** – wording an evaluator could misread.

Each finding: requirement ID(s), kind, severity (high: could lead to rejection or a broken promise; medium: loses points; low: wording), the problem in one sentence, and a suggestion. No style preferences.

## Step 3 – Bid overview and handover

- **Risk register:** delivery, commercial, information security and compliance risks, each tied to a requirement, gap or finding, with likelihood, impact, mitigation and owner role.
- **Go/no-go facts:** the facts the bid team should weigh – without making the decision.
- **Handover note:** proposed solution scope, main assumptions, and open items the delivery team must know about.

## Output

- Answer drafts as a spreadsheet or table: ID | Requirement | Answer | Evidence | Needs specialist | Note | Owner | Status (AI draft).
- Red-team findings sorted by severity.
- Risk register as a table; go/no-go facts and handover as short lists.
- End with what the team must review first: high-severity findings and shall-requirements that are not fully met.
