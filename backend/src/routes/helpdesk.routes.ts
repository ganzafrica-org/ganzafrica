import { Router } from "express";
import { authenticate, requireRole, validate } from "@/middlewares";
import * as helpdeskController from "@/controllers/helpdesk.controller";
import * as helpdeskValidation from "@/validations/helpdesk.validation";

const router: Router = Router();

router.use(authenticate);

router.get("/", validate(helpdeskValidation.listTicketsSchema), helpdeskController.listTickets);
router.get("/:id", validate(helpdeskValidation.ticketIdParamSchema), helpdeskController.getTicket);

router.post(
  "/",
  requireRole("EMPLOYEE"),
  validate(helpdeskValidation.createTicketSchema),
  helpdeskController.createTicket,
);

router.patch(
  "/:id/assign",
  requireRole("IT"),
  validate(helpdeskValidation.assignTicketSchema),
  helpdeskController.assignTicket,
);

router.patch(
  "/:id/answer",
  requireRole("IT"),
  validate(helpdeskValidation.answerTicketSchema),
  helpdeskController.answerTicket,
);

router.patch(
  "/:id/status",
  requireRole("IT"),
  validate(helpdeskValidation.updateTicketStatusSchema),
  helpdeskController.updateTicketStatus,
);

router.delete(
  "/:id",
  requireRole("EMPLOYEE"),
  validate(helpdeskValidation.ticketIdParamSchema),
  helpdeskController.deleteTicket,
);

export default router;

