import { Request, Response } from "express";
import { contactService } from "../services/contact";
import { AppError } from "../middlewares";
import { constants, Logger } from "../config";

const logger = new Logger("ContactController");

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Submit a new contact form message
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export const createContact = async (req: Request, res: Response) => {
  try {
    const contactData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
      location: req.body.location,
    };

    const contact = await contactService.createContact(contactData);

    res.status(201).json({
      message: "Contact form submitted successfully",
      contact,
    });
  } catch (error) {
    logger.error("Create contact error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Contact Submission Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Contact Submission Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: List all contact form submissions
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter contacts by status
 *       - in: query
 *         name: is_resolved
 *         schema:
 *           type: boolean
 *         description: Filter contacts by resolution status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter contacts by location
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by (defaults to created_at)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc, defaults to desc)
 *     responses:
 *       200:
 *         description: List of contact form submissions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listContacts = async (req: Request, res: Response) => {
  try {
    const status = req.query.status?.toString();
    const isResolved = req.query.is_resolved 
      ? req.query.is_resolved.toString() === 'true' 
      : undefined;
    const location = req.query.location?.toString();
    
    // Get sort parameters with defaults
    const sortBy = req.query.sort_by?.toString() || 'created_at';
    const sortOrder = req.query.sort_order?.toString() || 'desc';

    // Pass filtering and sorting parameters to service
    const contacts = await contactService.listContacts(
      status, 
      isResolved, 
      location, 
      sortBy, 
      sortOrder
    );

    res.status(200).json({ contacts });
  } catch (error) {
    logger.error("List contacts error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Contact Listing Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Contact Listing Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get contact form submission by ID
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact form submission found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export const getContactById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const contact = await contactService.getContactById(id);

    res.status(200).json({ contact });
  } catch (error) {
    logger.error(`Get contact error: ${req.params.id}`, error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Contact Retrieval Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Contact Retrieval Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Update a contact form submission
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               is_resolved:
 *                 type: boolean
 *               responded_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Contact form submission updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export const updateContact = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updateData = {
      status: req.body.status,
      is_resolved: req.body.is_resolved,
      responded_at: req.body.responded_at ? new Date(req.body.responded_at) : undefined,
    };

    const contact = await contactService.updateContact(id, updateData);

    res.status(200).json({
      message: "Contact form submission updated successfully",
      contact,
    });
  } catch (error) {
    logger.error(`Update contact error: ${req.params.id}`, error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Contact Update Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Contact Update Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact form submission
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact form submission deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact form submission not found
 *       500:
 *         description: Server error
 */
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await contactService.deleteContact(id);

    res.status(200).json({
      message: "Contact form submission deleted successfully",
    });
  } catch (error) {
    logger.error(`Delete contact error: ${req.params.id}`, error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Contact Deletion Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Contact Deletion Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscribed to newsletter successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const subscription = await contactService.subscribeNewsletter(email);

    res.status(201).json({
      message: "Subscribed to newsletter successfully",
      subscription,
    });
  } catch (error) {
    logger.error("Newsletter subscription error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Newsletter Subscription Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Newsletter Subscription Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @swagger
 * /newsletter/unsubscribe/{id}:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unsubscribed from newsletter successfully
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Server error
 */
export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const subscription = await contactService.unsubscribeNewsletter(id);

    res.status(200).json({
      message: "Unsubscribed from newsletter successfully",
      subscription,
    });
  } catch (error) {
    logger.error(`Newsletter unsubscription error: ${req.params.id}`, error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Newsletter Unsubscription Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Newsletter Unsubscription Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};
/**
 * @swagger
 * /newsletter/subscribers:
 *   get:
 *     summary: List all newsletter subscribers
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: Only return active subscribers
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Field to sort by (defaults to subscribed_at)
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc, defaults to desc)
 *     responses:
 *       200:
 *         description: List of newsletter subscribers
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listNewsletterSubscribers = async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active_only 
      ? req.query.active_only.toString() === 'true' 
      : false;
    
    // Get sort parameters with defaults
    const sortBy = req.query.sort_by?.toString() || 'subscribed_at';
    const sortOrder = req.query.sort_order?.toString() || 'desc';

    // Fetch subscribers
    const subscribers = await contactService.listNewsletterSubscribers(
      activeOnly, 
      sortBy, 
      sortOrder
    );

    res.status(200).json({ subscribers });
  } catch (error) {
    logger.error("List newsletter subscribers error", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: "Newsletter Subscribers Listing Error",
        message: error.message,
      });
    }
    res.status(500).json({
      error: "Newsletter Subscribers Listing Error",
      message: constants.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

// Create object to export all controller functions together
export const contactController = {
  createContact,
  listContacts,
  getContactById,
  updateContact,
  deleteContact,
  subscribeNewsletter,
  unsubscribeNewsletter,
  listNewsletterSubscribers
};

// Default export for the controller object
export default contactController;