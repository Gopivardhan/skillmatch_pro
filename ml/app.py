from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import hashlib
import json


app = Flask(__name__)

# Simple cache to avoid re-computing expensive similarity calculations.
# Keys are MD5 hashes of the input payload; values are the resulting matches.
cache = {}


def get_cache_key(data: dict) -> str:
    """Return a deterministic MD5 hash for a dictionary payload.

    The input dictionary is serialized with sorted keys to ensure consistent ordering.
    """
    payload_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.md5(payload_str.encode('utf-8')).hexdigest()


@app.route('/match/jobs', methods=['POST'])
def match_jobs():
    """Recommend jobs for a candidate based on textual similarity of their profile to job descriptions.

    Expects a JSON body containing:
    {
        "candidate_profile": "...",
        "jobs": [ {"id": <int>, "text": "..."}, ... ]
    }

    Returns a JSON object with a `matches` array sorted descending by similarity score.
    """
    data = request.get_json() or {}
    candidate_profile = data.get('candidate_profile', '') or ''
    jobs = data.get('jobs', []) or []
    # Use cache if available
    cache_key = get_cache_key(data)
    if cache_key in cache:
        return jsonify(cache[cache_key])
    # Build combined text list for TF-IDF
    all_text = [candidate_profile] + [job.get('text', '') or '' for job in jobs]
    # Fit vectorizer on combined corpus
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_text)
    candidate_vec = tfidf_matrix[0]
    job_vecs = tfidf_matrix[1:]
    # Compute cosine similarity between the candidate vector and each job vector
    similarity_scores = cosine_similarity(candidate_vec, job_vecs)[0]
    matches = [
        {
            'jobId': job.get('id'),
            'score': float(score),
        }
        for job, score in zip(jobs, similarity_scores)
    ]
    matches.sort(key=lambda x: x['score'], reverse=True)
    response = { 'matches': matches }
    cache[cache_key] = response
    return jsonify(response)


@app.route('/match/candidates', methods=['POST'])
def match_candidates():
    """Rank candidates for a job based on textual similarity of job description and candidate profiles.

    Expects a JSON body containing:
    {
        "job_description": "...",
        "candidates": [ {"id": <int>, "text": "..."}, ... ]
    }
    """
    data = request.get_json() or {}
    job_description = data.get('job_description', '') or ''
    candidates = data.get('candidates', []) or []
    cache_key = get_cache_key(data)
    if cache_key in cache:
        return jsonify(cache[cache_key])
    # Build text corpus
    all_text = [job_description] + [candidate.get('text', '') or '' for candidate in candidates]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_text)
    job_vec = tfidf_matrix[0]
    candidate_vecs = tfidf_matrix[1:]
    similarity_scores = cosine_similarity(job_vec, candidate_vecs)[0]
    matches = [
        {
            'candidateId': candidate.get('id'),
            'score': float(score),
        }
        for candidate, score in zip(candidates, similarity_scores)
    ]
    matches.sort(key=lambda x: x['score'], reverse=True)
    response = { 'matches': matches }
    cache[cache_key] = response
    return jsonify(response)


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({ 'status': 'ok' })


if __name__ == '__main__':
    # When running locally, listen on port 5000
    app.run(host='0.0.0.0', port=5000)