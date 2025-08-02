const express = require('express');
const candidateModel = require('../models/candidate');
const userModel = require('../models/user');
const reviewModel = require('../models/review');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// GET /candidates/me
// Retrieve the authenticated candidate's profile.
router.get('/me', authenticateToken, requireRole('candidate'), async (req, res, next) => {
  try {
    const candidate = await candidateModel.getCandidateByUserId(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate profile not found' });
    }
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
});

// PUT /candidates/me
// Update the authenticated candidate's profile.
router.put('/me', authenticateToken, requireRole('candidate'), async (req, res, next) => {
  try {
    const { skills, experience, projects } = req.body;
    const updated = await candidateModel.upsertCandidateProfile({ userId: req.user.id, skills, experience, projects });
    res.json({ candidate: updated });
  } catch (error) {
    next(error);
  }
});

// GET /candidates
// Search or list candidate profiles. Accessible to authenticated users.
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { search } = req.query;
    let candidates;
    if (search) {
      candidates = await candidateModel.searchCandidates(search);
    } else {
      candidates = await candidateModel.listCandidates();
    }
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
});

// GET /candidates/:id
// Get a candidate profile by user id, including reviews.
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const candidate = await candidateModel.getCandidateByUserId(userId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    const reviews = await reviewModel.listReviewsForCandidate(userId);
    res.json({ candidate, reviews });
  } catch (error) {
    next(error);
  }
});

// POST /candidates/:id/reviews
// Create a review for a candidate. Only mentors can review.
router.post('/:id/reviews', authenticateToken, requireRole('mentor'), async (req, res, next) => {
  try {
    const candidateUserId = parseInt(req.params.id, 10);
    const { content, rating } = req.body;
    if (!content || typeof rating === 'undefined') {
      return res.status(400).json({ message: 'Content and rating are required' });
    }
    const review = await reviewModel.createReview({ mentorId: req.user.id, candidateUserId, content, rating });
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

module.exports = router;