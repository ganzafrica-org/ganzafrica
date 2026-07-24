/**
 * LCM-01 routes. Uses the `processes:manage` / `processes:read_own` permissions already present in
 * the RBAC seed.
 *
 * Reads and task actions gate on `authenticate` only: eligibility is a relationship (subject,
 * assignee, or manager) that `requirePermission` cannot express, so the service resolves it and
 * returns 403. Anything that manages templates or other people's processes takes the permission.
 */
import { Router } from "express";
import { authenticate, requirePermission } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";
import * as c from "@/controllers/hr/process.controller";
import * as v from "@/validations/hr/process.validation";

const router: Router = Router();

const manage = [authenticate, requirePermission("processes:manage")];

// Self-service — the onboardee's own view and duties.
router.get("/me/process", authenticate, c.getMyProcess);
router.get("/me/tasks", authenticate, c.listMyTasks);

// Task actions; the service checks assignee-or-HR.
router.post(
  "/process-tasks/:id/complete",
  authenticate,
  validate(v.completeTaskSchema),
  c.completeTask,
);
router.post("/process-tasks/:id/skip", authenticate, validate(v.skipTaskSchema), c.skipTask);
router.patch("/process-tasks/:id", ...manage, validate(v.patchTaskSchema), c.patchTask);

// Instances.
router.get("/processes", ...manage, validate(v.listProcessesSchema), c.listProcesses);
router.get("/processes/:id", authenticate, validate(v.idSchema), c.getProcess);
router.post("/processes/:id/cancel", ...manage, validate(v.idSchema), c.cancelProcess);
router.post("/employees/:id/processes", ...manage, validate(v.startProcessSchema), c.startProcess);

// Templates.
router.get("/process-templates", ...manage, validate(v.listTemplatesSchema), c.listTemplates);
router.post("/process-templates", ...manage, validate(v.createTemplateSchema), c.createTemplate);
router.get("/process-templates/:id", ...manage, validate(v.idSchema), c.getTemplate);
router.patch(
  "/process-templates/:id",
  ...manage,
  validate(v.updateTemplateSchema),
  c.updateTemplate,
);
// Deactivate rather than delete: instances reference the template, and "which checklist did this
// person get" has to stay answerable.
router.delete("/process-templates/:id", ...manage, validate(v.idSchema), c.deactivateTemplate);
router.post(
  "/process-templates/:id/tasks",
  ...manage,
  validate(v.addTemplateTaskSchema),
  c.addTemplateTask,
);
router.delete(
  "/process-templates/:id/tasks/:taskId",
  ...manage,
  validate(v.templateTaskIdSchema),
  c.removeTemplateTask,
);

export default router;
