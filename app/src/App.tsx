import { useEffect, useMemo, useState } from 'react';
import { dict, type Lang, type Dict } from './i18n';
import { requirements, keyDates, clarifications, discovery, findings, findingsAfter, gates, revisedCount, overview, evals, evalLog, docs, reqById, run, type Requirement, type Gate } from './data';
import Markdown from './Markdown';

type Page = 'overview' | 'discovery' | 'requirements' | 'answers' | 'quality' | 'bid' | 'ai' | 'sources';
const PAGES: Page[] = ['overview', 'discovery', 'requirements', 'answers', 'quality', 'bid', 'ai', 'sources'];
type Status = 'ai_draft' | 'reviewed' | 'approved';

const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage not available */ } },
};

const pageFromHash = (): Page => {
  const h = window.location.hash.replace(/^#\/?/, '') as Page;
  return PAGES.includes(h) ? h : 'overview';
};

export default function App() {
  const [lang, setLang] = useState<Lang>(() => store.get('bda-lang', 'en'));
  const [page, setPage] = useState<Page>(pageFromHash);
  const [status, setStatus] = useState<Record<string, Status>>(() => store.get('bda-status', {}));
  const [menuOpen, setMenuOpen] = useState(false);
  const t = dict[lang];

  useEffect(() => { const f = () => { setPage(pageFromHash()); setMenuOpen(false); window.scrollTo(0, 0); }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  useEffect(() => { store.set('bda-lang', lang); document.documentElement.lang = lang === 'no' ? 'nb' : 'en'; }, [lang]);
  useEffect(() => { store.set('bda-status', status); }, [status]);
  useEffect(() => { document.title = `${t.nav[page]} – ${t.appName}`; }, [page, t]);

  const setItem = (id: string, s: Status) => setStatus((prev) => ({ ...prev, [id]: s }));
  const review = { status, setItem, t };

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <button className="menu-btn" aria-expanded={menuOpen} aria-controls="nav" onClick={() => setMenuOpen((o) => !o)}>☰<span className="sr">Menu</span></button>
        <a href="#overview" className="brand">
          <span className="logo" aria-hidden="true">◆</span>
          <span><strong>{t.appName}</strong><small>{t.tagline}</small></span>
        </a>
        <div className="lang" role="group" aria-label="Language / Språk">
          <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          <button aria-pressed={lang === 'no'} onClick={() => setLang('no')}>NO</button>
        </div>
      </header>
      <aside className="banner" aria-label={t.noticeLabel}>{t.fictional} {page !== 'overview' && page !== 'sources' && page !== 'ai' ? t.contentNote : ''}</aside>
      <div className="body">
        <nav id="nav" className={menuOpen ? 'open' : ''} aria-label="Main">
          <ol>
            {PAGES.map((p, i) => (
              <li key={p}><a href={`#${p}`} aria-current={page === p ? 'page' : undefined}><span className="num">{i + 1}</span>{t.nav[p]}</a></li>
            ))}
          </ol>
        </nav>
        <main id="main" tabIndex={-1}>
          {page === 'overview' && <Overview t={t} />}
          {page === 'discovery' && <Discovery t={t} review={review} />}
          {page === 'requirements' && <Requirements t={t} />}
          {page === 'answers' && <Answers t={t} review={review} />}
          {page === 'quality' && <Quality t={t} />}
          {page === 'bid' && <Bid t={t} review={review} />}
          {page === 'ai' && <AiPage t={t} />}
          {page === 'sources' && <Sources t={t} />}
          <footer>{t.footer}</footer>
        </main>
      </div>
    </div>
  );
}

function GateStatus({ g, t }: { g?: Gate; t: Dict }) {
  if (!g) return <em className="gate-status waiting">{t.overview.waiting}</em>;
  return <em className="gate-status ok">✓ {t.overview.approvedBy} {g.by} ({g.role}), {new Date(g.at).toLocaleDateString(t === dict.no ? 'nb-NO' : 'en-GB')}</em>;
}

type ReviewProps = { status: Record<string, Status>; setItem: (id: string, s: Status) => void; t: Dict };

function ReviewBar({ id, owner, review }: { id: string; owner: string; review: ReviewProps }) {
  const { status, setItem, t } = review;
  const s = status[id] ?? 'ai_draft';
  return (
    <div className="review">
      <span className={`status s-${s}`}>{t.status[s]}</span>
      <span className="owner">{t.owner}: {t.roles[owner] ?? owner}</span>
      <span className="review-actions">
        {s === 'ai_draft' && <button onClick={() => setItem(id, 'reviewed')}>{t.markReviewed}</button>}
        {s === 'reviewed' && <button onClick={() => setItem(id, 'approved')}>{t.approve}</button>}
        {s !== 'ai_draft' && <button className="link" onClick={() => setItem(id, 'ai_draft')}>{t.reset}</button>}
      </span>
    </div>
  );
}

const Cov = ({ c, t }: { c: Requirement['coverage']; t: Dict }) => <span className={`chip cov-${c}`}>{t.coverage[c]}</span>;
const Type = ({ v, t }: { v: Requirement['type']; t: Dict }) => <span className={`chip type-${v}`}>{t.type[v]}</span>;

function Overview({ t }: { t: Dict }) {
  const o = t.overview;
  const shall = requirements.filter((r) => r.type === 'shall').length;
  const nums: [number, string][] = [
    [requirements.length, o.reqs], [shall, o.shall],
    [requirements.filter((r) => r.coverage === 'partly').length, o.partly],
    [requirements.filter((r) => r.coverage === 'needs_specialist').length, o.specialist],
    [findings.length, o.findings], [revisedCount, o.revised], [findingsAfter.length, o.open], [overview.risks.length, o.risks],
  ];
  return (
    <>
      <h1>{o.title}</h1>
      <p className="lead">{o.intro}</p>
      <section className="start" aria-labelledby="start-h">
        <h2 id="start-h">{o.startTitle}</h2>
        <ol>{o.start.map(([p, h, d]) => <li key={p}><a href={`#${p}`}><strong>{h}</strong></a><span>{d}</span></li>)}</ol>
      </section>
      <h2>{o.numbers}</h2>
      <div className="stats">{nums.map(([n, l]) => <div className="stat" key={l}><b>{n}</b><span>{l}</span></div>)}</div>
      <h2>{o.chainTitle}</h2>
      <p>{o.chainIntro}</p>
      <ol className="chain">
        {(() => { let n = 0; return o.chain.map(([target, h, d]) => {
          if (target.startsWith('gate:')) {
            const g = gates[target.slice(5)];
            return (
              <li key={h} className="gate">
                <span className="gate-icon" aria-hidden="true">✋</span>
                <span><small>{o.gateWord}</small><strong>{h}</strong><span>{d}</span>
                  <GateStatus g={g} t={t} /></span>
              </li>
            );
          }
          n += 1;
          return (
            <li key={h} className="agent"><a href={`#${target}`}><span className="num">{n}</span><span><small>{o.agentWord} {n}</small><strong>{h}</strong><span>{d}</span></span></a></li>
          );
        }); })()}
      </ol>
      <p className="muted">{o.gateNote}</p>
      <h2>{o.team}</h2>
      <p>{o.teamText}</p>
      <h2>{o.roleTitle}</h2>
      <ul className="plain role">{o.role.map((r) => <li key={r}>{r}</li>)}</ul>
    </>
  );
}

function Discovery({ t, review }: { t: Dict; review: ReviewProps }) {
  const d = t.discovery;
  return (
    <>
      <h1>{d.title}</h1>
      <p className="lead">{d.intro}</p>
      <ReviewBar id="discovery" owner="sales" review={review} />
      <h2>{d.strategy}</h2>
      <ul className="cards">{discovery.strategy_summary.map((s, i) => <li key={i}><p>{s.point}</p><small>{d.source}: {s.source}</small></li>)}</ul>
      <h2>{d.hypotheses}</h2>
      <ol className="cards">{discovery.hypotheses.map((h, i) => <li key={i}><p><strong>{h.hypothesis}</strong></p><p>{d.evidence}: {h.evidence}</p><small>{d.source}: {h.source}</small></li>)}</ol>
      <h2>{d.winThemes}</h2>
      <p className="muted">{d.winThemesNote}</p>
      <div className="grid2">{discovery.win_themes.map((w, i) => (
        <div className="card" key={i}>
          <h3>{w.theme}</h3>
          <p><b>{d.need}:</b> {w.customer_need}</p>
          <p><b>{d.proof}:</b> {w.proof.join(', ')}</p>
          {w.weak_spot && <p className="gapnote"><b>{d.weakSpot}:</b> {w.weak_spot}</p>}
        </div>
      ))}</div>
      <h2>{d.priorities}</h2>
      <p className="muted">{d.prioritiesNote}</p>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={t.tableLabel}>
        <table>
          <thead><tr><th scope="col">#</th><th scope="col">{d.opportunity}</th><th scope="col">{d.value}</th><th scope="col">{d.readiness}</th><th scope="col">{d.pace}</th><th scope="col">{d.why}</th></tr></thead>
          <tbody>
            {[...discovery.priorities].sort((a, b) => b.value + b.readiness + b.pace - (a.value + a.readiness + a.pace)).map((p, i) => (
              <tr key={i}><td>{i + 1}</td><th scope="row">{p.opportunity}</th>{[p.value, p.readiness, p.pace].map((v, j) => <td key={j}><Score v={v} /></td>)}<td>{p.reasoning}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>{d.stakeholders}</h2>
      <div className="grid2">{discovery.stakeholders.map((s, i) => <div className="card" key={i}><h3>{s.role}</h3><p><b>{d.caresAbout}:</b> {s.cares_about}</p><p><b>{d.addressInBid}:</b> {s.address_in_bid}</p></div>)}</div>
      <h2>{d.clarifications}</h2>
      <p className="muted">{d.clarificationsNote}</p>
      <ol className="plain">{discovery.clarification_questions.map((q, i) => <li key={i}><span className="chip">{q.rfp_ref}</span> <strong>{q.question}</strong><br /><span className="muted">{d.why}: {q.why}</span></li>)}</ol>
      <h2>{d.workshop}</h2>
      <p className="muted">{d.workshopNote}</p>
      <div className="grid2">
        <section>
          <h3>{d.questions}</h3>
          <ol className="plain">{discovery.workshop_questions.map((q, i) => <li key={i}><strong>{q.question}</strong><br /><span className="muted">{d.why}: {q.why}</span></li>)}</ol>
        </section>
        <section>
          <h3>{d.agenda}</h3>
          <ol className="agenda">{discovery.workshop_agenda.map((a, i) => <li key={i}><span className="min">{a.minutes} {d.min}</span><span><strong>{a.item}</strong><br /><span className="muted">{a.goal}</span></span></li>)}</ol>
        </section>
      </div>
    </>
  );
}

const Score = ({ v }: { v: number }) => <span className="score" role="img" aria-label={`${v} / 5`}><span className="fill" style={{ width: `${v * 20}%` }} /><span className="val" aria-hidden="true">{v}</span></span>;

function Requirements({ t }: { t: Dict }) {
  const r = t.req;
  const [type, setType] = useState('');
  const [cov, setCov] = useState('');
  const [owner, setOwner] = useState('');
  const [q, setQ] = useState('');
  const owners = [...new Set(requirements.map((x) => x.owner_role))];
  const list = requirements.filter((x) => (!type || x.type === type) && (!cov || x.coverage === cov) && (!owner || x.owner_role === owner) && (!q || `${x.rfp_ref} ${x.text} ${x.category}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <h1>{r.title}</h1>
      <p className="lead">{r.intro}</p>
      <div className="filters">
        <label>{r.filterType}<select value={type} onChange={(e) => setType(e.target.value)}><option value="">{r.all}</option>{(['shall', 'should', 'info'] as const).map((v) => <option key={v} value={v}>{t.type[v]}</option>)}</select></label>
        <label>{r.filterCov}<select value={cov} onChange={(e) => setCov(e.target.value)}><option value="">{r.all}</option>{(['covered', 'partly', 'not_covered', 'needs_specialist'] as const).map((v) => <option key={v} value={v}>{t.coverage[v]}</option>)}</select></label>
        <label>{r.filterOwner}<select value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">{r.all}</option>{owners.map((v) => <option key={v} value={v}>{t.roles[v] ?? v}</option>)}</select></label>
        <label>{r.search}<input type="search" maxLength={100} value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <span className="muted" aria-live="polite">{list.length} / {requirements.length} {r.shown}</span>
      </div>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={t.tableLabel}>
        <table className="reqs">
          <thead><tr><th scope="col">{r.ref}</th><th scope="col">{r.text}</th><th scope="col">{r.filterType}</th><th scope="col">{r.category}</th><th scope="col">{r.filterCov}</th><th scope="col">{t.owner}</th></tr></thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <td className="nowrap">{x.rfp_ref}</td>
                <td>{x.text}{x.gap_note && <div className="gapnote">{x.gap_note}</div>}</td>
                <td><Type v={x.type} t={t} /></td>
                <td>{x.category}</td>
                <td><Cov c={x.coverage} t={t} /></td>
                <td>{t.roles[x.owner_role] ?? x.owner_role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid2">
        <section><h2>{r.dates}</h2><ul className="plain">{keyDates.map((d, i) => <li key={i}><strong>{d.date}</strong> – {d.event}</li>)}</ul></section>
        <section><h2>{r.clarifications}</h2><ol className="plain">{clarifications.map((c, i) => <li key={i}><span className="chip">{c.rfp_ref}</span> {c.question}</li>)}</ol></section>
      </div>
    </>
  );
}

function Answers({ t, review }: { t: Dict; review: ReviewProps }) {
  const a = t.answers;
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyRevised, setOnlyRevised] = useState(false);
  const list = requirements.filter((x) => (!onlyOpen || x.coverage !== 'covered' || x.needs_specialist) && (!onlyRevised || x.revised));
  return (
    <>
      <h1>{a.title}</h1>
      <p className="lead">{a.intro}</p>
      <p className="muted">{t.reviewNote}</p>
      <label className="check"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> {a.onlyOpen}</label>
      <label className="check"><input type="checkbox" checked={onlyRevised} onChange={(e) => setOnlyRevised(e.target.checked)} /> {a.onlyRevised} ({revisedCount})</label>
      <div className="answers">
        {list.map((x) => (
          <article className="answer" key={x.id} id={x.id}>
            <div className="req">
              <div className="meta"><span className="chip">{x.rfp_ref}</span><Type v={x.type} t={t} /><Cov c={x.coverage} t={t} /></div>
              <p>{x.text}</p>
            </div>
            <div className="ans">
              {x.needs_specialist || !x.answer ? <p className="specialist">{a.needsSpecialist} {t.roles[x.owner_role] ?? x.owner_role}</p> : <p>{x.answer}</p>}
              {x.answer_evidence.length > 0 && <p className="muted">{a.evidence}: {x.answer_evidence.join(', ')}</p>}
              {x.note && <p className="note"><b>{a.note}:</b> {x.note}</p>}
              {x.revised && (
                <div className="revision">
                  <span className="chip revised">{a.revisedBadge}</span>
                  {x.change_note && <p><b>{a.change}:</b> {x.change_note}</p>}
                  {x.original_answer && <details><summary>{a.original}</summary><p>{x.original_answer}</p></details>}
                </div>
              )}
              <ReviewBar id={x.id} owner={x.owner_role} review={review} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Quality({ t }: { t: Dict }) {
  const qd = t.quality;
  const order = { high: 0, medium: 1, low: 2 } as Record<string, number>;
  const outcome = (ids: string[]) => {
    const rs = ids.map((id) => reqById[id]).filter(Boolean);
    if (rs.some((r) => r.revised && r.needs_specialist)) return ['specialist', qd.outcomeSpecialist];
    if (rs.some((r) => r.revised)) return ['revised', qd.outcomeRevised];
    return ['open', qd.outcomeOpen];
  };
  const list = (fs: typeof findings, withOutcome: boolean) => (
    <ul className="findings">
      {[...fs].sort((a, b) => order[a.severity] - order[b.severity]).map((f, i) => {
        const [oc, ol] = outcome(f.ids);
        return (
          <li key={i} className={`sev-${f.severity}`}>
            <div className="meta"><span className={`chip sev ${f.severity}`}>{qd.severity[f.severity]}</span><span className="chip">{f.kind.replace('_', ' ')}</span>
              {withOutcome && <span className={`chip oc-${oc}`}>{ol}</span>}
              <span>{qd.concerns}: {f.ids.map((id) => <a key={id} href="#answers" onClick={() => setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50)}>{reqById[id]?.rfp_ref ?? id} </a>)}</span></div>
            <p>{f.finding}</p>
            <p className="muted"><b>{qd.suggestion}:</b> {f.suggestion}</p>
          </li>
        );
      })}
    </ul>
  );
  return (
    <>
      <h1>{qd.title}</h1>
      <p className="lead">{qd.intro}</p>
      <p className="summary-line">{qd.summary(findings.length, revisedCount, findingsAfter.length)}</p>
      <h2>{qd.first}</h2>
      {findings.length === 0 ? <p>{qd.none}</p> : list(findings, true)}
      <h2>{qd.after}</h2>
      {findingsAfter.length === 0 ? <p>{qd.afterNone}</p> : list(findingsAfter, false)}
    </>
  );
}

function Bid({ t, review }: { t: Dict; review: ReviewProps }) {
  const b = t.bid;
  const shall = requirements.filter((r) => r.type === 'shall');
  const counts = (['covered', 'partly', 'needs_specialist', 'not_covered'] as const).map((c) => [c, shall.filter((r) => r.coverage === c).length] as const);
  const open = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of requirements) if (r.coverage !== 'covered') m[r.owner_role] = (m[r.owner_role] ?? 0) + 1;
    return Object.entries(m).sort((a, c) => c[1] - a[1]);
  }, []);
  const lvl = (v: string) => <span className={`chip lvl-${v}`}>{v}</span>;
  return (
    <>
      <h1>{b.title}</h1>
      <ReviewBar id="overview" owner="bid" review={review} />
      <h2>{b.gates}</h2>
      <ul className="gates-list">
        {(['coverage', 'final'] as const).map((k) => {
          const item = t.overview.chain.find(([tg]) => tg === `gate:${k}`)!;
          return <li key={k}><strong>{item[1]}</strong> – {item[2]} <GateStatus g={gates[k]} t={t} /></li>;
        })}
      </ul>
      <p className="muted">{t.overview.gateNote}</p>
      <div className="grid2">
        <section>
          <h2>{b.coverage}</h2>
          <div className="bar" role="img" aria-label={counts.map(([c, n]) => `${t.coverage[c]}: ${n}`).join(', ')}>
            {counts.filter(([, n]) => n).map(([c, n]) => <span key={c} className={`cov-${c}`} style={{ flexGrow: n }}>{n}</span>)}
          </div>
          <ul className="legend">{counts.map(([c, n]) => <li key={c}><span className={`dot cov-${c}`} />{t.coverage[c]}: {n}</li>)}</ul>
        </section>
        <section>
          <h2>{b.openPerOwner}</h2>
          <ul className="plain">{open.map(([o, n]) => <li key={o}>{t.roles[o] ?? o}: <strong>{n}</strong> {b.open}</li>)}</ul>
        </section>
      </div>
      <h2>{b.goNoGo}</h2>
      <p className="muted">{b.goNoGoNote}</p>
      <ul className="cards">{overview.go_no_go_facts.map((f, i) => <li key={i}><p>{f}</p></li>)}</ul>
      <h2>{b.risks}</h2>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={t.tableLabel}>
        <table>
          <thead><tr><th scope="col">{b.risks}</th><th scope="col">{b.likelihood}</th><th scope="col">{b.impact}</th><th scope="col">{b.mitigation}</th><th scope="col">{t.owner}</th></tr></thead>
          <tbody>{overview.risks.map((r, i) => <tr key={i}><td><span className="chip">{r.area}</span> {r.risk}</td><td>{lvl(r.likelihood)}</td><td>{lvl(r.impact)}</td><td>{r.mitigation}</td><td>{t.roles[r.owner_role] ?? r.owner_role}</td></tr>)}</tbody>
        </table>
      </div>
      <h2>{b.handover}</h2>
      <div className="grid3">
        {([['scope', b.scope], ['assumptions', b.assumptions], ['open_items', b.openItems]] as const).map(([k, h]) => (
          <section className="card" key={k}><h3>{h}</h3><ul>{overview.handover[k].map((x, i) => <li key={i}>{x}</li>)}</ul></section>
        ))}
      </div>
    </>
  );
}

const MODEL_NAMES: Record<string, string> = { claude: 'Claude Sonnet 5.5', openai: 'GPT-6 Luna' };
const METRICS: [string, string, string, number | null][] = [
  ['recall_shall', 'Shall-requirements found', 'Skal-krav funnet', 0.95],
  ['precision', 'Extracted rows that are real requirements', 'Uttrukne rader som er ekte krav', 0.9],
  ['reference_kept', 'Requirement ID kept (traceability)', 'Krav-ID beholdt (sporbarhet)', 0.95],
  ['type_accuracy', 'Correct type (shall/should/info)', 'Riktig type (skal/bør/info)', 0.95],
  ['coverage_accuracy', 'Correct coverage in gap analysis', 'Riktig dekning i gap-analysen', null],
  ['evidence_accuracy', 'Answers with correct evidence', 'Svar med riktig belegg', 0.9],
  ['specialist_flag_rate', '"Needs specialist" where expected', '«Trenger fagperson» der det skal', 1],
  ['planted_detection', 'Planted errors found by red-team', 'Innlagte feil funnet av red team', 0.8],
  ['planted_resolved', 'Planted errors resolved by the revision agent', 'Innlagte feil rettet av revisjonsagenten', 0.8],
];

function AiPage({ t }: { t: Dict }) {
  const a = t.ai;
  const isNo = t === dict.no;
  const pct = (v: number | null | undefined) => (v == null ? '–' : `${Math.round(v * 1000) / 10} %`);
  return (
    <>
      <h1>{a.title}</h1>
      <div className="grid2">
        <section><h2>{a.principlesTitle}</h2><ul className="plain">{a.principles.map((p) => <li key={p}>{p}</li>)}</ul></section>
        <section><h2>{a.limitsTitle}</h2><ul className="plain">{a.limits.map((p) => <li key={p}>{p}</li>)}</ul></section>
      </div>
      <h2>{a.method}</h2>
      <p>{a.methodText}</p>
      <h2>{a.evalTitle}</h2>
      <p>{a.evalIntro}</p>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={t.tableLabel}>
        <table>
          <thead><tr><th scope="col">{a.metric}</th><th scope="col">{a.target}</th>{evals.map((e) => <th scope="col" key={e.model}>{MODEL_NAMES[e.model] ?? e.model}</th>)}</tr></thead>
          <tbody>
            {METRICS.map(([k, en, no, target]) => (
              <tr key={k}><th scope="row">{isNo ? no : en}</th><td>{pct(target)}</td>{evals.map((e) => {
                const v = (e.metrics as Record<string, number | null>)[k];
                const miss = target != null && v != null && v < target;
                return <td key={e.model} className={miss ? 'miss' : ''}>{pct(v)}</td>;
              })}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">{a.runInfo}: {MODEL_NAMES.claude} · {run.total_tokens.input.toLocaleString()} / {run.total_tokens.output.toLocaleString()} tokens</p>
      <h2>{a.logTitle}</h2>
      <details open><summary>LOG.md</summary><Markdown md={evalLog.replace(/^# .*\n/, '')} /></details>
    </>
  );
}

function Sources({ t }: { t: Dict }) {
  const [sel, setSel] = useState(docs[0].id);
  const d = docs.find((x) => x.id === sel)!;
  return (
    <>
      <h1>{t.sources.title}</h1>
      <p className="lead">{t.sources.intro}</p>
      <div className="tabs" role="tablist">
        {docs.map((x) => <button key={x.id} role="tab" aria-selected={sel === x.id} onClick={() => setSel(x.id)}>{x.title}</button>)}
      </div>
      <div className="doc" role="tabpanel"><Markdown md={d.md} /></div>
    </>
  );
}
