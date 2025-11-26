import { Request, Response } from "express";
import { db } from "../db";

export const getAccounts = (req: Request, res: Response) => {
  db.all("SELECT * FROM accounts", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const getAccountById = (req: Request, res: Response) => {
  const { id } = req.params;

  db.get("SELECT * FROM accounts WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Account not found" });
    res.json(row);
  });
};
