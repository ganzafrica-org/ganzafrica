/**
 * @swagger
 * components:
 *   schemas:
 *     HrLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     HrTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/HrEmployee'
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *     HrEmployee:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [EMPLOYEE, IT, HR]
 *         status:
 *           type: string
 *           enum: [ACTIVE, ON_LEAVE, INACTIVE]
 *         department:
 *           type: string
 *         position:
 *           type: string
 *         location:
 *           type: string
 *         joinDate:
 *           type: string
 *           format: date-time
 *     HrContract:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         salary:
 *           type: string
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, TERMINATED]
 *         notes:
 *           type: string
 *           nullable: true
 *     HrLeave:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [SICK, ANNUAL, MATERNITY, PATERNITY, UNPAID, OTHER]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *         reason:
 *           type: string
 *           nullable: true
 *         approvedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *     HrPayroll:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         month:
 *           type: integer
 *         year:
 *           type: integer
 *         basicSalary:
 *           type: string
 *         allowances:
 *           type: string
 *         deductions:
 *           type: string
 *         netSalary:
 *           type: string
 *         status:
 *           type: string
 *           enum: [DRAFT, PAID, CANCELLED]
 *         paymentDate:
 *           type: string
 *           format: date
 *           nullable: true
 *     HrPolicy:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         fileUrl:
 *           type: string
 *           nullable: true
 *         version:
 *           type: string
 *         effectiveDate:
 *           type: string
 *           format: date
 *     HrAsset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         serialNumber:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [AVAILABLE, ASSIGNED, UNDER_REPAIR, RETIRED]
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           nullable: true
 *     HrHelpdeskTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         status:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *         category:
 *           type: string
 *         employeeId:
 *           type: string
 *           format: uuid
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           nullable: true
 */
