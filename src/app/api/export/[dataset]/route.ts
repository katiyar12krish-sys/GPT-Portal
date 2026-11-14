/**
 * GET /api/export/<dataset>?format=xlsx|pdf – Excel / PDF downloads (student list, marks, progress, notices, companies…).
 * The columns of each dataset are defined in src/lib/server/exportData.ts – add a new download there.
 */
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { buildDataset, type Dataset } from '@/lib/server/exportData';
import { buildTablePdf } from '@/lib/server/simplePdf';

export const dynamic = 'force-dynamic';

async function toExcel(d: Dataset): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'UGIP Tanakpur';
  const ws = wb.addWorksheet('Data', { views: [{ state: 'frozen', ySplit: 3 }] });
  ws.columns = d.columns.map(c => ({ width: Math.max(8, c.width) }));
  ws.mergeCells(1, 1, 1, d.columns.length);
  ws.getCell(1, 1).value = `Uttarakhand Government Institute of Polytechnic, Tanakpur – ${d.title}`;
  ws.getCell(1, 1).font = { bold: true, size: 13 };
  ws.getRow(3).values = d.columns.map(c => c.header);
  ws.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1C1917' } };
  d.rows.forEach(r => ws.addRow(r));
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: d.columns.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** GET /api/export/students?format=xlsx|pdf&year=…  Every list downloads from here. */
export const GET = handle(async (req: NextRequest, ctx: { params: Promise<{ dataset: string }> }) => {
  const me = await requireUser();
  const { dataset } = await ctx.params;
  const format = req.nextUrl.searchParams.get('format') ?? 'xlsx';
  if (format !== 'xlsx' && format !== 'pdf') throw new HttpError(400, 'Choose Excel or PDF.');
  const d = await buildDataset(dataset, me, req.nextUrl.searchParams);
  const body = format === 'xlsx' ? await toExcel(d) : buildTablePdf(d);
  const name = `UGIP_${d.title.replace(/[^\w]+/g, '_').replace(/_+$/, '')}.${format}`;
  return new NextResponse(new Uint8Array(body), {
    headers: {
      'content-type': format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      'content-disposition': `attachment; filename="${name}"`,
    },
  });
});
