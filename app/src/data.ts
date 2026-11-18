import discoveryJson from './data/discovery.json';
import requirementsJson from './data/requirements.json';
import gapsJson from './data/gaps.json';
import answersFinalJson from './data/answers-final.json';
import redteamFinalJson from './data/redteam-final.json';
import approvalsJson from './data/approvals.json';
import redteamJson from './data/redteam.json';
import overviewJson from './data/overview.json';
import runLog from './data/run-log.json';
import evalClaude from './data/eval-claude.json';
import evalOpenai from './data/eval-openai.json';
import logMd from './data/LOG.md?raw';
import doc1 from './data/docs/01-morild-annual-report-extract.md?raw';
import doc2 from './data/docs/02-morild-strategy-note.md?raw';
import doc3 from './data/docs/03-rfp-morild-account-data-platform.md?raw';
import doc4 from './data/docs/04-nordlys-capability-sheet.md?raw';

export type Coverage = 'covered' | 'partly' | 'not_covered' | 'needs_specialist';
export type ReqType = 'shall' | 'should' | 'info';

export interface Requirement {
  id: string;
  rfp_ref: string;
  text: string;
  type: ReqType;
  category: string;
  owner_role: string;
  coverage: Coverage;
  evidence: string[];
  gap_note: string;
  answer: string;
  answer_evidence: string[];
  needs_specialist: boolean;
  note: string;
  revised: boolean;
  original_answer: string;
  change_note: string;
}

const gaps = Object.fromEntries(gapsJson.gaps.map((g) => [g.id, g]));
export interface Answer { id: string; answer: string; evidence: string[]; needs_specialist: boolean; note: string; revised?: boolean; original_answer?: string; change_note?: string }
export interface Finding { ids: string[]; kind: string; severity: string; finding: string; suggestion: string }
export interface Gate { what: string; by: string; role: string; at: string; note?: string }
const finalAnswers = (answersFinalJson as unknown as { answers: Answer[] }).answers;
const answers = Object.fromEntries(finalAnswers.map((a) => [a.id, a]));

export const requirements: Requirement[] = requirementsJson.requirements.map((r) => ({
  id: r.id,
  rfp_ref: r.rfp_ref,
  text: r.text,
  type: r.type as ReqType,
  category: r.category,
  owner_role: r.owner_role,
  coverage: (gaps[r.id]?.coverage ?? 'needs_specialist') as Coverage,
  evidence: gaps[r.id]?.evidence ?? [],
  gap_note: gaps[r.id]?.gap_note ?? '',
  answer: answers[r.id]?.answer ?? '',
  answer_evidence: answers[r.id]?.evidence ?? [],
  needs_specialist: answers[r.id]?.needs_specialist ?? true,
  note: answers[r.id]?.note ?? '',
  revised: answers[r.id]?.revised ?? false,
  original_answer: answers[r.id]?.original_answer ?? '',
  change_note: answers[r.id]?.change_note ?? '',
}));

export const keyDates = requirementsJson.key_dates;
export const clarifications = requirementsJson.clarification_questions;
export const discovery = discoveryJson;
export const findings = redteamJson.findings as Finding[];
export const findingsAfter = (redteamFinalJson as unknown as { findings: Finding[] }).findings;
export const gates = (approvalsJson as unknown as { gates: Record<string, Gate> }).gates;
export const revisedCount = finalAnswers.filter((a) => a.revised).length;
export const overview = overviewJson;
export const run = runLog;
export const evals = [evalClaude, evalOpenai];
export const evalLog = logMd;
export const docs = [
  { id: 'annual', title: 'Morild Bank – Annual Report 2025 (extract)', md: doc1 },
  { id: 'strategy', title: 'Morild 2030 – Strategy note', md: doc2 },
  { id: 'rfp', title: 'RFP MB-2026-014', md: doc3 },
  { id: 'caps', title: 'Nordlys – Capability sheet', md: doc4 },
];

export const reqById = Object.fromEntries(requirements.map((r) => [r.id, r]));
