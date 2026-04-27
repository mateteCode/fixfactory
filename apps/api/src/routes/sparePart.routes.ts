import { Router } from "express";
import {
  createSparePartRequest,
  getSparePartRequests,
  updatePurchaseDetails,
} from "../controllers/sparePart.controller.js";

const router = Router();

router.post("/", createSparePartRequest);
router.get("/", getSparePartRequests);
router.put("/:id", updatePurchaseDetails); // Para el área de Compras (RF-10)

export default router;
