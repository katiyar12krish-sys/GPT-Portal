import zlib from 'node:zlib';

/**
 * Tiny PDF writer (no npm package): A4 pages, Helvetica / Helvetica-Bold, word-wrapped lines.
 * Text is converted to plain Latin characters (Rs. instead of ₹ etc.) because the built-in PDF fonts
 * have no Unicode support.
 */
export interface PdfLine {
  text: string;
  bold?: boolean;
  size?: number;
  gapBefore?: number;
  indent?: number;
  color?: [number, number, number];
}

const W = 595;
const H = 842;
const M = 42;

export const latin = (s: string) =>
  s
    .replace(/₹/g, 'Rs.')
    .replace(/[×]/g, 'x')
    .replace(/[÷]/g, '/')
    .replace(/[–—−]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/Ω/g, ' ohm')
    .replace(/∫/g, 'Integral of ')
    .replace(/°/g, ' deg')
    .replace(/·/g, '.')
    .replace(/½/g, '1/2')
    .replace(/[^\x20-\x7E]/g, '?');

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

function wrap(text: string, maxChars: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const word of text.split(' ')) {
    if ((cur + ' ' + word).trim().length > maxChars) {
      if (cur) out.push(cur);
      cur = word;
    } else cur = (cur + ' ' + word).trim();
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}

export function buildPdf(lines: PdfLine[], footer: string): Buffer {
  const pages: string[] = [];
  let ops: string[] = [];
  let y = H - M;
  const newPage = () => {
    if (ops.length) pages.push(ops.join('\n'));
    ops = [];
    y = H - M;
  };
  for (const l of lines) {
    const size = l.size ?? 9;
    const lh = size * 1.35;
    const indent = l.indent ?? 0;
    const maxChars = Math.floor((W - 2 * M - indent) / (size * 0.5));
    const parts = wrap(latin(l.text), maxChars);
    y -= l.gapBefore ?? 0;
    if (y - lh * Math.min(parts.length, 3) < M + 20) newPage();
    const [r, g, b] = l.color ?? [0, 0, 0];
    for (const p of parts) {
      if (y - lh < M + 20) newPage();
      y -= lh;
      ops.push(`BT ${r} ${g} ${b} rg /${l.bold ? 'F2' : 'F1'} ${size} Tf ${M + indent} ${y.toFixed(1)} Td (${esc(p)}) Tj ET`);
    }
  }
  newPage();
  return assemble(pages, footer, W, H);
}

/** Landscape A4 table: header repeats on every page, cells wrap inside their column. */
export function buildTablePdf(d: { title: string; columns: Array<{ header: string; width: number }>; rows: Array<Array<string | number>> }): Buffer {
  const PW = 842;
  const PH = 595;
  const usable = PW - 2 * M;
  const total = d.columns.reduce((t, c) => t + c.width, 0);
  const widths = d.columns.map(c => (c.width / total) * usable);
  const size = d.columns.length > 9 ? 7 : 8;
  const lh = size * 1.3;
  const pages: string[] = [];
  let ops: string[] = [];
  let y = 0;

  const cells = (vals: string[], top: number, font: string, rgb: string) => {
    let x = M;
    let lines = 1;
    vals.forEach((v, i) => {
      const parts = wrap(latin(v), Math.max(3, Math.floor((widths[i] - 6) / (size * 0.52))));
      lines = Math.max(lines, parts.length);
      parts.forEach((p, k) => ops.push(`BT ${rgb} rg /${font} ${size} Tf ${(x + 3).toFixed(1)} ${(top - lh * (k + 1)).toFixed(1)} Td (${esc(p)}) Tj ET`));
      x += widths[i];
    });
    return lines * lh + 5;
  };
  const startPage = () => {
    ops = [];
    y = PH - M;
    if (!pages.length) {
      ops.push(`BT 0 0 0 rg /F2 12 Tf ${M} ${y - 12} Td (${esc(latin('Uttarakhand Government Institute of Polytechnic, Tanakpur'))}) Tj ET`);
      ops.push(`BT 0.35 0.35 0.35 rg /F1 10 Tf ${M} ${y - 26} Td (${esc(latin(`${d.title} (${d.rows.length} records)`))}) Tj ET`);
      y -= 38;
    }
    const heads = d.columns.map(c => c.header);
    const h = heads.reduce((m, v, i) => Math.max(m, wrap(latin(v), Math.max(3, Math.floor((widths[i] - 6) / (size * 0.52)))).length), 1) * lh + 5;
    ops.push(`0.11 0.1 0.09 rg ${M} ${(y - h).toFixed(1)} ${usable} ${h.toFixed(1)} re f`);
    cells(heads, y - 1, 'F2', '1 1 1');
    y -= h;
  };

  startPage();
  d.rows.forEach((row, n) => {
    const vals = row.map(String);
    const need = vals.reduce((m, v, i) => Math.max(m, wrap(latin(v), Math.max(3, Math.floor((widths[i] - 6) / (size * 0.52)))).length), 1) * lh + 5;
    if (y - need < M) {
      pages.push(ops.join('\n'));
      startPage();
    }
    if (n % 2 === 1) ops.push(`0.96 0.95 0.94 rg ${M} ${(y - need).toFixed(1)} ${usable} ${need.toFixed(1)} re f`);
    cells(vals, y - 1, 'F1', '0.1 0.1 0.1');
    y -= need;
  });
  pages.push(ops.join('\n'));
  return assemble(pages, `UGIP Tanakpur - ${d.title}`, PW, PH);
}

function assemble(pages: string[], footer: string, W: number, H: number): Buffer {
  // assemble objects
  const objs: Buffer[] = [];
  const add = (b: string | Buffer) => objs.push(typeof b === 'string' ? Buffer.from(b, 'latin1') : b);
  add('<< /Type /Catalog /Pages 2 0 R >>');
  const firstPage = 5;
  const kids = pages.map((_, i) => `${firstPage + i * 2} 0 R`).join(' ');
  add(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  pages.forEach((content, i) => {
    const foot = `BT 0.45 0.45 0.45 rg /F1 7.5 Tf ${M} 24 Td (${esc(latin(footer))}  |  Page ${i + 1} of ${pages.length}) Tj ET`;
    const data = zlib.deflateSync(Buffer.from(content + '\n' + foot, 'latin1'));
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${firstPage + i * 2 + 1} 0 R >>`);
    add(Buffer.concat([Buffer.from(`<< /Length ${data.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'), data, Buffer.from('\nendstream', 'latin1')]));
  });

  const chunks: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets: number[] = [];
  let pos = chunks[0].length;
  objs.forEach((o, i) => {
    const head = Buffer.from(`${i + 1} 0 obj\n`, 'latin1');
    const tail = Buffer.from('\nendobj\n', 'latin1');
    offsets.push(pos);
    chunks.push(head, o, tail);
    pos += head.length + o.length + tail.length;
  });
  const xref = [`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`, ...offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
  chunks.push(Buffer.from(`${xref}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF`, 'latin1'));
  return Buffer.concat(chunks);
}
