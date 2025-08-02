# SkillMatch Pro

SkillMatch Pro is a modern, full‑stack platform that connects **candidates**, **recruiters**, and **mentors**. It allows job seekers to showcase their skills and experience, recruiters to post and manage job openings, and mentors to provide valuable feedback. The front‑end is built with React and Bootstrap and features a responsive dark‑themed design with subtle animations. The back‑end provides RESTful APIs for user authentication, job matching, and data management.

## Features

- **Candidate dashboard**: Edit your skills, experience and projects, then receive recommended job openings based on your profile.
- **Recruiter dashboard**: Create new job postings, view all your jobs and see matched candidates with similarity scores.
- **Mentor dashboard**: Browse through candidate profiles and submit reviews with a rating and comments.
- **Authentication**: Register as a candidate, recruiter or mentor; secure login with token‑based authentication.
- **Dark mode UI**: A cohesive dark theme with polished typography, cards and animated page transitions.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your‑username>/skillmatch_pro.git
   cd skillmatch_pro
   ```

2. **Install server dependencies**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run the backend**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

4. **Install client dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run the client**:
   ```bash
   npm start
   ```

The client will launch at `http://localhost:3000` and connect to the backend API running at port 8000.

## Project Structure

```
skillmatch_pro/
├─ backend/           # FastAPI server, database models and API routes
├─ frontend/          # React application with pages and components
├─ requirements.txt   # Python dependencies for the backend
├─ package.json       # Node dependencies for the frontend
└─ README.md          # This documentation
```

## License

This project is licensed under the MIT License. See `LICENSE` for more details.
