# Evaluation log

What was learned from each run, and what was changed. Changes to the answer key, test set, evaluation or prompts are always recorded here, so the numbers can be trusted.

## Run 1 – 18 November 2026 (Claude Sonnet 5.5 and GPT-6 Luna)

**Result:** Both models found all 41 shall-requirements, set the right type on every requirement, used "needs specialist input" in every case it was expected, and found all 10 planted errors. The first report showed low precision (86 % and 64 %) and some wrong coverage. Reading the details showed that most of this came from the measurement, not from the models.

**What reading the results showed**

1. **The evaluation punished sensible splitting.** The prompt asks the model to split a sentence with two obligations into two rows (for example "log all API calls" and "keep the logs five years"). The evaluation only allowed one row per requirement in the answer key, so every split counted as a wrong extra row. GPT split much more than Claude (32 extra rows against 8), which explained most of its low precision.
2. **A split could hide a correct judgement.** For maintenance (01:00–05:00, announced 14 days ahead), both models correctly found that the window starts one hour too early. But the evaluation compared the key with the "14 days" row, which is covered, and reported the gap analysis as wrong.
3. **The answer key had two errors.**
   - A shall-requirement in section 2.3 (all questions in writing through the tender portal) was missing. Both models found it.
   - "Each phase can be taken into use on its own" was marked as covered, but the capability sheet does not say so. GPT and the red-team step pointed this out.
4. **The "clean" test answers were not clean.** In the planted-error test, the red-team step reported three answers that I had written as correct. All three findings were right: one answer promised that "all channels" are updated within two seconds (the capability sheet only covers the platform), one did not say that the adviser summary is still a pilot, and one promised that each phase can be used on its own.
5. **A real miss in both models.** "Support in English and Norwegian, 24/7 for critical incidents": both models split the sentence and judged each part on its own (English 24/7: yes; Norwegian: yes), and missed that Norwegian support is only on weekdays. The requirement can be read in two ways, which is a good clarification question to the buyer.
6. **Model profiles.** Claude was closer to the key in the gap analysis (97 % against 81 %). GPT was more cautious: it more often chose "partly" or "needs specialist input". Several of its choices can be defended (for example the exit plan and the event types), but it also downgraded clear matches such as financial capacity, where the capability sheet confirms audited accounts.

**Changes made after run 1**

- Evaluation: a key requirement that is split into several rows counts as found once, the extra rows count as valid, and its coverage is the strictest coverage of its rows. The number of split rows is reported.
- Answer key: added the 2.3 requirement (now 63 requirements, 42 shall); changed "each phase usable on its own" to partly covered. Both changes are marked with a review note in the key.
- Test set: corrected the three overclaiming answers (K019, K040, K055).
- Prompts: the requirement prompt keeps conditions that apply together in one row; the gap prompt judges combined conditions as a whole and chooses the stricter reading when a requirement is ambiguous.

With the new evaluation, run 1 gives a precision of 99 % (Claude) and 98 % (GPT). Run 2 tests the changed prompts.

## Run 2 – 18 November 2026 (same models, changed prompts)

**Result:** Claude found all 63 requirements with no wrong rows, kept every reference, and the "support in English and Norwegian, 24/7" gap was now found by both models. Both models found all 10 planted errors again.

**What reading the results showed**

1. **GPT did not keep the qualification IDs.** It gave the four qualification requirements the section number "3" instead of Q-01 to Q-04. The first report showed this as four missed shall-requirements. The requirements were found; the traceability was lost. A requirement matrix without the buyer's IDs is harder to use, so this is now measured on its own line.
2. **The "stricter reading" rule made both models more cautious.** Both now mark "real-time in all channels within two seconds" as partly met, because the capability sheet covers the platform, not the channels. This is right, and it is the same point the red-team made in run 1, so the key was changed. Claude also became stricter on two requirements where the key says covered (financial capacity and regulatory reporting data); these are kept as misses.
3. **The PSD3/PSR requirement is still marked covered by both models**, although the capability sheet only has a roadmap item. The red-team step catches it in the answers ("the answer gives no plan"), which shows why the review step is needed.
4. **Two control answers were ambiguous.** The red-team flagged the corrected control answers for "real-time in all channels" and "each phase usable on its own" again, now as not answering the requirement clearly. Both requirements are ambiguous against the capability sheet, so no answer to them works as a clean control.

**Changes made after run 2**

- Evaluation: rows with a wrong reference are matched on text alone and reported on a new line, "Requirement ID or section kept (traceability)".
- Answer key: "real-time in all channels within two seconds" changed to partly covered (review note in the key).
- Test set: removed the two ambiguous control answers (K019, K055); the set now has 24 answers with 10 planted errors.

## Run 3 – 18 November 2026 (agent chain with revision agent and human gates)

**What changed before the run:** the chain was extended to eight agents – a revision agent fixes the answers the red-team points to, and the red-team checks the revised answers once more. Two human gates were added: coverage confirmed after the gap analysis, and final approval of the draft. Claude ran with both gates (approved by the bid manager); GPT ran with gates skipped, because it is only used for comparison.

**Result:** Both models found all 63 requirements with the right type and reference, used "needs specialist input" in every expected case, and found all 10 planted errors. Claude was closer to the key in the gap analysis (97 % against 91 %).

**What reading the results showed**

1. **The revision agent did not invent fixes.** On the real bid, Claude's red-team reported 5 problems; the revision agent changed 10 answers, and where the problem was a business decision – paid options, the service level, the maintenance window, Norwegian support – it handed the answer to a specialist and wrote a concrete list of deviations for the reservations list instead of promising more.
2. **What is left after revision is for people.** Claude's re-check still reports 3 problems, the most important being that several shall-requirements are only met with paid options or deviations, which can lead to rejection. Whether to price the options in or list them as reservations is a decision for the bid team and management – which is what the final gate is for.
3. **The models differ in how strict the re-check is.** Claude's revision agent resolved all 10 planted errors. GPT's revision agent corrected the facts in all ten, but its re-check still reported four of them as "unclear", because the answers do not commit to the paid option or the required service level. The revision handled them correctly by handing the decision to a specialist; the difference is that GPT's reviewer wants a commitment that only people can give. Measured strictly ("re-check clean"), GPT resolves 60 %.
4. **The control answers are still not perfect.** In the planted test, the re-check found weaknesses in two answers written as clean controls (data quality "for each data product", and a migration answer without detail). They are not counted as planted errors.
5. **A long answer was cut off.** The first attempt of this run stopped because the customer insight answer exceeded the output limit and became invalid JSON. The pipeline now raises the limit when an answer is cut off, streams long answers, and keeps failed raw answers for inspection.
