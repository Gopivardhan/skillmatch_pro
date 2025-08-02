import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [matchesByJob, setMatchesByJob] = useState({});
  const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: '', preferredExperience: '' });
  const [error, setError] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState({});

  // Fetch all jobs and filter by recruiter on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        const recruiterJobs = res.data.jobs.filter((job) => job.recruiter_id === user.id);
        setJobs(recruiterJobs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, [user.id]);

  const handleInputChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError(null);
    const { title, description } = newJob;
    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    try {
      const res = await api.post('/jobs', newJob);
      setJobs([...jobs, res.data.job]);
      setNewJob({ title: '', description: '', requiredSkills: '', preferredExperience: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleViewCandidates = async (jobId) => {
    // If matches already loaded, toggle collapse
    if (matchesByJob[jobId]) {
      setMatchesByJob({ ...matchesByJob, [jobId]: null });
      return;
    }
    setLoadingMatches({ ...loadingMatches, [jobId]: true });
    try {
      const res = await api.get(`/jobs/${jobId}/candidates`);
      setMatchesByJob({ ...matchesByJob, [jobId]: res.data.matches });
    } catch (err) {
      console.error(err);
    }
    setLoadingMatches({ ...loadingMatches, [jobId]: false });
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Recruiter Dashboard</h2>
      <div className="row">
        <div className="col-md-5">
          <h4>Create New Job</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleCreateJob}>
            <div className="mb-2">
              <label htmlFor="title" className="form-label">Job Title</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                value={newJob.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="3"
                value={newJob.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <div className="mb-2">
              <label htmlFor="requiredSkills" className="form-label">Required Skills</label>
              <input
                id="requiredSkills"
                name="requiredSkills"
                type="text"
                className="form-control"
                value={newJob.requiredSkills}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-2">
              <label htmlFor="preferredExperience" className="form-label">Preferred Experience</label>
              <input
                id="preferredExperience"
                name="preferredExperience"
                type="text"
                className="form-control"
                value={newJob.preferredExperience}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Job</button>
          </form>
        </div>
        <div className="col-md-7">
          <h4>Your Jobs</h4>
          {jobs.length === 0 ? <p>You haven't created any jobs yet.</p> : (
            <div className="accordion" id="jobsAccordion">
              {jobs.map((job) => (
                <div className="accordion-item" key={job.id}>
                  <h2 className="accordion-header" id={`heading-${job.id}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      onClick={() => handleViewCandidates(job.id)}
                    >
                      {job.title}
                    </button>
                  </h2>
                  <div className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      <p>{job.description}</p>
                      <p><strong>Required Skills:</strong> {job.required_skills || 'N/A'}</p>
                      <p><strong>Preferred Experience:</strong> {job.preferred_experience || 'N/A'}</p>
                      <button className="btn btn-outline-primary mb-2" onClick={() => handleViewCandidates(job.id)}>
                        {loadingMatches[job.id] ? 'Loading...' : matchesByJob[job.id] ? 'Hide Candidates' : 'View Candidates'}
                      </button>
                      {matchesByJob[job.id] && (
                        <ul className="list-group">
                          {matchesByJob[job.id].map(({ candidate, score }) => (
                            <li key={candidate.user_id} className="list-group-item">
                              <h6>{candidate.name}</h6>
                              <p>{candidate.skills}</p>
                              <small>Match Score: {score.toFixed(3)}</small>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;