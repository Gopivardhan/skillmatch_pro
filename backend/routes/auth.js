const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const candidateModel = require('../models/candidate');

const router = express.Router();

// POST /auth/register
// Registers a new user and returns a JWT on success.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    const allowedRoles = ['candidate', 'recruiter', 'mentor'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
    // Check if email already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // Create user
    const user = await userModel.createUser({ name, email, passwordHash, role });
    // If candidate, create an empty candidate profile
    if (role === 'candidate') {
      await candidateModel.createCandidateProfile({ userId: user.id, skills: '', experience: '', projects: '' });
    }
    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '24h' });
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
// Authenticates a user and returns a JWT.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Sign token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '24h' });
    // Exclude password_hash from response
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
});

module.exports = router;