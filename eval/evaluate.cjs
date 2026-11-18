#!/usr/bin/env node
// Compares pipeline results with the hand-made answer key and writes eval/results-<model>.json
// and eval/REPORT.md (all evaluated models side by side).
//
// Usage: node eval/evaluate.cjs claude openai
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const key = readJson('eval/answer-key-requirements.json').requirements;
const planted = readJson('eval/planted-errors.json').errors;
const TARGETS = { reference_kept: 0.95, planted_resolved: 0.8,  recall_shall: 0.95, precision: 0.9, type_accuracy: 0.95, evidence_accuracy: 0.9, specialist_flag_rate: 1, planted_detection: 0.8 };

const normRef = (ref) => {
  const s = String(ref || '').toUpperCase();
  const id = s.match(/\b(Q|AS|API|DP|RR|AI|SEC)-\d{2}\b/);
  if (id) return id[0];
  const num = s.match(/\b\d+(\.\d+)?\b/);
  return num ? num[0] : s.trim();
};
const STOP = new Set('the a an and or of to in for with be is are shall should must all any its it by on as at from per each this that can not no'.split(' '));
const words = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9æøå% ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const sim = (a, b) => { const A = words(a), B = words(b); let n = 0; for (const w of A) if (B.has(w)) n++; return n / Math.max(1, Math.min(A.size, B.size)); };

function match(extracted) {
  // 1) Pair each key requirement with its best extracted requirement (same reference, best text overlap).
  // 2) Extracted requirements that split one key requirement into several rows are linked to it as "splits".
  const pairs = [];
  for (const e of extracted) for (const k of key) {
    if (normRef(e.rfp_ref) !== normRef(k.rfp_ref)) continue;
    const isId = /-/.test(normRef(k.rfp_ref));
    const score = isId ? 1 + sim(e.text, k.summary) : sim(e.text, k.summary);
    if (isId || score >= 0.2) pairs.push({ e, k, score });
  }
  pairs.sort((a, b) => b.score - a.score);
  const usedE = new Set(), usedK = new Set(), out = [];
  for (const p of pairs) {
    if (usedE.has(p.e.id) || usedK.has(p.k.key_id)) continue;
    usedE.add(p.e.id); usedK.add(p.k.key_id); out.push({ ...p, splits: [] });
  }
  for (const p of pairs) {
    if (usedE.has(p.e.id)) continue;
    const primary = out.find((o) => o.k.key_id === p.k.key_id);
    if (primary) { primary.splits.push(p.e); usedE.add(p.e.id); }
  }
  // 3) Rows with a wrong or missing reference (for example section "3" instead of "Q-01") are matched on text alone,
  //    and reported as found without the right reference.
  const loose = [];
  for (const e of extracted) for (const k of key) {
    if (usedE.has(e.id) || usedK.has(k.key_id)) continue;
    const score = sim(e.text, k.summary);
    if (score >= 0.45) loose.push({ e, k, score });
  }
  loose.sort((a, b) => b.score - a.score);
  for (const p of loose) {
    if (usedE.has(p.e.id) || usedK.has(p.k.key_id)) continue;
    usedE.add(p.e.id); usedK.add(p.k.key_id); out.push({ ...p, splits: [], wrongRef: true });
  }
  return out;
}

// Strictest coverage across a requirement and its splits (a split that is only partly met makes the whole partly met).
const STRICT = { covered: 0, partly: 1, needs_specialist: 2, not_covered: 3 };
const strictest = (list) => list.filter(Boolean).sort((a, b) => (STRICT[b] ?? -1) - (STRICT[a] ?? -1))[0];

const pct = (n, d) => (d ? n / d : null);
const fmt = (v) => (v == null ? '–' : `${Math.round(v * 1000) / 10} %`);

function evaluate(model) {
  const dir = `results/${model}`;
  const reqs = readJson(`${dir}/requirements.json`).requirements;
  const gaps = Object.fromEntries(readJson(`${dir}/gaps.json`).gaps.map((g) => [g.id, g]));
  const answers = Object.fromEntries(readJson(`${dir}/answers.json`).answers.map((a) => [a.id, a]));
  const pairs = match(reqs);
  const byKey = Object.fromEntries(pairs.map((p) => [p.k.key_id, p.e]));

  const shall = key.filter((k) => k.type === 'shall');
  const missedShall = shall.filter((k) => !byKey[k.key_id]);
  const typeOk = pairs.filter((p) => p.e.type === p.k.type);
  const cov = (p) => strictest([p.e, ...p.splits].map((x) => gaps[x.id]?.coverage));
  const covOk = pairs.filter((p) => cov(p) === p.k.expected_coverage);
  const splitCount = pairs.reduce((n, p) => n + p.splits.length, 0);

  const withEvidence = pairs.filter((p) => p.k.evidence.length && answers[p.e.id] && !answers[p.e.id].needs_specialist && answers[p.e.id].answer);
  const evidenceOk = withEvidence.filter((p) => (answers[p.e.id].evidence || []).some((c) => p.k.evidence.includes(c)));
  const specialistKeys = pairs.filter((p) => p.k.expected_coverage === 'needs_specialist');
  const flagged = specialistKeys.filter((p) => [p.e, ...p.splits].some((x) => answers[x.id]?.needs_specialist));

  const test = readJson(`${dir}/redteam-planted-test.json`).findings || [];
  const found = planted.filter((err) => test.some((f) => (f.ids || []).includes(err.id)));
  const plantedIds = new Set(planted.map((e) => e.id));
  const falseAlarms = test.filter((f) => !(f.ids || []).some((id) => plantedIds.has(id)));

  // Revision agent: a planted error is resolved when the answer was changed (or handed to a specialist)
  // and the red-team re-check no longer reports it.
  const hasRevision = fs.existsSync(path.join(ROOT, dir, 'redteam-planted-recheck.json'));
  let resolved = null, notResolved = [];
  if (hasRevision) {
    const recheck = readJson(`${dir}/redteam-planted-recheck.json`).findings || [];
    const revised = Object.fromEntries(readJson(`${dir}/planted-revised.json`).answers.map((a) => [a.id, a]));
    const ok = planted.filter((err) => {
      const a = revised[err.id];
      const changed = a && (a.revised || a.needs_specialist);
      return changed && !recheck.some((f) => (f.ids || []).includes(err.id));
    });
    resolved = pct(ok.length, planted.length);
    notResolved = planted.filter((e) => !ok.includes(e)).map((e) => `${e.id} (${e.kind}): ${e.explanation}`);
  }

  const res = {
    model,
    extracted: reqs.length,
    matched: pairs.length,
    splits: splitCount,
    metrics: {
      recall_shall: pct(shall.length - missedShall.length, shall.length),
      recall_all: pct(pairs.length, key.length),
      precision: pct(pairs.length + splitCount, reqs.length),
      reference_kept: pct(pairs.filter((p) => !p.wrongRef).length, pairs.length),
      type_accuracy: pct(typeOk.length, pairs.length),
      coverage_accuracy: pct(covOk.length, pairs.length),
      evidence_accuracy: pct(evidenceOk.length, withEvidence.length),
      specialist_flag_rate: pct(flagged.length, specialistKeys.length),
      planted_detection: pct(found.length, planted.length),
      planted_resolved: resolved,
    },
    red_team_false_alarms: falseAlarms.length,
    misses: {
      shall_not_found: missedShall.map((k) => `${k.key_id} ${k.rfp_ref}: ${k.summary}`),
      not_found_other: key.filter((k) => k.type !== 'shall' && !byKey[k.key_id]).map((k) => `${k.key_id} ${k.rfp_ref}: ${k.summary}`),
      extra_extracted: reqs.filter((e) => !pairs.some((p) => p.e.id === e.id || p.splits.some((x) => x.id === e.id))).map((e) => `${e.id} ${e.rfp_ref}: ${e.text}`),
      wrong_type: pairs.filter((p) => p.e.type !== p.k.type).map((p) => `${p.k.rfp_ref}: expected ${p.k.type}, got ${p.e.type} – ${p.k.summary}`),
      wrong_coverage: pairs.filter((p) => cov(p) !== p.k.expected_coverage).map((p) => `${p.k.rfp_ref}: expected ${p.k.expected_coverage}, got ${cov(p)} – ${p.k.summary}`),
      found_without_right_reference: pairs.filter((p) => p.wrongRef).map((p) => `${p.k.rfp_ref} given as "${p.e.rfp_ref}": ${p.k.summary}`),
      split_into_several_rows: pairs.filter((p) => p.splits.length).map((p) => `${p.k.rfp_ref}: ${p.k.summary} → ${p.splits.length + 1} rows`),
      specialist_not_flagged: specialistKeys.filter((p) => ![p.e, ...p.splits].some((x) => answers[x.id]?.needs_specialist)).map((p) => `${p.k.rfp_ref}: ${p.k.summary}`),
      planted_not_found: planted.filter((e) => !found.includes(e)).map((e) => `${e.id} (${e.kind}): ${e.explanation}`),
      planted_not_resolved_after_revision: notResolved,
    },
  };
  fs.writeFileSync(path.join(__dirname, `results-${model}.json`), JSON.stringify(res, null, 2) + '\n');
  return res;
}

const models = process.argv.slice(2).length ? process.argv.slice(2) : ['claude'];
const all = models.map(evaluate);

const rows = [
  ['Recall of shall-requirements', 'recall_shall'], ['Recall of all requirements', 'recall_all'], ['Precision (extracted rows that are real requirements)', 'precision'], ['Requirement ID or section kept (traceability)', 'reference_kept'],
  ['Correct type (shall/should/info)', 'type_accuracy'], ['Correct coverage in gap analysis', 'coverage_accuracy'],
  ['Answers with a correct evidence reference', 'evidence_accuracy'], ['"Needs specialist input" where expected', 'specialist_flag_rate'],
  ['Planted errors found by red-team', 'planted_detection'],
  ['Planted errors resolved by the revision agent (re-check clean)', 'planted_resolved'],
];
let md = `# Evaluation report\n\nGenerated ${new Date().toISOString().slice(0, 10)}. Answer key: ${key.length} requirements (${key.filter((k) => k.type === 'shall').length} shall), ${planted.length} planted errors. All data is fictional.\n\n`;
md += `| Metric | Target | ${all.map((r) => r.model).join(' | ')} |\n|---|---|${all.map(() => '---').join('|')}|\n`;
for (const [label, k] of rows) md += `| ${label} | ${TARGETS[k] != null ? fmt(TARGETS[k]) : '–'} | ${all.map((r) => fmt(r.metrics[k])).join(' | ')} |\n`;
md += `| Rows extracted / requirements matched / extra rows from splitting | – | ${all.map((r) => `${r.extracted} / ${r.matched} / ${r.splits}`).join(' | ')} |\n`;
md += `| Red-team findings outside the planted errors (read them – they can be real) | – | ${all.map((r) => r.red_team_false_alarms).join(' | ')} |\n`;
for (const r of all) {
  md += `\n## ${r.model}: what was missed\n`;
  for (const [k, list] of Object.entries(r.misses)) md += `\n**${k.replace(/_/g, ' ')}** (${list.length})\n${list.length ? list.map((x) => `- ${x}`).join('\n') : '- none'}\n`;
}
md += `\n## How to read this\n\nThe matching between extracted requirements and the answer key is automatic (same reference, best text overlap). A key requirement split into several rows counts as found, and its coverage is the strictest coverage of its rows. Read the lists before trusting a number: a "wrong coverage" can be a judgement call. Changes made after reading results are recorded in eval/LOG.md.\n`;
fs.writeFileSync(path.join(__dirname, 'REPORT.md'), md);
console.log(md.split('\n## ')[0]);
