import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { getChallans, getChallan, createChallan, updateChallanStatus } from "../controllers/challan.controller";

const router = Router();

router.use(authenticate);

router.get("/", getChallans);
router.get("/:id", getChallan);
router.post("/", authorize("ADMIN", "SALES"), createChallan);
router.patch("/:id/status", authorize("ADMIN", "SALES"), updateChallanStatus);

export default router;
