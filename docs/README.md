# SkillMatch Pro

SkillMatch Pro is a full‑stack web platform designed to connect candidates, recruiters and mentors. Candidates build skill‑rich portfolios, recruiters post jobs and search for qualified candidates, and mentors provide reviews on candidate portfolios. A lightweight machine learning module calculates similarity scores between candidate profiles and job descriptions to power intelligent job recommendations and ranked candidate lists.

## Features

- **User authentication** – secure registration and login using JSON Web Tokens (JWT).
- **Role‑based experience** – Candidate, Recruiter and Mentor users each have dedicated dashboards and capabilities.
- **Candidate portfolios** – candidates can edit their skills, experience and projects, and view personalised job recommendations.
- **Job postings** – recruiters can create new jobs and view ranked candidates for each job.
- **Mentor reviews** – mentors can browse candidates and provide 1–5 star reviews with comments.
- **Machine‑learning matching** – a Python microservice uses TF‑IDF vectorisation and cosine similarity to recommend the most relevant jobs to candidates and to rank candidates for recruiters.

## Repository Structure

```
skillmatch_pro/
├── backend/             # Node.js + Express API
│   ├── index.js         # Entry point configuring routes and middleware
│   ├── models/          # Database access functions
│   ├── routes/          # Express routers (auth, candidates, jobs, match)
│   ├── middlewares/     # Authentication and role checking
│   └── utils/           # Shared utilities (database pool)
├── ml/                  # Python ML microservice
│   ├── app.py           # Flask API exposing /match/jobs and /match/candidates
│   └── requirements.txt # Python dependencies
├── frontend/            # React application (Create React App)
│   ├── public/
│   └── src/
├── database/
│   ├── schema.sql       # SQL schema defining all tables
│   └── seeds.sql        # Placeholder for inserting demo data
├── docker/
│   ├── backend.Dockerfile   # Dockerfile for the backend service
│   ├── frontend.Dockerfile  # Dockerfile for the frontend service
│   ├── ml.Dockerfile        # Dockerfile for the ML service
│   └── docker-compose.yml   # Compose file orchestrating services
└── docs/
    └── README.md        # This document
```

## Getting Started

### Prerequisites

Ensure that you have the following installed on your system:

- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose

### Running with Docker Compose

1. **Clone or download** this repository and navigate into the root directory (`skillmatch_pro`).

2. **Start the application stack**. From the `docker` directory, run:

   ```bash
   docker compose up --build
   ```

   This command builds the backend, frontend and ML images, starts a PostgreSQL database and automatically applies the database schema. The services will be available at the following ports:

   - **Frontend (React)**: http://localhost:3000
   - **Backend API (Express)**: http://localhost:3001
   - **ML service (Flask)**: http://localhost:5000
   - **PostgreSQL**: localhost:5432 (credentials: user `postgres`, password `postgres`, database `skillmatch_db`)

3. **Register users**. Once the services are running, open http://localhost:3000 in your browser. Register as a `candidate`, `recruiter` or `mentor` to explore the respective dashboards.

> **Note**: The initial database is empty. You can either register through the UI/API or create seed data by editing `database/seeds.sql`.

### Running Services Individually

If you prefer to run each service manually:

1. **Database** – start PostgreSQL locally and run the schema script:

   ```bash
   createdb skillmatch_db
   psql -d skillmatch_db -f database/schema.sql
   psql -d skillmatch_db -f database/seeds.sql  # optional
   ```

2. **ML service** – install dependencies and start the Flask server:

   ```bash
   cd ml
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Backend** – install dependencies and run the Express server:

   ```bash
   cd backend
   npm install
   node index.js
   ```

   Provide environment variables as needed, e.g.:

   ```bash
   export DB_HOST=localhost
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_NAME=skillmatch_db
   export JWT_SECRET=mysecret
   export ML_SERVICE_URL=http://localhost:5000
   ```

4. **Frontend** – install dependencies and start the React app:

   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Overview

### Authentication

- `POST /auth/register` – Register a new user (requires `name`, `email`, `password`, `role`). Returns a JWT and user details.
- `POST /auth/login` – Log in with email and password. Returns a JWT and user details.

### Candidate Endpoints

- `GET /candidates/me` – Get the authenticated candidate’s profile.
- `PUT /candidates/me` – Update candidate profile (skills, experience, projects).
- `GET /match/jobs` – Get recommended jobs for the authenticated candidate.

### Recruiter Endpoints

- `POST /jobs` – Create a new job posting (requires title and description).
- `GET /jobs` – List all jobs.
- `GET /jobs/:id/candidates` – Retrieve a ranked list of candidates for the specified job.

### Mentor Endpoints

- `GET /candidates` – List or search candidate profiles.
- `GET /candidates/:id` – Get a candidate’s profile and reviews.
- `POST /candidates/:id/reviews` – Leave a review for a candidate (requires `content` and `rating`).

### ML Service Endpoints

- `POST /match/jobs` – (Internal) Recommend jobs for a candidate. Accepts a JSON payload with a candidate profile and an array of jobs.
- `POST /match/candidates` – (Internal) Rank candidates for a job. Accepts a JSON payload with a job description and an array of candidate profiles.

## Extending the Project

The project was designed with modularity in mind. You can extend or modify it by:

- Adding pagination and advanced search filters to job and candidate listings.
- Incorporating Redis for distributed caching across multiple backend instances.
- Expanding the ML module with more sophisticated natural language processing or weighting factors.
- Integrating email notifications or third‑party authentication providers.

## License

This project is provided for educational purposes and is not licensed for commercial use.