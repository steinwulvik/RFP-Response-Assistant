'use strict';
const fs = require('fs');
const path = require('path');

function readEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

// Pull the first JSON object out of a model answer (handles ```json fences and text around it).
function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('No JSON object in the model answer.');
  const json = raw.slice(start, end + 1);
  try {
    return JSON.parse(json);
  } catch (e) {
    // Light repair of common slips: trailing commas and raw line breaks inside strings.
    const repaired = json.replace(/,\s*([}\]])/g, '$1').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ');
    try { return JSON.parse(repaired); } catch { throw e; }
  }
}

function readText(root, rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

module.exports = { readEnv, parseJson, readText, writeJson, chunk };
