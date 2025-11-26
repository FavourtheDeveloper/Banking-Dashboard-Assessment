import { Router } from "express";
import { getAccounts, getAccountById } from "../controllers/account.controller";

const router = Router();

router.get("/", getAccounts);
router.get("/:id", getAccountById);

export default router;
