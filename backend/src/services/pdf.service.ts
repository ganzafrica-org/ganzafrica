import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../config/env";
import { Logger } from "../config";

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
  employee_id?: string;
  employee_tin_number?: string;
  // Format type determines layout
  payroll_type?: string; // 'rwf' | 'rwf_usd' | 'wop_usd' | 'xof' | 'rwf_wop'
  currency?: string;
  // Format 1 (RWF / RWF-USD)
  basic_salary?: string;
  gross_salary?: string;
  net_salary?: string;
  net_salary_usd?: string;
  exchange_rate_used?: string;
  deductions?: {
    medical_employee?: string;
    csr_employee?: string;
    maternity_employee?: string;
    tpr?: string;
    cbhi?: string;
  };
  // Format 2 (WOP/USD international)
  gross_usd?: string;
  wop_usd?: string;
  wop_rwf?: string;
  // Format 3 (Burkina Faso XOF)
  housing_allowance?: string;
  function_allowance?: string;
  transport_allowance?: string;
  // Format 4 (RWF withholding)
  wop_rwf_only?: string;
}

// Brand colours
const GREEN = "#045F3C";
const ORANGE = "#EA580C";
const YELLOW = "#F59E0B";

function fmt(value: string | undefined | null, currency = "RWF"): string {
  const num = parseFloat(value || "0");
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function drawHeader(doc: PDFKit.PDFDocument, period: string) {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "log.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 120 });
    }
  } catch {
    logger.warn("Logo not found, skipping");
  }

  doc.fontSize(22).fillColor(GREEN).text("GANZAFRICA", 200, 50, { align: "right" });
  doc.fontSize(10).fillColor("#666666").text("info@ganzafrica.org", 200, 75, { align: "right" });
  doc.fontSize(18).fillColor(ORANGE).text("PAYSLIP", 200, 95, { align: "right" });

  doc.moveTo(50, 130).lineTo(550, 130).strokeColor(GREEN).lineWidth(2).stroke();
  doc.y = 150;
}

function drawEmployeeInfo(
  doc: PDFKit.PDFDocument,
  data: PayslipData,
) {
  doc.fontSize(14).fillColor(GREEN).text("Employee Information", 50);
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#000000");
  doc.text(`Name: ${data.name}`, 50);
  doc.text(`Email: ${data.email}`, 50);
  if (data.employee_id) doc.text(`Employee ID: ${data.employee_id}`, 50);
  if (data.employee_tin_number) doc.text(`TIN Number: ${data.employee_tin_number}`, 50);
  doc.text(`Period: ${data.payroll_period}`, 50);
  if (data.date_of_payment) {
    const d = new Date(data.date_of_payment);
    if (!isNaN(d.getTime())) {
      doc.text(`Payment Date: ${d.toLocaleDateString()}`, 50);
    }
  }
  doc.moveDown(1.5);
}

function drawRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
) {
  const y = doc.y;
  doc.fontSize(11).fillColor("#000000").text(label, 50, y);
  doc.text(value, 400, y, { width: 150, align: "right" });
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, color = GREEN) {
  doc.fontSize(14).fillColor(color).text(title, 50);
  doc.moveDown(0.5);
}

function drawNetBox(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.moveDown(1.5);
  doc.rect(50, doc.y, 500, 40).fillAndStroke(GREEN, GREEN);
  doc.fontSize(16).fillColor("#FFFFFF").text(label, 60, doc.y + 10);
  doc.fontSize(18).fillColor(YELLOW).text(value, 400, doc.y - 25, { width: 140, align: "right" });
}

// Shows primary amount (USD) large and RWF equivalent smaller below — for dual-currency employees
function drawDualNetBox(doc: PDFKit.PDFDocument, primaryValue: string, secondaryValue: string) {
  doc.moveDown(1.5);
  const boxY = doc.y;
  doc.rect(50, boxY, 500, 55).fillAndStroke(GREEN, GREEN);
  doc.fontSize(14).fillColor("#FFFFFF").text("Net Salary:", 60, boxY + 8);
  doc.fontSize(18).fillColor(YELLOW).text(primaryValue, 300, boxY + 5, { width: 240, align: "right" });
  doc.fontSize(11).fillColor("#CCFFCC").text(`≈ ${secondaryValue}`, 300, boxY + 30, { width: 240, align: "right" });
  doc.y = boxY + 60;
}

function drawFooter(doc: PDFKit.PDFDocument) {
  doc.fontSize(9).fillColor("#999999").text(
    "This is a computer-generated payslip. No signature required.",
    50,
    doc.page.height - 100,
    { align: "center" },
  );
  doc.fontSize(9).text(
    "For inquiries, contact: info@ganzafrica.org",
    50,
    doc.page.height - 85,
    { align: "center" },
  );
  doc.moveTo(50, doc.page.height - 70).lineTo(550, doc.page.height - 70).strokeColor(GREEN).lineWidth(1).stroke();
  doc.fontSize(8).fillColor("#CCCCCC").text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    50,
    doc.page.height - 60,
    { align: "center" },
  );
}

/**
 * Generate payslip PDF — routes to correct layout based on payroll_type
 */
export async function generatePayslipPDF(data: PayslipData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const type = data.payroll_type || "rwf";

      drawHeader(doc, data.payroll_period);
      drawEmployeeInfo(doc, data);

      if (type === "rwf" || type === "rwf_usd") {
        renderFormat1(doc, data, type === "rwf_usd");
      } else if (type === "wop_usd") {
        renderFormat2(doc, data);
      } else if (type === "xof") {
        renderFormat3(doc, data);
      } else if (type === "rwf_wop") {
        renderFormat4(doc, data);
      } else {
        renderFormat1(doc, data, false);
      }

      drawFooter(doc);
      doc.end();
    } catch (error) {
      logger.error("Error generating PDF:", error);
      reject(error);
    }
  });
}

/**
 * Format 1: Rwanda RWF staff (or RWF with USD net for USD employees)
 */
function renderFormat1(
  doc: PDFKit.PDFDocument,
  data: PayslipData,
  isUsd: boolean,
) {
  drawSectionTitle(doc, "Salary Breakdown");

  drawRow(doc, "Basic Salary:", fmt(data.basic_salary, "RWF"));
  drawRow(doc, "Gross Salary:", fmt(data.gross_salary, "RWF"));

  if (data.deductions) {
    doc.moveDown(1);
    drawSectionTitle(doc, "Deductions", ORANGE);

    if (data.deductions.medical_employee)
      drawRow(doc, "Medical (Employee 7.5%):", fmt(data.deductions.medical_employee, "RWF"));
    if (data.deductions.csr_employee)
      drawRow(doc, "CSR (Employee 6%):", fmt(data.deductions.csr_employee, "RWF"));
    if (data.deductions.maternity_employee)
      drawRow(doc, "Maternity (Employee 0.3%):", fmt(data.deductions.maternity_employee, "RWF"));
    if (data.deductions.tpr)
      drawRow(doc, "TPR (30%):", fmt(data.deductions.tpr, "RWF"));
    if (data.deductions.cbhi)
      drawRow(doc, "CBHI (0.5%):", fmt(data.deductions.cbhi, "RWF"));
  }

  if (isUsd && data.exchange_rate_used) {
    doc.moveDown(1);
    drawSectionTitle(doc, "Exchange Rate Info");
    drawRow(doc, "NCBA Rate Used:", `1 USD = RWF ${parseFloat(data.exchange_rate_used).toLocaleString()}`);
    // net_salary holds RWF equivalent, net_salary_usd holds USD amount
    const netRwf = data.net_salary;
    const netUsd = data.net_salary_usd;
    drawDualNetBox(doc, fmt(netUsd, "USD"), fmt(netRwf, "RWF"));
  } else {
    drawNetBox(doc, "Net Salary:", fmt(data.net_salary, "RWF"));
  }
}

/**
 * Format 2: International WOP, USD net
 * Shows: USD Total (gross), WOP USD, WOP RWF, Rate used, Net USD
 */
function renderFormat2(doc: PDFKit.PDFDocument, data: PayslipData) {
  drawSectionTitle(doc, "Salary Breakdown");

  drawRow(doc, "Gross (USD):", fmt(data.gross_usd, "USD"));

  doc.moveDown(1);
  drawSectionTitle(doc, "Withholding Tax (WOP)", ORANGE);
  drawRow(doc, "WOP (USD):", fmt(data.wop_usd, "USD"));
  drawRow(doc, "WOP (RWF):", fmt(data.wop_rwf, "RWF"));

  if (data.exchange_rate_used) {
    doc.moveDown(1);
    drawSectionTitle(doc, "Exchange Rate");
    drawRow(doc, "Rate Used:", `1 USD = RWF ${parseFloat(data.exchange_rate_used).toLocaleString()}`);
  }

  // Compute RWF equivalent: net_usd × rate
  const netUsd = parseFloat(data.net_salary || "0");
  const rate = parseFloat(data.exchange_rate_used || "0");
  const netRwf = rate > 0 ? (netUsd * rate).toFixed(2) : undefined;

  if (netRwf) {
    drawDualNetBox(doc, fmt(data.net_salary, "USD"), fmt(netRwf, "RWF"));
  } else {
    drawNetBox(doc, "Net Salary:", fmt(data.net_salary, "USD"));
  }
}

/**
 * Format 3: Burkina Faso XOF
 * Shows: Basic (XOF), Housing allowance, Function allowance, Transport allowance, Gross = Net (XOF)
 */
function renderFormat3(doc: PDFKit.PDFDocument, data: PayslipData) {
  drawSectionTitle(doc, "Salary Breakdown");

  drawRow(doc, "Basic Salary:", fmt(data.basic_salary, "XOF"));

  doc.moveDown(1);
  drawSectionTitle(doc, "Allowances");
  if (data.housing_allowance)
    drawRow(doc, "Housing Allowance (20%):", fmt(data.housing_allowance, "XOF"));
  if (data.function_allowance)
    drawRow(doc, "Function Allowance (5%):", fmt(data.function_allowance, "XOF"));
  if (data.transport_allowance)
    drawRow(doc, "Transport Allowance (5%):", fmt(data.transport_allowance, "XOF"));

  drawNetBox(doc, "Gross / Net Salary:", fmt(data.gross_salary, "XOF"));
}

/**
 * Format 4: Rwanda RWF with withholding tax
 * Shows: Gross (RWF), WOP/Withholding (RWF), Net (RWF)
 */
function renderFormat4(doc: PDFKit.PDFDocument, data: PayslipData) {
  drawSectionTitle(doc, "Salary Breakdown");

  drawRow(doc, "Gross Salary:", fmt(data.gross_salary, "RWF"));

  doc.moveDown(1);
  drawSectionTitle(doc, "Deductions", ORANGE);
  drawRow(doc, "Withholding Tax (WOP):", fmt(data.wop_rwf, "RWF"));

  drawNetBox(doc, "Net Salary:", fmt(data.net_salary, "RWF"));
}

/**
 * Upload PDF to Digital Ocean Spaces
 */
export async function uploadPayslipToSpaces(
  pdfBuffer: Buffer,
  employeeName: string,
  period: string,
): Promise<{ url: string; key: string }> {
  try {
    const cleanName = employeeName.replace(/[^a-zA-Z0-9]/g, "_");
    const monthMatch = period.match(/(\d{2})\.(\d{2})$/);
    const month = monthMatch ? `${monthMatch[1]}-${monthMatch[2]}` : period.replace(/[^a-zA-Z0-9-]/g, "_");
    const key = `hr/${cleanName}/${month}/payslip.pdf`;

    const command = new PutObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key: key,
      Body: pdfBuffer,
      ACL: "private",
      ContentType: "application/pdf",
      Metadata: {
        employeeName,
        period,
        generatedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const permanentUrl = `${env.DO_SPACES_ENDPOINT.replace(/\/$/, "")}/${env.DO_SPACES_BUCKET}/${key}`;
    logger.info(`Payslip uploaded to Spaces: ${key}`);
    return { url: permanentUrl, key };
  } catch (error) {
    logger.error("Error uploading payslip to Spaces:", error);
    throw error;
  }
}

/**
 * Generate a signed URL for accessing a private payslip
 */
export async function generateSignedPayslipUrl(
  key: string,
  expiresIn: number = 30 * 24 * 60 * 60,
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.DO_SPACES_BUCKET,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    logger.info(`Generated signed URL for ${key}, expires in ${expiresIn}s`);
    return signedUrl;
  } catch (error) {
    logger.error("Error generating signed URL:", error);
    throw error;
  }
}

/**
 * Generate and upload payslip PDF
 */
export async function generateAndUploadPayslip(data: PayslipData) {
  try {
    const pdfBuffer = await generatePayslipPDF(data);
    const { url, key } = await uploadPayslipToSpaces(
      pdfBuffer,
      data.name,
      data.payroll_period,
    );
    return { url, key, buffer: pdfBuffer };
  } catch (error) {
    logger.error("Error generating and uploading payslip:", error);
    throw error;
  }
}
