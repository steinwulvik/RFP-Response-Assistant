// Human checkpoints in the agent chain. An approval is stored in approvals.json next to the results,
// with who approved, in which role, when, and a fingerprint of what was approved. If the approved
// result changes afterwards, the approval no longer counts and must be given again.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GATES = {
  coverage: { file: 'gaps.json', what: 'Coverage in the gap analysis confirmed by product, information security and the commercial lead' },
  final: { file: 'answers-final.json', what: 'Draft bid approved for final human quality assurance by the bid manager' },
};

const fingerprint = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 16);
const readApprovals = (dir) => {
  const f = path.join(dir, 'approvals.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { gates: {} };
};

function checkGate(dir, gate) {
  const g = readApprovals(dir).gates[gate];
  const file = path.join(dir, GATES[gate].file);
  if (!fs.existsSync(file)) return { ok: false, reason: `${GATES[gate].file} does not exist yet.` };
  if (!g) return { ok: false, reason: 'Not approved yet.' };
  if (g.fingerprint !== fingerprint(file)) return { ok: false, reason: `${GATES[gate].file} has changed since it was approved, so it must be approved again.` };
  return { ok: true, ...g };
}

function approve(dir, gate, by, role, note) {
  if (!GATES[gate]) throw new Error(`Unknown gate "${gate}". Use: ${Object.keys(GATES).join(', ')}`);
  const file = path.join(dir, GATES[gate].file);
  if (!fs.existsSync(file)) throw new Error(`Nothing to approve: ${file} does not exist.`);
  if (!by || !role) throw new Error('Give --by "<name>" and --role "<role>".');
  const a = readApprovals(dir);
  a.gates[gate] = { what: GATES[gate].what, by, role, at: new Date().toISOString(), note: note || '', fingerprint: fingerprint(file) };
  fs.writeFileSync(path.join(dir, 'approvals.json'), JSON.stringify(a, null, 2) + '\n');
  return a.gates[gate];
}

module.exports = { GATES, checkGate, approve };
