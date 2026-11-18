// Small Markdown renderer for the source documents: headings, paragraphs, lists, tables, quotes, bold and code.
import type { ReactNode } from 'react';

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

export default function Markdown({ md }: { md: string }) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let lastHeading = '';
  let tableNo = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 5);
      const Tag = `h${level}` as 'h2';
      lastHeading = h[2].replace(/[*`]/g, '');
      out.push(<Tag key={i}>{inline(h[2])}</Tag>);
      i++; continue;
    }
    if (line.startsWith('---')) { out.push(<hr key={i} />); i++; continue; }
    if (line.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(<blockquote key={i}>{inline(buf.join(' '))}</blockquote>);
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      tableNo += 1;
      out.push(
        <div className="table-wrap" key={i} tabIndex={0} role="region" aria-label={`${lastHeading || "Table"} – ${head.filter(Boolean).join(", ")} (${tableNo})`}>
          <table>
            <thead><tr>{head.map((c, j) => (c ? <th key={j} scope="col">{inline(c)}</th> : <td key={j} />))}</tr></thead>
            <tbody>{body.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^(\s*[-*]|\s*\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(\s*[-*]|\s*\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s/, ''));
      const List = ordered ? 'ol' : 'ul';
      out.push(<List key={i}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</List>);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||>|---|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
    out.push(<p key={i}>{inline(buf.join(' '))}</p>);
  }
  return <div className="md">{out}</div>;
}
