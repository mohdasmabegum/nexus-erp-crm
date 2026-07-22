import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { getCustomers, getCustomer, createCustomer, updateCustomer } from "../controllers/customer.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", authorize("ADMIN", "SALES"), createCustomer);
router.put("/:id", authorize("ADMIN", "SALES"), updateCustomer);

export default router;
