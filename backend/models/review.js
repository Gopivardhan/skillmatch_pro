const db = require('../utils/db');

// Create a new review from a mentor for a candidate.
async function createReview({ mentorId, candidateUserId, content, rating }) {
  const result = await db.query(
    `INSERT INTO reviews (mentor_id, candidate_user_id, content, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [mentorId, candidateUserId, content, rating]
  );
  return result.rows[0];
}

// Retrieve all reviews for a specific candidate user ID.
async function listReviewsForCandidate(candidateUserId) {
  const result = await db.query(
    `SELECT r.*, u.name AS mentor_name, u.email AS mentor_email
     FROM reviews r
     JOIN users u ON u.id = r.mentor_id
     WHERE r.candidate_user_id = $1
     ORDER BY r.created_at DESC`,
    [candidateUserId]
  );
  return result.rows;
}

module.exports = {
  createReview,
  listReviewsForCandidate,
};