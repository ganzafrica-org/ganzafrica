import { Logger } from "../config";
import * as emailService from "./email.service";
import * as payrollService from "./payroll.service";
import * as pdfService from "./pdf.service";
import env from "../config/env";

const logger = new Logger("PayrollEmailService");

const BATCH_SIZE = 5; // Send emails in batches of 5
const BATCH_DELAY = 2000; // 2 seconds delay between batches

/**
 * Send payslip email to a single employee
 */
async function sendPayslipEmail(
  payrollId: number,
  userEmail: string,
  userName: string,
  payslipUrl: string,
  period: string,
): Promise<boolean> {
  try {
    const subject = `Your Payslip for ${period} - GanzAfrica`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #045F3C; padding: 20px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0;">GanzAfrica</h1>
        </div>

        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #045F3C;">Dear ${userName},</h2>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your payslip for the period <strong>${period}</strong> is now available.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You can view and download your payslip by clicking the button below:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${payslipUrl}"
               style="background-color: #EA580C; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 5px; font-weight: bold;
                      display: inline-block;">
              View Payslip
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">
            ${payslipUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 14px; color: #666;">
            If you have any questions regarding your payslip, please contact the HR department at
            <a href="mailto:info@ganzafrica.org" style="color: #045F3C;">info@ganzafrica.org</a>
          </p>
        </div>

        <div style="background-color: #045F3C; padding: 15px; text-align: center;">
          <p style="color: #FFFFFF; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} GanzAfrica. All rights reserved.
          </p>
          <p style="color: #FFFFFF; margin: 5px 0 0 0; font-size: 12px;">
            <a href="mailto:info@ganzafrica.org" style="color: #F59E0B; text-decoration: none;">
              info@ganzafrica.org
            </a>
          </p>
        </div>
      </div>
    `;

    await emailService.sendEmail(userEmail, subject, html);

    // Mark email as sent
    await payrollService.markEmailSent(payrollId, true);

    logger.info(`Payslip email sent to ${userEmail} for period ${period}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send payslip email to ${userEmail}:`, error);

    // Mark email as failed with error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await payrollService.markEmailSent(payrollId, false, errorMessage);

    return false;
  }
}

/**
 * Generate payslip PDF and send email for a single payroll
 */
export async function generateAndSendPayslip(
  payrollId: number,
): Promise<boolean> {
  try {
    const payrollData = await payrollService.getPayrollById(payrollId);

    if (!payrollData) {
      throw new Error(`Payroll ${payrollId} not found`);
    }

    const { payroll, user } = payrollData;

    // Check if payslip already generated
    let payslipUrl = payroll.payslip_file_url;
    let payslipKey = payroll.payslip_file_key;

    if (!payslipUrl) {
      // Generate PDF
      const pdfData = {
        name: payroll.name,
        email: payroll.email,
        payroll_period: payroll.payroll_period,
        date_of_payment: payroll.date_of_payment.toString(),
        employee_id: payroll.employee_id || undefined,
        employee_tin_number: payroll.employee_tin_number || undefined,
        basic_salary: payroll.basic_salary,
        gross_salary: payroll.gross_salary,
        net_salary: payroll.net_salary,
        deductions: {
          medical_employee: payroll.medical_employee || undefined,
          csr_employee: payroll.csr_employee || undefined,
          maternity_employee: payroll.maternity_employee || undefined,
          tpr: payroll.tpr || undefined,
          cbhi: payroll.cbhi || undefined,
        },
      };

      const result = await pdfService.generateAndUploadPayslip(pdfData);
      payslipUrl = result.url;
      payslipKey = result.key;

      // Update payroll with file info
      await payrollService.updatePayslipFile(payrollId, payslipUrl, payslipKey);
    }

    if (!payslipKey) {
      throw new Error("Payslip key not found");
    }

    // Generate signed URL for email (7 days expiration)
    const signedUrl = await pdfService.generateSignedPayslipUrl(
      payslipKey,
      7 * 24 * 60 * 60,
    );

    // Send email with signed URL
    const sent = await sendPayslipEmail(
      payrollId,
      user?.email || payroll.email,
      payroll.name,
      signedUrl,
      payroll.payroll_period,
    );

    return sent;
  } catch (error) {
    logger.error(
      `Error generating and sending payslip for payroll ${payrollId}:`,
      error,
    );
    return false;
  }
}

/**
 * Send payslips in batches to avoid overwhelming the email server
 */
export async function sendPayslipsBatch(payrollIds: number[]): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: Array<{ payrollId: number; success: boolean; error?: string }>;
}> {
  const results: Array<{
    payrollId: number;
    success: boolean;
    error?: string;
  }> = [];
  let successful = 0;
  let failed = 0;

  logger.info(`Starting batch payslip send for ${payrollIds.length} payrolls`);

  // Process in batches
  for (let i = 0; i < payrollIds.length; i += BATCH_SIZE) {
    const batch = payrollIds.slice(i, i + BATCH_SIZE);

    logger.info(
      `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} payslips`,
    );

    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map((payrollId) => generateAndSendPayslip(payrollId)),
    );

    // Collect results
    batchResults.forEach((result, index) => {
      const payrollId = batch[index];

      if (result.status === "fulfilled" && result.value) {
        successful++;
        results.push({ payrollId, success: true });
      } else {
        failed++;
        const error =
          result.status === "rejected"
            ? result.reason?.message
            : "Failed to send";
        results.push({ payrollId, success: false, error });
      }
    });

    // Delay between batches (except for the last batch)
    if (i + BATCH_SIZE < payrollIds.length) {
      logger.info(`Waiting ${BATCH_DELAY}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
    }
  }

  logger.info(
    `Batch send complete: ${successful} successful, ${failed} failed`,
  );

  return {
    total: payrollIds.length,
    successful,
    failed,
    results,
  };
}

/**
 * Send all pending payslips (those with PDFs but email not sent)
 */
export async function sendPendingPayslips(limit = 50): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  try {
    const pendingPayrolls = await payrollService.getPendingEmailPayrolls(limit);

    if (pendingPayrolls.length === 0) {
      logger.info("No pending payslips to send");
      return { total: 0, successful: 0, failed: 0 };
    }

    const payrollIds = pendingPayrolls.map((p) => p.payroll.id);
    const result = await sendPayslipsBatch(payrollIds);

    return {
      total: result.total,
      successful: result.successful,
      failed: result.failed,
    };
  } catch (error) {
    logger.error("Error sending pending payslips:", error);
    throw error;
  }
}
