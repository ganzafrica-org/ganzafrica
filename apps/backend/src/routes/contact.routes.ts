import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route for submitting contact form
router.post('/', ContactController.submit);

// Admin routes (require authentication)
router.use(authenticate);

// Get all contacts (admin only)
router.get('/', ContactController.getAll);

// Get a single contact (admin only)
router.get('/:id', ContactController.getById);

// Delete a contact (admin only)
router.delete('/:id', ContactController.delete);

export default router; 