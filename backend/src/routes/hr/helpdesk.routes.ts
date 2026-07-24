import { Router } from "express";
import { validate, authenticate, requirePermission } from "../../middlewares";
import * as helpdeskController from "../../controllers/hr/helpdesk.controller";
import * as helpdeskValidation from "../../validations/hr/helpdesk.validation";

const router: Router = Router();

const manage = requirePermission("helpdesk:manage");
const createOrManage = requirePermission("helpdesk:create", "helpdesk:manage");

router.use(authenticate);

router.post(
  "/",
  createOrManage,
  validate(helpdeskValidation.createTicketSchema),
  helpdeskController.createTicket,
);
router.get(
  "/",
  createOrManage,
  validate(helpdeskValidation.listTicketsSchema),
  helpdeskController.listTickets,
);
router.get(
  "/:id",
  createOrManage,
  validate(helpdeskValidation.ticketIdParamSchema),
  helpdeskController.getTicket,
);
router.patch(
  "/:id/answer",
  manage,
  validate(helpdeskValidation.answerTicketSchema),
  helpdeskController.answerTicket,
);
router.patch(
  "/:id",
  manage,
  validate(helpdeskValidation.updateTicketSchema),
  helpdeskController.updateTicket,
);
router.delete(
  "/:id",
  manage,
  validate(helpdeskValidation.ticketIdParamSchema),
  helpdeskController.deleteTicket,
);

export default router;
