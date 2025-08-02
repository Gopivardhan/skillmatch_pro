const express = require('express');
const axios = require('axios');
const candidateModel = require('../models/candidate');
const jobModel = require('../models/job');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Simple in-memory cache for job recommendations per candidate.
// Keys are candidate user IDs; values contain { timestamp, matches }.
const jobRecommendationCache = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// GET /match/jobs
// Recommend jobs for the authenticated candidate based on skill match.
router.get('/jobs', authenticateToken, requireRole('candidate'), async (req, res, next) => {
  try {
    const candidateUserId = req.user.id;
    const now = Date.now();
    // Return cached results if still valid
    const cached = jobRecommendationCache[candidateUserId];
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ matches: cached.matches, cached: true });
    }
    // Get candidate profile
    const candidate = await candidateModel.getCandidateByUserId(candidateUserId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    // Get all jobs from database
    const jobs = await jobModel.listJobs();
    // Build payload for ML service
    const payload = {
      candidate_profile: `${candidate.skills || ''} ${candidate.experience || ''} ${candidate.projects || ''}`,
      jobs: jobs.map(job => ({ id: job.id, text: `${job.title} ${job.description} ${job.required_skills || ''} ${job.preferred_experience || ''}` })),
    };
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await axios.post(`${mlUrl}/match/jobs`, payload);
    const { matches } = response.data;
    // Enrich matches with job details
    const matchedJobs = matches.map(match => {
      const job = jobs.find(j => j.id === match.jobId);
      return {
        job,
        score: match.score,
      };
    });
    // Store in cache
    jobRecommendationCache[candidateUserId] = { timestamp: now, matches: matchedJobs };
    res.json({ matches: matchedJobs, cached: false });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'ML service unavailable' });
    }
    next(error);
  }
});

// Optionally, route to clear cache (admin). Not exposed publicly.

module.exports = router;