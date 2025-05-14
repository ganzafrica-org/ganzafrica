"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testimonial_controller_1 = require("../controllers/testimonial.controller");
const middlewares_1 = require("../middlewares");
const testimonials_validation_1 = require("../validations/testimonials.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Testimonial management endpoints
 */
// All routes require authentication
// Testimonial routes
router.post("/", (0, middlewares_1.validate)(testimonials_validation_1.testimonialValidation.createTestimonialSchema), testimonial_controller_1.testimonialController.createTestimonial);
router.get("/", testimonial_controller_1.testimonialController.listTestimonials);
router.get("/:id", (0, middlewares_1.validate)(testimonials_validation_1.testimonialValidation.getTestimonialSchema), testimonial_controller_1.testimonialController.getTestimonialById);
router.put("/:id", (0, middlewares_1.validate)(testimonials_validation_1.testimonialValidation.updateTestimonialSchema), testimonial_controller_1.testimonialController.updateTestimonial);
router.delete("/:id", (0, middlewares_1.validate)(testimonials_validation_1.testimonialValidation.deleteTestimonialSchema), testimonial_controller_1.testimonialController.deleteTestimonial);
exports.default = router;
