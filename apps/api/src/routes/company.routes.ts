import { Router } from "express";
import {
  updateCompany,
  getCompanyProfile,
  deactivateCompany,
} from "../controllers/company.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isCompanyOwner } from "../middlewares/company.middleware.js";
import { checkTenant } from "../middlewares/tenant.middleware.js";

const router = Router();

router.use(authenticate);
router.use(checkTenant);

// Solo el ADMIN que es Owner puede ver/editar estos datos
router.get("/profile", isCompanyOwner, getCompanyProfile);
router.patch("/update", isCompanyOwner, updateCompany);
router.patch("/deactivate", isCompanyOwner, deactivateCompany);

export default router;
