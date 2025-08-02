const db = require('../utils/db');

// Create a new user record in the users table.
async function createUser({ name, email, passwordHash, role }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

// Find a user by email. Returns the full row including password_hash.
async function findUserByEmail(email) {
  const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return result.rows[0];
}

// Find a user by id. Returns the full row without password_hash by default.
async function findUserById(id) {
  const result = await db.query(`SELECT id, name, email, role, created_at FROM users WHERE id = $1`, [id]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};