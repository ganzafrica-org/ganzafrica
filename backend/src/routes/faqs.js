"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faqs_1 = require("../controllers/faqs");
const middlewares_1 = require("../middlewares");
const faqs_2 = require("../validations/faqs");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: Frequently Asked Questions management endpoints
 */
// FAQs routes
router.post("/", (0, middlewares_1.validate)(faqs_2.faqValidation.createFaqSchema), faqs_1.faqController.createFaq);
router.get("/", faqs_1.faqController.listFaqs);
router.get("/:id", (0, middlewares_1.validate)(faqs_2.faqValidation.getFaqSchema), faqs_1.faqController.getFaqById);
router.put("/:id", (0, middlewares_1.validate)(faqs_2.faqValidation.updateFaqSchema), faqs_1.faqController.updateFaq);
router.delete("/:id", (0, middlewares_1.validate)(faqs_2.faqValidation.deleteFaqSchema), faqs_1.faqController.deleteFaq);
exports.default = router;
