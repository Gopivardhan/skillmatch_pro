const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const matchRoutes = require('./routes/match');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route handlers
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SkillMatch Pro API' });
});

app.use('/auth', authRoutes);
app.use('/candidates', candidateRoutes);
app.use('/jobs', jobRoutes);
app.use('/match', matchRoutes);

// Global error handler to catch thrown errors and respond with a standardized JSON structure.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});