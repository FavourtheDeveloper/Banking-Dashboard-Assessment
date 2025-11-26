import sqlite3 from "sqlite3";
import { Database } from "sqlite3";

export const db: Database = new sqlite3.Database(":memory:", (err) => {
  if (err) console.error("DB Error:", err);
  else console.log("Connected to SQLite");
});
