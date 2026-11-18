#!/usr/bin/env node
// Records a human approval at one of the checkpoints in the agent chain.
//
// Usage (from the project folder):
//   node pipeline/approve.cjs coverage --by "Name" --role "bid manager" [--note "..."] [--case my-rfp] [--model claude]
//   node pipeline/approve.cjs final    --by "Name" --role "bid manager"
'use strict';
const path = require('path');
const { approve, GATES } = require('./lib/gates.cjs');

const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const gate = args[0];
const model = arg('model', 'claude');
const caseName = arg('case', '');
const dir = path.resolve(__dirname, '..', 'results', ...(caseName ? [caseName] : []), model);

try {
  const g = approve(dir, gate, arg('by'), arg('role'), arg('note'));
  console.log(`Approved: ${g.what}\n  by ${g.by} (${g.role}), ${g.at}`);
  if (gate === 'coverage') console.log(`Next: node pipeline/run.cjs${caseName ? ` --case ${caseName}` : ''}${model !== 'claude' ? ` --model ${model}` : ''} --only answers,redteam,revise,recheck,overview`);
} catch (e) {
  console.error(`${e.message}\nGates: ${Object.entries(GATES).map(([k, v]) => `${k} – ${v.what}`).join('; ')}`);
  process.exit(1);
}
