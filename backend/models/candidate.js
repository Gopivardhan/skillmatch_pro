const db = require('../utils/db');

// Retrieve candidate profile by user ID. Returns null if no profile exists.
async function getCandidateByUserId(userId) {
  const result = await db.query(
    `SELECT c.*, u.name, u.email, u.role, u.created_at
     FROM candidates c
     JOIN users u ON u.id = c.user_id
     WHERE c.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

// Create a new candidate profile associated with the given user ID.
async function createCandidateProfile({ userId, skills, experience, projects }) {
  const result = await db.query(
    `INSERT INTO candidates (user_id, skills, experience, projects) VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, skills || '', experience || '', projects || '']
  );
  return result.rows[0];
}

// Update an existing candidate profile. If the record doesn't exist, it creates one.
async function upsertCandidateProfile({ userId, skills, experience, projects }) {
  // Check if candidate exists
  const existing = await db.query(`SELECT 1 FROM candidates WHERE user_id = $1`, [userId]);
  if (existing.rowCount > 0) {
    const result = await db.query(
      `UPDATE candidates SET skills = $2, experience = $3, projects = $4, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId, skills || '', experience || '', projects || '']
    );
    return result.rows[0];
  } else {
    return createCandidateProfile({ userId, skills, experience, projects });
  }
}

// Search candidate profiles by a search term across skills, experience, and projects.
async function searchCandidates(searchTerm) {
  const term = `%${searchTerm}%`;
  const result = await db.query(
    `SELECT c.*, u.name, u.email FROM candidates c
     JOIN users u ON u.id = c.user_id
     WHERE lower(c.skills) LIKE lower($1) OR lower(c.experience) LIKE lower($1) OR lower(c.projects) LIKE lower($1)`,
    [term]
  );
  return result.rows;
}

// List all candidate profiles.
async function listCandidates() {
  const result = await db.query(
    `SELECT c.*, u.name, u.email FROM candidates c JOIN users u ON u.id = c.user_id`
  );
  return result.rows;
}

module.exports = {
  getCandidateByUserId,
  createCandidateProfile,
  upsertCandidateProfile,
  searchCandidates,
  listCandidates,
};