import pool from "../../src/config/db.js";

export const cleanupTestUser = async (email) => {
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
};

export const closePool = async () => {
  await pool.end();
};