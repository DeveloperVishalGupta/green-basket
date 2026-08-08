import express from "express";
import whatsappController from "../controllers/whatsappController.js";

const router = express.Router();

/**
 * WhatsApp Webhook Routes
 * Public — Meta calls these directly, so no auth middleware here.
 * Signature verification (when WHATSAPP_APP_SECRET is set) happens inside
 * the controller instead.
 */

router.get("/", (req, res) => whatsappController.verifyWebhook(req, res));
router.post("/", (req, res) => whatsappController.receiveWebhook(req, res));

export default router;
