// Test provider: returns answers built from the hand-made answer key, so the pipeline and the
// evaluation can be tested end to end without API keys or cost. Never used for published results.
'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function makeMock(root) {
  const key = JSON.parse(fs.readFileSync(path.join(root, 'eval/answer-key-requirements.json'), 'utf8')).requirements;
  const planted = JSON.parse(fs.readFileSync(path.join(root, 'eval/planted-errors.json'), 'utf8')).errors;

  return async ({ step, data }) => {
    let out;
    if (step === 'discovery') {
      out = { strategy_summary: [{ point: 'Mock point', source: 'Mock' }], hypotheses: [], win_themes: [], stakeholders: [], clarification_questions: [], workshop_questions: [], workshop_agenda: [], priorities: [] };
    } else if (step === 'requirements') {
      out = {
        requirements: key.map((r, i) => ({ id: `R${String(i + 1).padStart(3, '0')}`, rfp_ref: r.rfp_ref, text: r.summary, type: r.type, category: r.category, owner_role: r.owner_role })),
        key_dates: [{ date: '22 January 2027, 12:00 CET', event: 'Tender deadline' }],
        clarification_questions: [],
      };
    } else if (step === 'gap') {
      out = { gaps: data.requirements.map((r) => { const k = key[Number(r.id.slice(1)) - 1]; return { id: r.id, coverage: k.expected_coverage, evidence: k.evidence, gap_note: '' }; }) };
    } else if (step === 'answers') {
      out = { answers: data.requirements.map((r) => ({ id: r.id, answer: r.coverage === 'needs_specialist' ? '' : 'Met. (mock)', evidence: r.evidence || [], needs_specialist: r.coverage === 'needs_specialist', note: '' })) };
    } else if (step === 'redteam') {
      out = { findings: data.planted ? planted.map((e) => ({ ids: [e.id], kind: e.kind, severity: 'high', finding: e.explanation, suggestion: '' })) : [] };
    } else if (step === 'revise') {
      out = { revised: data.answers.map((a) => ({ id: a.id, answer: 'Partly met. (mock revision)', evidence: a.evidence || [], needs_specialist: false, note: '', change_note: 'Mock change.' })) };
    } else if (step === 'overview') {
      out = { risks: [], handover: { scope: [], assumptions: [], open_items: [] }, go_no_go_facts: [] };
    }
    return { text: JSON.stringify(out), usage: { input: 0, output: 0 } };
  };
};
