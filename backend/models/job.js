const db = require('../utils/db');

// Create a new job posting by a recruiter.
async function createJob({ recruiterId, title, description, requiredSkills, preferredExperience }) {
  const result = await db.query(
    `INSERT INTO jobs (recruiter_id, title, description, required_skills, preferred_experience)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [recruiterId, title, description, requiredSkills || '', preferredExperience || '']
  );
  return result.rows[0];
}

// Retrieve a job posting by its ID.
async function getJobById(jobId) {
  const result = await db.query(
    `SELECT j.*, u.name AS recruiter_name, u.email AS recruiter_email
     FROM jobs j
     JOIN users u ON u.id = j.recruiter_id
     WHERE j.id = $1`,
    [jobId]
  );
  return result.rows[0] || null;
}

// Search for job postings by a search term across title, description and skills.
async function searchJobs(searchTerm) {
  const term = `%${searchTerm}%`;
  const result = await db.query(
    `SELECT j.*, u.name AS recruiter_name, u.email AS recruiter_email
     FROM jobs j
     JOIN users u ON u.id = j.recruiter_id
     WHERE lower(j.title) LIKE lower($1) OR lower(j.description) LIKE lower($1)
        OR lower(j.required_skills) LIKE lower($1)`,
    [term]
  );
  return result.rows;
}

// List all job postings. Optionally filter by recruiter ID.
async function listJobs({ recruiterId } = {}) {
  if (recruiterId) {
    const result = await db.query(
      `SELECT j.*, u.name AS recruiter_name, u.email AS recruiter_email
       FROM jobs j JOIN users u ON u.id = j.recruiter_id
       WHERE j.recruiter_id = $1`,
      [recruiterId]
    );
    return result.rows;
  }
  const result = await db.query(
    `SELECT j.*, u.name AS recruiter_name, u.email AS recruiter_email
     FROM jobs j JOIN users u ON u.id = j.recruiter_id`
  );
  return result.rows;
}

module.exports = {
  createJob,
  getJobById,
  searchJobs,
  listJobs,
};