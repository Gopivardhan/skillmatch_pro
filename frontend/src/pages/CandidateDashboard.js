import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const CandidateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ skills: '', experience: '', projects: '' });
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    // Fetch candidate profile on mount
    const fetchProfile = async () => {
      try {
        const res = await api.get('/candidates/me');
        const { candidate } = res.data;
        setProfile(candidate);
        setFormData({
          skills: candidate.skills || '',
          experience: candidate.experience || '',
          projects: candidate.projects || '',
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.put('/candidates/me', formData);
      setProfile(res.data.candidate);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const fetchRecommendations = async () => {
    setLoadingMatches(true);
    try {
      const res = await api.get('/match/jobs');
      setMatches(res.data.matches);
    } catch (err) {
      console.error(err);
    }
    setLoadingMatches(false);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Candidate Dashboard</h2>
      {profile && (
        <div className="row">
          <div className="col-md-6">
            <h4>Profile Information</h4>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label htmlFor="skills" className="form-label">Skills (comma-separated)</label>
                <textarea
                  id="skills"
                  name="skills"
                  className="form-control"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="experience" className="form-label">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  className="form-control"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="projects" className="form-label">Projects</label>
                <textarea
                  id="projects"
                  name="projects"
                  className="form-control"
                  value={formData.projects}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Profile</button>
            </form>
          </div>
          <div className="col-md-6">
            <h4>Recommended Jobs</h4>
            <button className="btn btn-outline-primary mb-3" onClick={fetchRecommendations} disabled={loadingMatches}>
              {loadingMatches ? 'Loading...' : 'Get Recommendations'}
            </button>
            {matches.length > 0 ? (
              <ul className="list-group">
                {matches.map(({ job, score }) => (
                  <li key={job.id} className="list-group-item">
                    <h5>{job.title}</h5>
                    <p>{job.description}</p>
                    <small>Match Score: {score.toFixed(3)}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No recommendations yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;