// src/pages/ReviewPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ReviewPage = () => {
  const { restaurantId } = useParams();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [restRes, revRes] = await Promise.all([
        axios.get(`/api/restaurants/${restaurantId}`),
        axios.get(`/api/reviews/restaurants/${restaurantId}`),
      ]);
      setRestaurant(restRes.data);
      setReviews(revRes.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a review.');
      return;
    }
    if (!comment.trim()) {
      alert('Please share your thoughts in the review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      await axios.post(
        '/api/reviews',
        {
          restaurantId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComment('');
      setRating(5);
      setMessage('Thank you! Your verified review has been posted.');
      fetchReviews();
    } catch (err) {
      console.error('Failed to submit review', err);
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>
            Reviews for {restaurant?.name || 'Restaurant'}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Overall Rating: ★ {restaurant?.rating ? restaurant.rating.toFixed(1) : '4.5'} ({restaurant?.ratingCount || reviews.length} customer ratings)
          </p>
        </div>

        <Link to={`/restaurant/${restaurantId}`} className="btn-secondary">
          ← Back to Menu
        </Link>
      </div>

      {/* Leave a Review Box */}
      <div className="review-form glassmorphism">
        <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Leave Your Rating & Feedback</h2>

        {message && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--secondary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              SELECT RATING:
            </label>
            <div className="star-rating-select">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '8px', alignSelf: 'center' }}>
                ({rating} Star{rating > 1 && 's'})
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              className="form-input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about the food, taste, or packaging?"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Post Review ➔'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div style={{ marginTop: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>
          Customer Reviews ({reviews.length})
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="glassmorphism" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p>No reviews yet for this restaurant. Be the first to share your experience!</p>
          </div>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r._id} className="review-item glassmorphism">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{r.customer?.name || 'Verified Foodie'}</strong>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      Verified Order
                    </span>
                  </div>
                  <span style={{ color: 'var(--amber)', fontSize: '1.05rem' }}>
                    {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{r.comment}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent review'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
