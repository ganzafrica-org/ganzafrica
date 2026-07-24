import { Router } from "express";
import { faqController } from "../controllers/faqs";
import { validate, authenticate, authorize } from "../middlewares";
import { faqValidation } from "../validations/faqs";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: Frequently Asked Questions management endpoints
 */

// FAQs routes
router.post("/", validate(faqValidation.createFaqSchema), faqController.createFaq);

router.get("/", faqController.listFaqs);

router.get("/:id", validate(faqValidation.getFaqSchema), faqController.getFaqById);

router.put("/:id", validate(faqValidation.updateFaqSchema), faqController.updateFaq);

router.delete("/:id", validate(faqValidation.deleteFaqSchema), faqController.deleteFaq);

export default router;
