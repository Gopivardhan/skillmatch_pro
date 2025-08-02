const express = require('express');
const jobModel = require('../models/job');
const candidateModel = require('../models/candidate');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const axios = require('axios');

const router = express.Router();

// GET /jobs
// List all jobs or search by term. Accessible to authenticated users.
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { search } = req.query;
    let jobs;
    if (search) {
      jobs = await jobModel.searchJobs(search);
    } else {
      jobs = await jobModel.listJobs();
    }
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

// POST /jobs
// Create a new job posting. Only recruiters can create jobs.
router.post('/', authenticateToken, requireRole('recruiter'), async (req, res, next) => {
  try {
    const { title, description, requiredSkills, preferredExperience } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const job = await jobModel.createJob({ recruiterId: req.user.id, title, description, requiredSkills, preferredExperience });
    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
});

// GET /jobs/:id
// Get job details by ID. Accessible to authenticated users.
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await jobModel.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// GET /jobs/:id/candidates
// Fetch ranked candidates for a job by similarity. Only recruiters may access.
router.get('/:id/candidates', authenticateToken, requireRole('recruiter'), async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const job = await jobModel.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    // Gather all candidates from database
    const candidates = await candidateModel.listCandidates();
    // Build payload for ML module
    const payload = {
      job_description: `${job.title} ${job.description} ${job.required_skills || ''} ${job.preferred_experience || ''}`,
      candidates: candidates.map(c => ({ id: c.user_id, text: `${c.skills || ''} ${c.experience || ''} ${c.projects || ''}` })),
    };
    // Call ML module
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${mlUrl}/match/candidates`, payload);
    const { matches } = response.data;
    // Enrich matches with candidate info
    const matchedCandidates = matches.map(match => {
      const candidate = candidates.find(c => c.user_id === match.candidateId);
      return {
        candidate,
        score: match.score,
      };
    });
    res.json({ matches: matchedCandidates });
  } catch (error) {
    // Handle connection errors gracefully
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service unavailable' });
    }
    next(error);
  }
});

module.exports = router;