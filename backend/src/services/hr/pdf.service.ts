import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../../config/env";
import { Logger } from "../../config";

const logger = new Logger("PDFService");

const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: env.DO_SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

export interface PayslipData {
  name: string;
  email: string;
  payroll_period: string;
  date_of_payment: string;
  staff_fellow_number?: string;
  employee_id?: string;
  program?: string;
  payroll_type?: string;
  currency?: string;
  // Format 1
  basic_salary?: string;
  gross_salary?: string;
  csr_employer?: string;
  occupational_hazards?: string;
  maternity_employer?: string;
  csr_employee?: string;
  maternity_employee?: string;
  tpr?: string;
  net_salary_before_cbhi?: string;
  cbhi?: string;
  net_salary?: string;
  net_salary_usd?: string;
  exchange_rate_used?: string;
  bnr_exchange_rate_date?: string;
  // Format 2
  gross_usd?: string;
  wop_usd?: string;
  date_rate?: string;
  wop_rwf?: string;
  gross_rwf?: string;
  // Format 3
  housing_allowance?: string;
  function_allowance?: string;
  transport_allowance?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GREEN = "#045F3C";
const ORANGE = "#EA580C";
const YELLOW = "#F59E0B";
const L = 50; // page left margin
const R = 545; // page right margin
const MID = 297; // midpoint for two-column table
const W = R - L; // total content width

// ─── Helpers ─────────────────────────────────────────────────────────────────

function n(value: string | undefined | null): number {
  if (!value) return 0;
  const v = parseFloat(value);
  return isNaN(v) ? 0 : v;
}

function fmt(value: string | undefined | null, currency = "RWF"): string {
  const num = n(value);
  if (num === 0) return `${currency} -`;
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtNum(num: number, currency = "RWF"): string {
  if (num === 0) return `${currency} -`;
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(value: string | undefined | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Header ──────────────────────────────────────────────────────────────────

function drawHeader(doc: PDFKit.PDFDocument, docTitle: string) {
  const candidates = [
    path.join(process.cwd(), "public", "images", "logo.png"),
    path.join(process.cwd(), "public", "images", "log.png"),
    path.join(__dirname, "../../public/images/logo.png"),
    path.join(__dirname, "../../public/images/log.png"),
    path.join(__dirname, "../../../public/images/logo.png"),
  ];
  let logoDrawn = false;
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        doc.image(p, L, 40, { width: 80 });
        logoDrawn = true;
        break;
      }
    } catch {
      /* skip */
    }
  }
  if (!logoDrawn) {
    doc.rect(L, 40, 80, 55).stroke("#CCCCCC");
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(GREEN)
    .text("GANZAFRICA FOUNDATION", L, 40, { align: "right", width: W, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#555555")
    .text("Reg No: N\u00B0 64/RGB/FDN/LP/07/2024", L, 59, {
      align: "right",
      width: W,
      lineBreak: false,
    });
  doc
    .fontSize(8)
    .text("info@ganzafrica.org", L, 70, { align: "right", width: W, lineBreak: false });
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(ORANGE)
    .text(docTitle, L, 83, { align: "right", width: W, lineBreak: false });

  doc.font("Helvetica");
  doc.moveTo(L, 102).lineTo(R, 102).strokeColor(GREEN).lineWidth(2).stroke();
  doc.y = 110;
}

// ─── Part 1: Employee Info — two columns ─────────────────────────────────────

function drawEmployeeSection(doc: PDFKit.PDFDocument, data: PayslipData) {
  const type = data.payroll_type || "rwf";
  const isWop = type === "wop_usd" || type === "rwf_wop";

  // Column boundaries
  const leftColW = 240;
  const rightColX = MID + 10;
  const rightColW = R - rightColX;

  let ly = doc.y + 4; // left column y
  const ry = ly; // right column y — starts same

  // ── Left column items ──────────────────────────────────
  const lh = 16; // line height

  // Name (always)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#111111")
    .text(data.name, L, ly, { width: leftColW, lineBreak: false });
  ly += lh;

  // Build the ID rows to show based on format:
  // Format 1 (rwf/rwf_usd): Employee No. (staff_fellow_number) + Employee ID (employee_id)
  // Format 2 (wop_usd):     Consultant ID (staff_fellow_number) only — no employee number row
  // Format 3 (xof):         Employee No. (employee_id) only
  // Format 4 (rwf_wop):     Employee No. (employee_id) only — their csv "Employee Id" is their number
  const idRows: { label: string; value: string }[] = [];
  if (type === "rwf" || type === "rwf_usd") {
    if (data.staff_fellow_number)
      idRows.push({ label: "Employee No.:", value: data.staff_fellow_number });
    if (data.employee_id) idRows.push({ label: "Employee ID:", value: data.employee_id });
  } else if (type === "wop_usd") {
    if (data.staff_fellow_number)
      idRows.push({ label: "Consultant ID:", value: data.staff_fellow_number });
    if (data.employee_id) idRows.push({ label: "Consultant ID:", value: data.employee_id });
  } else if (type === "xof") {
    if (data.employee_id) idRows.push({ label: "Employee No.:", value: data.employee_id });
  } else if (type === "rwf_wop") {
    if (data.employee_id) idRows.push({ label: "Consultant ID:", value: data.employee_id });
  }

  for (const row of idRows) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444444")
      .text(row.label, L, ly, { width: 110, lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111111")
      .text(row.value, L + 112, ly, { width: leftColW - 112, lineBreak: false });
    ly += lh;
  }

  // ── Right column items ─────────────────────────────────
  let ry2 = ry;
  const rlabel = (label: string, value: string) => {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444444")
      .text(label, rightColX, ry2, { width: 105, lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111111")
      .text(value, rightColX + 107, ry2, { width: rightColW - 107, lineBreak: false });
    ry2 += lh;
  };

  rlabel("Payment Date:", fmtDate(data.date_of_payment));
  rlabel("Payroll Period:", data.payroll_period);
  rlabel("Method of Transfer:", "Bank Transfer");

  // Advance doc.y past both columns
  doc.y = Math.max(ly, ry2) + 8;

  // Horizontal divider
  doc.moveTo(L, doc.y).lineTo(R, doc.y).strokeColor("#CCCCCC").lineWidth(0.5).stroke();
  doc.y += 6;
}

// ─── Part 2: Earnings | Deductions two-column table ──────────────────────────

// Draw a cell text at absolute position, no cursor movement
function cell(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: {
    bold?: boolean;
    color?: string;
    align?: "left" | "right";
    size?: number;
    indent?: number;
  } = {},
) {
  const { bold = false, color = "#111111", align = "left", size = 9, indent = 0 } = opts;
  doc
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(size)
    .fillColor(color)
    .text(text, x + indent, y, { width: w - indent, align, lineBreak: false });
}

// Draw the full earnings/deductions table and return the y after it
function drawEarningsDeductionsTable(doc: PDFKit.PDFDocument, data: PayslipData): number {
  const type = data.payroll_type || "rwf";
  const cur = type === "xof" ? "XOF" : type === "wop_usd" ? "USD" : "RWF";

  const colGap = 8;
  const leftW = MID - L - colGap / 2 - 10;
  const rightX = MID + colGap / 2 - 10;
  const rightW = R - rightX;
  const rh = 18;
  const indentPx = 12;

  type Row = { label: string; value: string; bold?: boolean; indent?: number };
  type DeductRow = { label: string; value: string; isGroupTitle?: boolean; indent?: number };

  // ── Collect earnings rows ───────────────────────────────
  const earnRows: Row[] = [];
  if (type === "rwf" || type === "rwf_usd") {
    earnRows.push({ label: "Basic Salary", value: fmt(data.basic_salary, "RWF") });
    earnRows.push({ label: "Gross Salary", value: fmt(data.gross_salary, "RWF"), bold: true });
  } else if (type === "wop_usd") {
    earnRows.push({ label: "Gross Fees", value: fmt(data.gross_usd, "USD"), bold: true });
    if (data.gross_rwf)
      earnRows.push({ label: "Gross (RWF equivalent)", value: fmt(data.gross_rwf, "RWF") });
  } else if (type === "xof") {
    earnRows.push({ label: "Basic Salary", value: fmt(data.basic_salary, "XOF") });
    if (data.housing_allowance)
      earnRows.push({
        label: "Housing Allowance (20%)",
        value: fmt(data.housing_allowance, "XOF"),
      });
    if (data.function_allowance)
      earnRows.push({
        label: "Function Allowance (5%)",
        value: fmt(data.function_allowance, "XOF"),
      });
    if (data.transport_allowance)
      earnRows.push({
        label: "Transport Allowance (5%)",
        value: fmt(data.transport_allowance, "XOF"),
      });
    earnRows.push({
      label: "Gross / Net Salary",
      value: fmt(data.gross_salary, "XOF"),
      bold: true,
    });
  } else if (type === "rwf_wop") {
    earnRows.push({ label: "Gross Fees", value: fmt(data.gross_salary, "RWF"), bold: true });
  }

  // ── Format 3 (XOF): no deductions — render full-width earnings table ────────
  if (type === "xof") {
    const headerH = 22;
    const tableRows = earnRows.length;
    const tableH = headerH + tableRows * rh + 6;
    const fullW = R - L;
    const startY = doc.y;

    doc.rect(L, startY, fullW, headerH).fill(GREEN);
    cell(doc, "Earnings", L + 6, startY + 6, fullW - 12, {
      bold: true,
      color: "#FFFFFF",
      size: 10,
    });

    const bodyY = startY + headerH;
    for (let i = 0; i < tableRows; i++) {
      const rowY = bodyY + i * rh;
      doc.rect(L, rowY, fullW, rh).fill(i % 2 === 0 ? "#F7F9F7" : "#FFFFFF");
      cell(doc, earnRows[i].label, L + 6, rowY + 4, fullW / 2 - 6, { size: 9, color: "#444444" });
      cell(doc, earnRows[i].value, L + fullW / 2, rowY + 4, fullW / 2 - 6, {
        bold: earnRows[i].bold,
        size: 9,
        align: "right",
      });
      if (i > 0) {
        doc.moveTo(L, rowY).lineTo(R, rowY).strokeColor("#EEEEEE").lineWidth(0.3).stroke();
      }
    }
    doc
      .moveTo(L + fullW / 2, bodyY)
      .lineTo(L + fullW / 2, startY + tableH)
      .strokeColor("#EEEEEE")
      .lineWidth(0.5)
      .stroke();
    doc.rect(L, startY, fullW, tableH).stroke("#CCCCCC");

    return startY + tableH + 10;
  }

  // ── Collect deduction rows (grouped) ────────────────────
  const dedRows: DeductRow[] = [];
  let totalDeductions = 0;

  if (type === "rwf" || type === "rwf_usd") {
    const hasEmployer =
      n(data.csr_employer) || n(data.occupational_hazards) || n(data.maternity_employer);
    if (hasEmployer) {
      dedRows.push({ label: "Employer Contributions", value: "", isGroupTitle: true });
      if (n(data.csr_employer)) {
        dedRows.push({
          label: "CSR 6% (RSSB)",
          value: fmt(data.csr_employer, "RWF"),
          indent: indentPx,
        });
        // employer — NOT added to total
      }
      if (n(data.occupational_hazards)) {
        dedRows.push({
          label: "Occupational Hazards 2%",
          value: fmt(data.occupational_hazards, "RWF"),
          indent: indentPx,
        });
        // employer — NOT added to total
      }
      if (n(data.maternity_employer)) {
        dedRows.push({
          label: "Maternity 0.3%",
          value: fmt(data.maternity_employer, "RWF"),
          indent: indentPx,
        });
        // employer — NOT added to total
      }
    }
    const hasEmployee =
      n(data.csr_employee) || n(data.maternity_employee) || n(data.tpr) || n(data.cbhi);
    if (hasEmployee) {
      dedRows.push({ label: "Employee Contributions", value: "", isGroupTitle: true });
      if (n(data.csr_employee)) {
        dedRows.push({
          label: "CSR 6% (RSSB)",
          value: fmt(data.csr_employee, "RWF"),
          indent: indentPx,
        });
        totalDeductions += n(data.csr_employee);
      }
      if (n(data.maternity_employee)) {
        dedRows.push({
          label: "Maternity 0.3%",
          value: fmt(data.maternity_employee, "RWF"),
          indent: indentPx,
        });
        totalDeductions += n(data.maternity_employee);
      }
      if (n(data.tpr)) {
        dedRows.push({ label: "TPR 30%", value: fmt(data.tpr, "RWF"), indent: indentPx });
        totalDeductions += n(data.tpr);
      }
      if (n(data.cbhi)) {
        dedRows.push({ label: "CBHI 0.5%", value: fmt(data.cbhi, "RWF"), indent: indentPx });
        totalDeductions += n(data.cbhi);
      }
    }
  } else if (type === "wop_usd") {
    dedRows.push({ label: "Withholding Tax (WOP)", value: "", isGroupTitle: true });
    dedRows.push({ label: "WOP", value: fmt(data.wop_usd, "USD"), indent: indentPx });
    dedRows.push({
      label: "WOP (RWF equivalent)",
      value: fmt(data.wop_rwf, "RWF"),
      indent: indentPx,
    });
    totalDeductions += n(data.wop_usd);
  } else if (type === "rwf_wop") {
    dedRows.push({ label: "Withholding Tax (WOP)", value: "", isGroupTitle: true });
    dedRows.push({ label: "WOP", value: fmt(data.wop_rwf, "RWF"), indent: indentPx });
    totalDeductions += n(data.wop_rwf);
  }
  if (totalDeductions > 0) {
    const dedCur = type === "wop_usd" ? "USD" : cur;
    dedRows.push({ label: "Total Employee Deductions", value: fmtNum(totalDeductions, dedCur) });
  }

  // ── Draw two-column table ────────────────────────────────
  const headerH = 22;
  const tableRows = Math.max(earnRows.length, dedRows.length);
  const tableH = headerH + tableRows * rh + 6;
  const startY = doc.y;

  // Headers
  doc.rect(L, startY, leftW, headerH).fill(GREEN);
  cell(doc, "Earnings", L + 6, startY + 6, leftW - 6, { bold: true, color: "#FFFFFF", size: 10 });
  doc.rect(rightX, startY, rightW, headerH).fill(GREEN);
  cell(doc, "Deductions", rightX + 6, startY + 6, rightW - 6, {
    bold: true,
    color: "#FFFFFF",
    size: 10,
  });

  const bodyY = startY + headerH;

  // Row backgrounds
  for (let i = 0; i < tableRows; i++) {
    const rowY = bodyY + i * rh;
    const bg = i % 2 === 0 ? "#F7F9F7" : "#FFFFFF";
    doc.rect(L, rowY, leftW, rh).fill(bg);
    doc.rect(rightX, rowY, rightW, rh).fill(bg);
  }

  // Earnings rows
  earnRows.forEach((row, i) => {
    const rowY = bodyY + i * rh + 4;
    cell(doc, row.label, L + 6, rowY, leftW / 2 - 6, { size: 9, color: "#444444" });
    cell(doc, row.value, L + leftW / 2, rowY, leftW / 2 - 4, {
      bold: row.bold,
      size: 9,
      align: "right",
    });
  });

  // Deductions rows
  dedRows.forEach((row, i) => {
    const rowY = bodyY + i * rh + 4;
    if (row.isGroupTitle) {
      cell(doc, row.label, rightX + 4, rowY, rightW - 8, { bold: true, color: GREEN, size: 9 });
    } else if (row.label === "Total Employee Deductions") {
      cell(doc, row.label, rightX + 4, rowY, rightW / 2 - 8, {
        bold: true,
        color: "#111111",
        size: 9,
      });
      cell(doc, row.value, rightX + rightW / 2, rowY, rightW / 2 - 4, {
        bold: true,
        color: ORANGE,
        size: 9,
        align: "right",
      });
    } else {
      cell(doc, row.label, rightX + 4, rowY, rightW / 2 - 8, {
        size: 9,
        color: "#444444",
        indent: row.indent ?? 0,
      });
      cell(doc, row.value, rightX + rightW / 2, rowY, rightW / 2 - 4, { size: 9, align: "right" });
    }
  });

  // Borders and dividers
  doc.rect(L, startY, leftW, tableH).stroke("#CCCCCC");
  doc.rect(rightX, startY, rightW, tableH).stroke("#CCCCCC");
  doc
    .moveTo(L + leftW / 2, bodyY)
    .lineTo(L + leftW / 2, startY + tableH)
    .strokeColor("#EEEEEE")
    .lineWidth(0.5)
    .stroke();
  doc
    .moveTo(rightX + rightW / 2, bodyY)
    .lineTo(rightX + rightW / 2, startY + tableH)
    .strokeColor("#EEEEEE")
    .lineWidth(0.5)
    .stroke();
  for (let i = 1; i < tableRows; i++) {
    const lineY = bodyY + i * rh;
    doc
      .moveTo(L, lineY)
      .lineTo(L + leftW, lineY)
      .strokeColor("#EEEEEE")
      .lineWidth(0.3)
      .stroke();
    doc
      .moveTo(rightX, lineY)
      .lineTo(rightX + rightW, lineY)
      .strokeColor("#EEEEEE")
      .lineWidth(0.3)
      .stroke();
  }

  return startY + tableH + 10;
}

// ─── Exchange rate row (full width, below table) ──────────────────────────────

function drawExchangeRateRow(doc: PDFKit.PDFDocument, data: PayslipData, y: number): number {
  const type = data.payroll_type || "rwf";
  const hasRate = data.exchange_rate_used || data.bnr_exchange_rate_date || data.date_rate;
  if (!hasRate) return y;

  const rateDate = data.bnr_exchange_rate_date || data.date_rate;
  const rateAmt = data.exchange_rate_used;

  // Full-width band
  doc.rect(L, y, R - L, 22).fill("#F0F7F4");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(GREEN)
    .text("Exchange Rate", L + 6, y + 6, { lineBreak: false });

  let rx = L + 110;
  if (rateDate) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444444")
      .text("Rate Date:", rx, y + 6, { lineBreak: false });
    rx += 58;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111111")
      .text(fmtDate(rateDate), rx, y + 6, { lineBreak: false });
    rx += 100;
  }
  if (rateAmt) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444444")
      .text("Rate Amount:", rx, y + 6, { lineBreak: false });
    rx += 72;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#111111")
      .text(`1 USD = RWF ${parseFloat(rateAmt).toLocaleString()}`, rx, y + 6, { lineBreak: false });
  }

  doc.rect(L, y, R - L, 22).stroke("#CCCCCC");
  return y + 28;
}

// ─── Net salary box (full width) ─────────────────────────────────────────────

function drawNetBox(doc: PDFKit.PDFDocument, label: string, value: string, y: number): number {
  doc.rect(L, y, R - L, 34).fillAndStroke(GREEN, GREEN);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text(label, L + 10, y + 10, { lineBreak: false });
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(YELLOW)
    .text(value, L + 160, y + 9, { width: R - L - 170, align: "right", lineBreak: false });
  doc.font("Helvetica");
  return y + 40;
}

function drawDualNetBox(
  doc: PDFKit.PDFDocument,
  label: string,
  usdVal: string,
  rwfVal: string,
  y: number,
): number {
  doc.rect(L, y, R - L, 46).fillAndStroke(GREEN, GREEN);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text(label, L + 10, y + 8, { lineBreak: false });
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(YELLOW)
    .text(usdVal, L + 160, y + 6, { width: R - L - 170, align: "right", lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#CCFFCC")
    .text(rwfVal, L + 160, y + 26, { width: R - L - 170, align: "right", lineBreak: false });
  doc.font("Helvetica");
  return y + 52;
}

// ─── Footer (pinned to bottom) ────────────────────────────────────────────────

function drawFooter(doc: PDFKit.PDFDocument, isRemittance: boolean) {
  const footerY = doc.page.height - 70;
  doc.moveTo(L, footerY).lineTo(R, footerY).strokeColor(GREEN).lineWidth(1).stroke();
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888888")
    .text(
      `This is a computer-generated ${isRemittance ? "remittance advice" : "payslip"}. No signature required.`,
      L,
      footerY + 8,
      { align: "center", width: W, lineBreak: false },
    );
  doc.fontSize(8).text("For inquiries, contact: info@ganzafrica.org", L, footerY + 20, {
    align: "center",
    width: W,
    lineBreak: false,
  });
  doc
    .fontSize(7)
    .fillColor("#BBBBBB")
    .text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      L,
      footerY + 32,
      { align: "center", width: W, lineBreak: false },
    );
}

// ─── Main PDF generator ───────────────────────────────────────────────────────

export async function generatePayslipPDF(data: PayslipData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const type = data.payroll_type || "rwf";
      const isRemittance = type === "wop_usd" || type === "rwf_wop";
      const docTitle = isRemittance ? "REMITTANCE ADVICE" : "PAYSLIP";

      // Part 1: Header
      drawHeader(doc, docTitle);

      // Part 2: Employee info
      drawEmployeeSection(doc, data);

      // Part 3: Earnings | Deductions table
      let y = drawEarningsDeductionsTable(doc, data);

      // Part 4: Exchange rate row (if applicable)
      y = drawExchangeRateRow(doc, data, y);

      // Part 5: Net salary box
      if (type === "rwf_usd") {
        y = drawDualNetBox(
          doc,
          "Net Salary:",
          fmt(data.net_salary_usd, "USD"),
          fmt(data.net_salary, "RWF"),
          y + 6,
        );
      } else if (type === "rwf" || type === "xof") {
        const netCur = type === "xof" ? "XOF" : "RWF";
        const netLabel = "Net Salary:";
        y = drawNetBox(doc, netLabel, fmt(data.net_salary, netCur), y + 6);
      } else if (type === "wop_usd") {
        y = drawNetBox(doc, "Net Fees:", fmt(data.net_salary, "USD"), y + 6);
      } else if (type === "rwf_wop") {
        y = drawNetBox(doc, "Net Fees:", fmt(data.net_salary, "RWF"), y + 6);
      }

      // Footer — always pinned to bottom
      drawFooter(doc, isRemittance);

      doc.end();
    } catch (error) {
      logger.error("Error generating PDF:", error);
      reject(error);
    }
  });
}

// ─── Upload / signed URL / delete ────────────────────────────────────────────

export async function uploadPayslipToSpaces(
  pdfBuffer: Buffer,
  employeeName: string,
  period: string,
): Promise<{ url: string; key: string }> {
  try {
    const cleanName = employeeName.replace(/[^a-zA-Z0-9]/g, "_");
    const monthMatch = period.match(/(\d{2})\.(\d{2})$/);
    const month = monthMatch
      ? `${monthMatch[1]}-${monthMatch[2]}`
      : period.replace(/[^a-zA-Z0-9-]/g, "_");
    const key = `hr/${cleanName}/${month}/payslip.pdf`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.DO_SPACES_BUCKET,
        Key: key,
        Body: pdfBuffer,
        ACL: "private",
        ContentType: "application/pdf",
        Metadata: { employeeName, period, generatedAt: new Date().toISOString() },
      }),
    );

    const permanentUrl = `${env.DO_SPACES_ENDPOINT.replace(/\/$/, "")}/${env.DO_SPACES_BUCKET}/${key}`;
    logger.info(`Payslip uploaded to Spaces: ${key}`);
    return { url: permanentUrl, key };
  } catch (error) {
    logger.error("Error uploading payslip to Spaces:", error);
    throw error;
  }
}

const MAX_PRESIGN_SECONDS = 7 * 24 * 60 * 60; // S3 SigV4 hard cap

export async function generateSignedPayslipUrl(
  key: string,
  expiresIn: number = 300, // 5 minutes — payslip links go through the token redirect, not raw presigns
): Promise<string> {
  if (expiresIn > MAX_PRESIGN_SECONDS) {
    // Guards the original bug: presigned URLs silently cap at 7 days, so anything longer is a lie.
    throw new Error("presigned URLs cannot exceed 7 days; use a payslip access token instead");
  }
  try {
    const command = new GetObjectCommand({ Bucket: env.DO_SPACES_BUCKET, Key: key });
    const signedUrl = await getSignedUrl(s3Client as any, command as any, { expiresIn });
    logger.info(`Generated signed URL for ${key}, expires in ${expiresIn}s`);
    return signedUrl;
  } catch (error) {
    logger.error("Error generating signed URL:", error);
    throw error;
  }
}

export async function generateAndUploadPayslip(data: PayslipData) {
  try {
    const pdfBuffer = await generatePayslipPDF(data);
    const { url, key } = await uploadPayslipToSpaces(pdfBuffer, data.name, data.payroll_period);
    return { url, key, buffer: pdfBuffer };
  } catch (error) {
    logger.error("Error generating and uploading payslip:", error);
    throw error;
  }
}

export async function deletePayslipFromSpaces(key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: env.DO_SPACES_BUCKET, Key: key }));
    logger.info(`Payslip deleted from Spaces: ${key}`);
  } catch (error) {
    logger.error(`Error deleting payslip from Spaces (${key}):`, error);
    throw error;
  }
}
