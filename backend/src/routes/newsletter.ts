import { Router } from "express";
import { contactController } from "../controllers/contact";
import { validate } from "../middlewares";
import { contactValidation } from "../validations/contact";

const router: Router = Router();

router.post(
  "/subscribe",
  validate(contactValidation.newsletterSubscribeSchema),
  contactController.subscribeNewsletter
);

router.post(
  "/unsubscribe/:id",
  validate(contactValidation.newsletterUnsubscribeSchema),
  contactController.unsubscribeNewsletter
);
router.get(
    "/subscribers",
    validate(contactValidation.listNewsletterSubscribersSchema),
    contactController.listNewsletterSubscribers
  );

router.delete(
    "/subscribers/:id",
    validate(contactValidation.newsletterUnsubscribeSchema),
    contactController.deleteNewsletterSubscriber
  );

export default router;