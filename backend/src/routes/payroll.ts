import express from "express";
import multer from "multer";
import * as payrollController from "../controllers/hr/payroll.controller";
import { authenticate } from "../middlewares";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll and payslip management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payroll:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         payroll_period:
 *           type: string
 *         date_of_payment:
 *           type: string
 *           format: date
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         basic_salary:
 *           type: string
 *         net_salary:
 *           type: string
 *         email_sent:
 *           type: boolean
 *         payslip_file_url:
 *           type: string
 */

// Configure multer for CSV uploads
const upload = multer({
  dest: "uploads/temp/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /payroll/upload-csv:
 *   post:
 *     summary: Upload and parse payroll CSV file
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CSV processed successfully
 *       400:
 *         description: Invalid CSV file
 */
router.post("/upload-csv", upload.single("file"), payrollController.uploadPayrollCSV);

/**
 * @swagger
 * /payroll:
 *   post:
 *     summary: Create payroll records (single or bulk)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrolls:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Payroll'
 *     responses:
 *       201:
 *         description: Payroll created successfully
 */
router.post("/", payrollController.createPayrolls);

/**
 * @swagger
 * /payroll:
 *   get:
 *     summary: Get all payrolls with filters and pagination
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: payroll_period
 *         schema:
 *           type: string
 *       - in: query
 *         name: email_sent
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of payrolls
 */
router.get("/", payrollController.getPayrolls);

/**
 * @swagger
 * /payroll/{id}:
 *   get:
 *     summary: Get single payroll by ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payroll details
 *       404:
 *         description: Payroll not found
 */
router.get("/:id", payrollController.getPayrollById);

/**
 * @swagger
 * /payroll/{id}/signed-url:
 *   get:
 *     summary: Get signed URL for viewing payslip
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Signed URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 expires_in:
 *                   type: integer
 *       404:
 *         description: Payroll or payslip file not found
 */
router.get("/:id/signed-url", payrollController.getPayslipSignedUrl);

/**
 * @swagger
 * /payroll/{id}:
 *   put:
 *     summary: Update payroll
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payroll'
 *     responses:
 *       200:
 *         description: Payroll updated
 */
router.put("/:id", payrollController.updatePayroll);

/**
 * @swagger
 * /payroll/{id}:
 *   delete:
 *     summary: Delete payroll
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payroll deleted
 */
router.delete("/:id", payrollController.deletePayroll);

/**
 * @swagger
 * /payroll/send-emails:
 *   post:
 *     summary: Send payslip emails (batch)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payroll_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Email sending initiated
 */
router.post("/send-emails", payrollController.sendPayslipEmails);

export default router;
