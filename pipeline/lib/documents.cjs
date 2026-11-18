// Loads the documents for a case and turns PDF and Word files into text.
//
// Demo case: the files listed under "sourceDocs" in pipeline/config.json.
// Other cases: cases/<name>/case.json, for example:
//   {
//     "customer":     ["customer/annual-report.pdf", "customer/strategy.docx"],
//     "rfp":          ["rfp/rfp-main.pdf", "rfp/appendix-a-requirements.docx"],
//     "capabilities": ["capabilities/product-sheet.pdf", "capabilities/answer-library.md"]
//   }
// Paths are relative to the case folder. Supported: .md, .txt, .pdf, .docx.
'use strict';
const fs = require('fs');
const path = require('path');

async function readDocument(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.md' || ext === '.txt') return fs.readFileSync(file, 'utf8');
  if (ext === '.pdf') {
    let pdf;
    try { pdf = require('pdf-parse'); } catch { throw new Error('PDF support is not installed. Run "npm install" in the project folder.'); }
    const data = await pdf(fs.readFileSync(file));
    return data.text;
  }
  if (ext === '.docx') {
    let mammoth;
    try { mammoth = require('mammoth'); } catch { throw new Error('Word support is not installed. Run "npm install" in the project folder.'); }
    // Raw text keeps every table cell (requirement tables are common in Word appendices).
    const res = await mammoth.extractRawText({ path: file });
    return res.value.replace(/\n{3,}/g, '\n\n');
  }
  throw new Error(`Unsupported file type: ${file} (use .md, .txt, .pdf or .docx)`);
}

async function block(root, files) {
  const parts = [];
  for (const rel of files) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
    const text = (await readDocument(file)).trim();
    if (!text) throw new Error(`No text found in ${rel}. Scanned PDFs need OCR before they can be used.`);
    parts.push(`<document name="${path.basename(rel)}">\n${text}\n</document>`);
  }
  return parts.join('\n\n');
}

async function loadCase(root, cfg, caseName) {
  if (!caseName) {
    const d = cfg.sourceDocs;
    return {
      customer: await block(root, [d.annualReport, d.strategy]),
      rfp: await block(root, [d.rfp]),
      capabilities: await block(root, [d.capabilities]),
    };
  }
  const dir = path.join(root, 'cases', caseName);
  const caseFile = path.join(dir, 'case.json');
  if (!fs.existsSync(caseFile)) throw new Error(`Missing ${caseFile}. Copy cases/example/case.json and list your files.`);
  const c = JSON.parse(fs.readFileSync(caseFile, 'utf8'));
  for (const k of ['rfp', 'capabilities']) if (!c[k]?.length) throw new Error(`case.json must list at least one "${k}" file.`);
  return {
    customer: c.customer?.length ? await block(dir, c.customer) : '<document name="customer">No customer documents were given.</document>',
    rfp: await block(dir, c.rfp),
    capabilities: await block(dir, c.capabilities),
  };
}

// Splits long text into parts of at most maxChars, preferring to cut at a heading or a blank line.
function splitText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const parts = [];
  let rest = text;
  while (rest.length > maxChars) {
    const window = rest.slice(0, maxChars);
    let cut = window.lastIndexOf('\n#');
    if (cut < maxChars * 0.5) cut = window.lastIndexOf('\n\n');
    if (cut < maxChars * 0.5) cut = maxChars;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest.trim()) parts.push(rest);
  return parts;
}

module.exports = { loadCase, splitText, readDocument };
