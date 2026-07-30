/**
 * MOD-08 helpdesk routes, mounted at /hr/helpdesk.
 *
 * Reads and comments gate on `authenticate` only: eligibility is a relationship (requester,
 * assignee, or triage) the middleware cannot express, so the service resolves it and 403s.
 * Triage actions (list, transition) take helpdesk:manage.
 */
import { Router } from "express";
import { authenticate, requirePermission } from "../../middlewares";
import { validate } from "../../middlewares/validation.middleware";
import * as c from "../../controllers/hr/helpdesk.controller";
import * as v from "../../validations/hr/helpdesk.validation";

const router: Router = Router();

router.use(authenticate);

const manage = requirePermission("helpdesk:manage");
const createOrManage = requirePermission("helpdesk:create", "helpdesk:manage");

router.post("/", createOrManage, validate(v.createTicketSchema), c.createTicket);
router.get("/", manage, validate(v.listTicketsSchema), c.listTickets);

router.get("/:id", authenticate, validate(v.ticketIdParamSchema), c.getTicket);
router.patch("/:id", manage, validate(v.transitionTicketSchema), c.transitionTicket);
router.post("/:id/reopen", authenticate, validate(v.ticketIdParamSchema), c.reopenTicket);
router.post("/:id/comments", authenticate, validate(v.addCommentSchema), c.addComment);

export default router;
