import { Router } from "express";
import { contactController } from "../controllers/contact";
import { validate, authenticate } from "../middlewares";
import { contactValidation } from "../validations/contact";

const router: Router = Router();

// Public routes
router.post(
  "/",
  validate(contactValidation.createContactSchema),
  contactController.createContact
);

// Protected routes
router.get(
  "/",
  authenticate,
  validate(contactValidation.listContactsSchema),
  contactController.listContacts
);

router.get(
  "/:id",
  authenticate,
  validate(contactValidation.getContactSchema),
  contactController.getContactById
);

router.put(
  "/:id",
  validate(contactValidation.updateContactSchema),
  contactController.updateContact
);

router.delete(
  "/:id",
  authenticate,
  validate(contactValidation.deleteContactSchema),
  contactController.deleteContact
);

export default router;