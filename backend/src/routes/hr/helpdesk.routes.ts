import { Router } from "express";
import { validate } from "../../middlewares";
import * as helpdeskController from "../../controllers/hr/helpdesk.controller";
import * as helpdeskValidation from "../../validations/hr/helpdesk.validation";

const router: Router = Router();

router.post("/", validate(helpdeskValidation.createTicketSchema), helpdeskController.createTicket);
router.get("/", validate(helpdeskValidation.listTicketsSchema), helpdeskController.listTickets);
router.get("/:id", validate(helpdeskValidation.ticketIdParamSchema), helpdeskController.getTicket);
router.patch(
  "/:id/answer",
  validate(helpdeskValidation.answerTicketSchema),
  helpdeskController.answerTicket,
);
router.patch(
  "/:id",
  validate(helpdeskValidation.updateTicketSchema),
  helpdeskController.updateTicket,
);
router.delete(
  "/:id",
  validate(helpdeskValidation.ticketIdParamSchema),
  helpdeskController.deleteTicket,
);

export default router;
