"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partner_controller_1 = require("../controllers/partner.controller");
const middlewares_1 = require("../middlewares");
const partners_validation_1 = require("../validations/partners.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Partner management endpoints
 */
// All routes require authentication
// router.use(authenticate);
// Partner routes
router.post("/", (0, middlewares_1.validate)(partners_validation_1.partnerValidation.createPartnerSchema), partner_controller_1.partnerController.createPartner);
router.get("/", partner_controller_1.partnerController.listPartners);
router.get("/:id", (0, middlewares_1.validate)(partners_validation_1.partnerValidation.getPartnerSchema), partner_controller_1.partnerController.getPartnerById);
router.put("/:id", (0, middlewares_1.validate)(partners_validation_1.partnerValidation.updatePartnerSchema), partner_controller_1.partnerController.updatePartner);
router.delete("/:id", (0, middlewares_1.validate)(partners_validation_1.partnerValidation.deletePartnerSchema), partner_controller_1.partnerController.deletePartner);
exports.default = router;
