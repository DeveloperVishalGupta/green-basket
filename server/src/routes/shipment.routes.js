import express from "express";
import { cancelShipment, checkServiceability, createShipment } from "../controllers/shipmentController.js";
const router = express.Router();

router.post("/serviceability", checkServiceability);
router.post("/create", createShipment);
router.post("/cancel", cancelShipment);

export default router;
