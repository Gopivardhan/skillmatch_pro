import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ content: '', rating: 5 });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/candidates');
        setCandidates(res.data.candidates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCandidates();
  }, []);

  const toggleExpand = (userId) => {
    if (expandedCandidateId === userId) {
      setExpandedCandidateId(null);
    } else {
      setExpandedCandidateId(userId);
      setMessage(null);
    }
  };

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const submitReview = async (candidateUserId) => {
    try {
      await api.post(`/candidates/${candidateUserId}/reviews`, reviewForm);
      setMessage('Review submitted');
      setReviewForm({ content: '', rating: 5 });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Mentor Dashboard</h2>
      {candidates.length === 0 ? <p>No candidates available.</p> : (
        <div className="accordion" id="candidateAccordion">
          {candidates.map((candidate) => (
            <div className="accordion-item" key={candidate.user_id}>
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" onClick={() => toggleExpand(candidate.user_id)}>
                  {candidate.name} - {candidate.email}
                </button>
              </h2>
              {expandedCandidateId === candidate.user_id && (
                <div className="accordion-collapse collapse show">
                  <div className="accordion-body">
                    <p><strong>Skills:</strong> {candidate.skills || 'N/A'}</p>
                    <p><strong>Experience:</strong> {candidate.experience || 'N/A'}</p>
                    <p><strong>Projects:</strong> {candidate.projects || 'N/A'}</p>
                    <div className="mt-3">
                      <h6>Leave a Review</h6>
                      {message && <div className="alert alert-info">{message}</div>}
                      <div className="mb-2">
                        <label className="form-label">Rating (1-5)</label>
                        <select
                          className="form-select"
                          name="rating"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Review</label>
                        <textarea
                          className="form-control"
                          name="content"
                          rows="3"
                          value={reviewForm.content}
                          onChange={handleReviewChange}
                        ></textarea>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => submitReview(candidate.user_id)}
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;