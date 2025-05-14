"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_1 = require("../controllers/contact");
const middlewares_1 = require("../middlewares");
const contact_2 = require("../validations/contact");
const router = (0, express_1.Router)();
// Public routes
router.post("/", (0, middlewares_1.validate)(contact_2.contactValidation.createContactSchema), contact_1.contactController.createContact);
// Protected routes
router.get("/", middlewares_1.authenticate, (0, middlewares_1.validate)(contact_2.contactValidation.listContactsSchema), contact_1.contactController.listContacts);
router.get("/:id", middlewares_1.authenticate, (0, middlewares_1.validate)(contact_2.contactValidation.getContactSchema), contact_1.contactController.getContactById);
router.put("/:id", (0, middlewares_1.validate)(contact_2.contactValidation.updateContactSchema), contact_1.contactController.updateContact);
router.delete("/:id", middlewares_1.authenticate, (0, middlewares_1.validate)(contact_2.contactValidation.deleteContactSchema), contact_1.contactController.deleteContact);
exports.default = router;
