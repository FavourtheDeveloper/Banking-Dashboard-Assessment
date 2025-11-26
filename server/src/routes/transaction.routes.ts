import { Router } from "express";
import { createTransaction, getTransactions } from "../controllers/transaction.controller";

const router: Router = Router();

router.post("/:id/transactions", createTransaction);
router.get("/:id/transactions", getTransactions);

export default router;
