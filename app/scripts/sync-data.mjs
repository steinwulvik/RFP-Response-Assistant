// Copies pipeline results, evaluation results and source documents into the app before build.
import fs from 'fs';
import path from 'path';
const root = path.resolve(import.meta.dirname, '..', '..');
const out = path.resolve(import.meta.dirname, '..', 'src', 'data');
const model = process.env.SHOW_MODEL || 'claude';
fs.mkdirSync(path.join(out, 'docs'), { recursive: true });
const src = (f) => path.join(root, 'results', model, `${f}.json`);
for (const f of ['discovery', 'requirements', 'gaps', 'answers', 'redteam', 'overview', 'run-log']) {
  fs.copyFileSync(src(f), path.join(out, `${f}.json`));
}
// Results from the revision agent, the re-check and the human gates (empty defaults if a run did not produce them).
const answers = JSON.parse(fs.readFileSync(src('answers'), 'utf8')).answers;
const fallbacks = {
  'answers-final': { answers: answers.map((a) => ({ ...a, revised: false })), revised_count: 0 },
  'redteam-final': { findings: [] },
  approvals: { gates: {} },
};
for (const [f, def] of Object.entries(fallbacks)) {
  const target = path.join(out, `${f}.json`);
  if (fs.existsSync(src(f))) fs.copyFileSync(src(f), target);
  else fs.writeFileSync(target, JSON.stringify(def, null, 2));
}
for (const m of ['claude', 'openai']) {
  const f = path.join(root, 'eval', `results-${m}.json`);
  if (fs.existsSync(f)) fs.copyFileSync(f, path.join(out, `eval-${m}.json`));
}
fs.copyFileSync(path.join(root, 'eval', 'LOG.md'), path.join(out, 'LOG.md'));
for (const f of fs.readdirSync(path.join(root, 'source-docs'))) fs.copyFileSync(path.join(root, 'source-docs', f), path.join(out, 'docs', f));
console.log(`Data synced from results/${model}`);
