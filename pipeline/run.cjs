#!/usr/bin/env node
// RFP Response Assistant – pipeline.
// Runs the AI steps on a case and writes JSON results.
//
// Usage (from the project folder):
//   node pipeline/run.cjs --model claude                     demo case (source-docs/), results/<model>/
//   node pipeline/run.cjs --model claude --case my-rfp       cases/my-rfp/, results/my-rfp/<model>/
//   node pipeline/run.cjs --model claude --only discovery,requirements
// Models: claude, openai, mock (mock needs no API key and works on the demo case only).
'use strict';
const fs = require('fs');
const path = require('path');
const { readEnv, parseJson, writeJson, chunk } = require('./lib/util.cjs');
const { loadCase, splitText } = require('./lib/documents.cjs');
const { checkGate } = require('./lib/gates.cjs');
const { makeProvider } = require('./lib/providers.cjs');
const makeMock = require('./lib/mock.cjs');

const ROOT = path.resolve(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const modelName = arg('model', 'claude');
const only = arg('only', '') ? arg('only', '').split(',') : null;
const caseName = arg('case', '');
const runs = (step) => !only || only.includes(step);

const isMock = modelName === 'mock';
const modelCfg = isMock ? { provider: 'mock', model: 'mock' } : cfg.models[modelName];
if (!modelCfg) { console.error(`Unknown model "${modelName}". Use: ${Object.keys(cfg.models).join(', ')}, mock`); process.exit(1); }

const env = readEnv(path.resolve(ROOT, cfg.envFile));
const provider = isMock ? null : makeProvider(modelCfg, env);
const mock = isMock ? makeMock(ROOT) : null;
if (isMock && caseName) { console.error('The mock model only works on the demo case.'); process.exit(1); }
const outRel = caseName ? path.join('results', caseName, modelName) : path.join('results', modelName);
const outDir = path.join(ROOT, outRel);
const prompt = (name) => fs.readFileSync(path.join(__dirname, 'prompts', `${name}.md`), 'utf8');
let docs; // filled in main(): { customer, rfp, capabilities } as text blocks
const log = { model: modelCfg.model, started: new Date().toISOString(), steps: [] };

async function ask(step, system, user, data = {}, maxTokens = 32000) {
  const t0 = Date.now();
  let lastErr;
  let tokens = maxTokens;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const u = attempt === 1 ? user : `${user}\n\nYour previous answer was not valid JSON${lastErr?.cut ? ' because it was cut off – keep every text field short' : ''}. Return only the JSON object.`;
    const res = isMock ? await mock({ step, data }) : await provider({ system, user: u, maxTokens: tokens });
    try {
      const json = parseJson(res.text);
      log.steps.push({ step, attempt, seconds: (Date.now() - t0) / 1000, tokens: res.usage });
      return json;
    } catch (e) {
      // Keep the raw answer so a failure can be inspected.
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `failed-${step}-${attempt}.txt`), res.text || '');
      lastErr = e;
      lastErr.cut = res.stop === 'length';
      console.log(`  ${step}: answer ${attempt} was not valid JSON${lastErr.cut ? ' (cut off at the output limit)' : ''} – trying again`);
      if (lastErr.cut) tokens = Math.min(tokens * 2, 64000);
    }
  }
  throw new Error(`${step}: ${lastErr.message}${lastErr.cut ? ' (the answer was cut off at the output limit)' : ''}`);
}

const load = (name) => JSON.parse(fs.readFileSync(path.join(outDir, `${name}.json`), 'utf8'));
const save = (name, data) => { writeJson(path.join(outDir, `${name}.json`), data); console.log(`  saved ${outRel}/${name}.json`); };
const review = (owner_role) => ({ status: 'ai_draft', owner_role, reviewed_by: null });
const skipGates = args.includes('--skip-gates');
const caseArgs = `${caseName ? ` --case ${caseName}` : ''}${modelName !== 'claude' ? ` --model ${modelName}` : ''}`;
const slimReqs = () => load('requirements').requirements.map(({ id, rfp_ref, text, type }) => ({ id, rfp_ref, text, type }));
const slimAnswers = (list) => list.map(({ id, answer, evidence, needs_specialist }) => ({ id, answer, evidence, needs_specialist }));
const redteamInput = (reqs, answers) => `Requirements:\n${JSON.stringify(reqs, null, 1)}\n\nDraft answers:\n${JSON.stringify(answers, null, 1)}\n\n${docs.capabilities}`;
async function revise(reqs, answers, findings) {
  const ids = new Set(findings.flatMap((f) => f.ids || []));
  if (!ids.size) return [];
  const affected = answers.filter((a) => ids.has(a.id)).map(({ id, answer, evidence, needs_specialist, note }) => ({ id, answer, evidence, needs_specialist, note }));
  const r = await ask('revise', prompt('revise'), `Requirements:\n${JSON.stringify(reqs.filter((q) => ids.has(q.id)), null, 1)}\n\nDraft answers:\n${JSON.stringify(affected, null, 1)}\n\nRed-team findings:\n${JSON.stringify(findings, null, 1)}\n\n${docs.capabilities}`, { findings, answers: affected });
  return r.revised || [];
}

async function main() {
  console.log(`Model: ${modelName} (${modelCfg.model})${caseName ? `, case: ${caseName}` : ''}`);
  docs = await loadCase(ROOT, cfg, caseName);

  if (runs('discovery')) {
    console.log('Agent 1 – Customer insight and bid strategy');
    const r = await ask('discovery', prompt('discovery'), `${docs.customer}\n\n${docs.rfp}\n\n${docs.capabilities}`);
    save('discovery', { ...r, review: review('sales') });
  }

  if (runs('requirements')) {
    console.log('Agent 2 – Requirement extraction');
    // Long RFPs are read in parts (split at headings) and merged, so no requirement is lost to output limits.
    const parts = splitText(docs.rfp, 60000);
    const r = { requirements: [], key_dates: [], clarification_questions: [] };
    for (const [i, part] of parts.entries()) {
      if (parts.length > 1) console.log(`  part ${i + 1}/${parts.length}`);
      const note = parts.length > 1 ? `\n\nThis is part ${i + 1} of ${parts.length} of the RFP. Extract requirements from this part only.` : '';
      const x = await ask('requirements', prompt('requirements'), part + note);
      r.requirements.push(...x.requirements);
      r.key_dates.push(...(x.key_dates || []));
      r.clarification_questions.push(...(x.clarification_questions || []));
    }
    r.requirements = r.requirements.map((q, i) => ({ ...q, id: `R${String(i + 1).padStart(3, '0')}`, review: review(q.owner_role) }));
    save('requirements', r);
  }

  if (runs('gap')) {
    console.log('Agent 3 – Gap analysis');
    const reqs = load('requirements').requirements;
    const gaps = [];
    for (const batch of chunk(reqs, 25)) {
      const slim = batch.map(({ id, rfp_ref, text, type }) => ({ id, rfp_ref, text, type }));
      const r = await ask('gap', prompt('gap'), `Requirements:\n${JSON.stringify(slim, null, 1)}\n\n${docs.capabilities}`, { requirements: batch });
      gaps.push(...r.gaps);
    }
    save('gaps', { gaps });
  }


  if (runs('answers') && !skipGates) {
    const gate = checkGate(outDir, 'coverage');
    if (!gate.ok) {
      writeGapReview();
      console.log(`\nGate 1 – Coverage confirmation. ${gate.reason}\n  Product, information security and the commercial lead check the gap analysis in ${outRel}/gap-review.md.\n  When it is confirmed, the bid manager records it and the next agents can run:\n  node pipeline/approve.cjs coverage --by "<name>" --role "bid manager"${caseArgs}\n  Then: node pipeline/run.cjs${caseArgs} --only answers,redteam,revise,recheck,overview`);
      return finish();
    }
    console.log(`Gate 1 passed: coverage confirmed by ${gate.by} (${gate.role}), ${gate.at}`);
  }
  if (skipGates) { log.gates_skipped = true; console.log('Human gates skipped (--skip-gates): use only for tests and evaluation.'); }

  if (runs('answers')) {
    console.log('Agent 4 – Answer writer');
    const reqs = load('requirements').requirements;
    const gaps = Object.fromEntries(load('gaps').gaps.map((g) => [g.id, g]));
    const merged = reqs.map(({ id, rfp_ref, text, type, owner_role }) => ({ id, rfp_ref, text, type, owner_role, coverage: gaps[id]?.coverage, evidence: gaps[id]?.evidence }));
    const answers = [];
    for (const batch of chunk(merged, cfg.answerBatchSize)) {
      const r = await ask('answers', prompt('answers'), `Requirements:\n${JSON.stringify(batch, null, 1)}\n\n${docs.capabilities}`, { requirements: batch });
      answers.push(...r.answers.map((a) => ({ ...a, review: review(batch.find((b) => b.id === a.id)?.owner_role || 'bid') })));
    }
    save('answers', { answers });
  }

  if (runs('redteam')) {
    console.log('Agent 5 – Red-team reviewer (own answers, and the planted-error test set)');
    const own = await ask('redteam', prompt('redteam'), redteamInput(slimReqs(), slimAnswers(load('answers').answers)), { planted: false });
    save('redteam', own);
    if (!caseName) {
      const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval/planted-answers.json'), 'utf8'));
      save('redteam-planted-test', await ask('redteam', prompt('redteam'), redteamInput(p.requirements, p.answers), { planted: true }));
    }
  }

  if (runs('revise')) {
    console.log('Agent 6 – Revision agent');
    const answers = load('answers').answers;
    const findings = load('redteam').findings;
    const revised = await revise(slimReqs(), answers, findings);
    const final = answers.map((a) => {
      const r = revised.find((x) => x.id === a.id);
      return r ? { ...a, ...r, revised: true, original_answer: a.answer, review: { ...a.review, status: 'ai_draft' } } : { ...a, revised: false };
    });
    save('answers-final', { answers: final, revised_count: revised.length });
    if (!caseName) {
      const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval/planted-answers.json'), 'utf8'));
      const pr = await revise(p.requirements, p.answers, load('redteam-planted-test').findings);
      const pf = p.answers.map((a) => { const r = pr.find((x) => x.id === a.id); return r ? { ...a, ...r, revised: true, original_answer: a.answer } : { ...a, revised: false }; });
      save('planted-revised', { answers: pf });
    }
  }

  if (runs('recheck')) {
    console.log('Agent 7 – Red-team re-check of the revised answers');
    save('redteam-final', await ask('redteam', prompt('redteam'), redteamInput(slimReqs(), slimAnswers(load('answers-final').answers)), { planted: false }));
    if (!caseName) {
      const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'eval/planted-answers.json'), 'utf8'));
      save('redteam-planted-recheck', await ask('redteam', prompt('redteam'), redteamInput(p.requirements, slimAnswers(load('planted-revised').answers)), { planted: false }));
    }
  }

  if (runs('overview')) {
    console.log('Agent 8 – Bid summary: risk register and handover');
    const reqs = load('requirements').requirements;
    const gaps = Object.fromEntries(load('gaps').gaps.map((g) => [g.id, g]));
    const withCov = reqs.map(({ id, rfp_ref, text, type }) => ({ id, rfp_ref, text, type, coverage: gaps[id]?.coverage, gap_note: gaps[id]?.gap_note }));
    const remaining = fs.existsSync(path.join(outDir, 'redteam-final.json')) ? load('redteam-final').findings : load('redteam').findings;
    const r = await ask('overview', prompt('overview'), `Requirements with coverage:\n${JSON.stringify(withCov, null, 1)}\n\nRed-team findings still open after revision:\n${JSON.stringify(remaining, null, 1)}\n\nDiscovery:\n${JSON.stringify(load('discovery'), null, 1)}\n\n${docs.rfp}`);
    save('overview', { ...r, review: review('bid') });
    console.log(`\nGate 2 – Final approval. The draft bid is ready for human quality assurance.\n  The bid manager reviews ${outRel}, then runs:\n  node pipeline/approve.cjs final --by "<name>" --role "bid manager"${caseArgs}`);
  }

  finish();
}

// A readable version of the gap analysis for the people who confirm it at Gate 1.
function writeGapReview() {
  const reqs = load('requirements').requirements;
  const gaps = Object.fromEntries(load('gaps').gaps.map((g) => [g.id, g]));
  const cell = (t) => String(t ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
  const order = { not_covered: 0, needs_specialist: 1, partly: 2, covered: 3 };
  const rows = [...reqs].sort((a, b) => (order[gaps[a.id]?.coverage] ?? 9) - (order[gaps[b.id]?.coverage] ?? 9));
  let md = `# Gap analysis for review (Gate 1)\n\nAI draft. Check each row against your own knowledge of the product. Rows that are not fully covered come first.\n\n| ID | RFP ref. | Type | Requirement | Coverage | Evidence | Gap note | Owner |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) { const g = gaps[r.id] || {}; md += `| ${r.id} | ${cell(r.rfp_ref)} | ${r.type} | ${cell(r.text)} | ${g.coverage || ''} | ${(g.evidence || []).join(', ')} | ${cell(g.gap_note)} | ${r.owner_role} |\n`; }
  fs.writeFileSync(path.join(outDir, 'gap-review.md'), md);
}

function finish() {
  // With --only, keep the earlier steps in the log so the totals cover the whole result set.
  if (only && fs.existsSync(path.join(outDir, 'run-log.json'))) {
    const prev = load('run-log');
    log.started = prev.started;
    log.steps = [...prev.steps.filter((s) => !log.steps.some((n) => n.step === s.step)), ...log.steps];
  }
  log.finished = new Date().toISOString();
  const tot = log.steps.reduce((a, s) => ({ input: a.input + s.tokens.input, output: a.output + s.tokens.output }), { input: 0, output: 0 });
  log.total_tokens = tot;
  save('run-log', log);
  console.log(`Done. Tokens in/out: ${tot.input}/${tot.output}`);
}

main().catch((e) => { console.error(`\nStopped: ${e.message}`); process.exit(1); });
