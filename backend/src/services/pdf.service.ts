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
import { getFileUrl } from "../middlewares/upload";

const logger = new Logger("PDFService");

// Create S3 client for Digital Ocean Spaces
const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: env.DO_SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

interface PayslipData {
  name: string;
  email: string;
  payroll_period: string;
  date_of_payment: string;
  employee_id?: string;
  employee_tin_number?: string;
  basic_salary: string;
  gross_salary: string;
  net_salary: string;
  deductions?: {
    medical_employee?: string;
    csr_employee?: string;
    maternity_employee?: string;
    tpr?: string;
    cbhi?: string;
  };
}

/**
 * Generate payslip PDF
 */
export async function generatePayslipPDF(data: PayslipData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Brand colors
      const GREEN = "#045F3C";
      const ORANGE = "#EA580C";
      const YELLOW = "#F59E0B";

      // Header with logo and company info
      try {
        // Try to load logo - adjust path based on your setup
        const logoPath = path.join(
          process.cwd(),
          "public",
          "images",
          "log.png",
        );
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 120 });
        }
      } catch (err) {
        logger.warn("Logo not found, skipping");
      }

      // Company name and payslip title on the right
      doc
        .fontSize(22)
        .fillColor(GREEN)
        .text("GANZAFRICA", 200, 50, { align: "right" });

      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("info@ganzafrica.org", 200, 75, { align: "right" });

      doc
        .fontSize(18)
        .fillColor(ORANGE)
        .text("PAYSLIP", 200, 95, { align: "right" });

      // Horizontal line
      doc
        .moveTo(50, 130)
        .lineTo(550, 130)
        .strokeColor(GREEN)
        .lineWidth(2)
        .stroke();

      doc.moveDown(3);

      // Employee Details Box
      doc.y = 150;
      doc.fontSize(14).fillColor(GREEN).text("Employee Information", 50);

      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#000000");

      doc.text(`Name: ${data.name}`, 50);
      doc.text(`Email: ${data.email}`, 50);
      if (data.employee_id) doc.text(`Employee ID: ${data.employee_id}`, 50);
      if (data.employee_tin_number)
        doc.text(`TIN Number: ${data.employee_tin_number}`, 50);
      doc.text(`Period: ${data.payroll_period}`, 50);
      doc.text(
        `Payment Date: ${new Date(data.date_of_payment).toLocaleDateString()}`,
        50,
      );

      doc.moveDown(1.5);

      // Salary Details
      doc.fontSize(14).fillColor(GREEN).text("Salary Breakdown", 50);

      doc.moveDown(0.5);

      // Format currency helper
      const formatCurrency = (value: string) => {
        return `RWF ${parseFloat(value).toLocaleString("en-RW", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      };

      // Salary table
      doc.fontSize(11).fillColor("#000000");

      const startY = doc.y;
      doc.text("Basic Salary:", 50, startY);
      doc.text(formatCurrency(data.basic_salary), 400, startY, {
        width: 150,
        align: "right",
      });

      doc.text("Gross Salary:", 50);
      doc.text(formatCurrency(data.gross_salary), 400, doc.y - 13, {
        width: 150,
        align: "right",
      });

      // Deductions
      if (data.deductions) {
        doc.moveDown(1);
        doc.fontSize(14).fillColor(ORANGE).text("Deductions", 50);
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#000000");

        if (data.deductions.medical_employee) {
          const y = doc.y;
          doc.text("Medical (Employee 7.5%):", 50, y);
          doc.text(formatCurrency(data.deductions.medical_employee), 400, y, {
            width: 150,
            align: "right",
          });
        }

        if (data.deductions.csr_employee) {
          const y = doc.y;
          doc.text("CSR (Employee 6%):", 50, y);
          doc.text(formatCurrency(data.deductions.csr_employee), 400, y, {
            width: 150,
            align: "right",
          });
        }

        if (data.deductions.maternity_employee) {
          const y = doc.y;
          doc.text("Maternity (Employee 0.3%):", 50, y);
          doc.text(formatCurrency(data.deductions.maternity_employee), 400, y, {
            width: 150,
            align: "right",
          });
        }

        if (data.deductions.tpr) {
          const y = doc.y;
          doc.text("TPR (30%):", 50, y);
          doc.text(formatCurrency(data.deductions.tpr), 400, y, {
            width: 150,
            align: "right",
          });
        }

        if (data.deductions.cbhi) {
          const y = doc.y;
          doc.text("CBHI (0.5%):", 50, y);
          doc.text(formatCurrency(data.deductions.cbhi), 400, y, {
            width: 150,
            align: "right",
          });
        }
      }

      doc.moveDown(1.5);

      // Net Salary - highlighted
      doc.rect(50, doc.y, 500, 40).fillAndStroke(GREEN, GREEN);

      doc
        .fontSize(16)
        .fillColor("#FFFFFF")
        .text("Net Salary:", 60, doc.y + 10);

      doc
        .fontSize(18)
        .fillColor(YELLOW)
        .text(formatCurrency(data.net_salary), 400, doc.y - 25, {
          width: 140,
          align: "right",
        });

      // Footer
      doc
        .moveDown(3)
        .fontSize(9)
        .fillColor("#999999")
        .text(
          "This is a computer-generated payslip. No signature required.",
          50,
          doc.page.height - 100,
          { align: "center" },
        );

      doc
        .fontSize(9)
        .text(
          "For inquiries, contact: info@ganzafrica.org",
          50,
          doc.page.height - 85,
          { align: "center" },
        );

      // Footer line
      doc
        .moveTo(50, doc.page.height - 70)
        .lineTo(550, doc.page.height - 70)
        .strokeColor(GREEN)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(8)
        .fillColor("#CCCCCC")
        .text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          50,
          doc.page.height - 60,
          { align: "center" },
        );

      doc.end();
    } catch (error) {
      logger.error("Error generating PDF:", error);
      reject(error);
    }
  });
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
    // Clean employee name for file path
    const cleanName = employeeName.replace(/[^a-zA-Z0-9]/g, "_");

    // Extract month from period (e.g., "01-31.12.25" -> "12-25")
    const monthMatch = period.match(/(\d{2})\.(\d{2})$/);
    const month = monthMatch ? `${monthMatch[1]}-${monthMatch[2]}` : period;

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

    // Store the permanent key, not a signed URL
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
 * @param key - The S3 key of the payslip file
 * @param expiresIn - Expiration time in seconds (default: 7 days)
 */
export async function generateSignedPayslipUrl(
  key: string,
  expiresIn: number = 30 * 24 * 60 * 60, // 30 days default
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
 * Generate and upload payslip
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
