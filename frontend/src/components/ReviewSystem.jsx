import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ReviewSystem = ({ animeId, animeTitle }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    spoilerWarning: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (animeId) {
      fetchReviews();
    }
  }, [animeId, sortBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/anime/${animeId}?sortBy=${sortBy}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          animeId,
          ...reviewForm
        })
      });

      if (response.ok) {
        setShowReviewForm(false);
        setReviewForm({
          rating: 5,
          title: '',
          content: '',
          spoilerWarning: false
        });
        fetchReviews();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      alert('Please login to like reviews');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislikeReview = async (reviewId) => {
    if (!user) {
      alert('Please login to dislike reviews');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert('Please login to mark reviews as helpful');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onChange(star) : undefined}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="review-system">
      <div className="review-header">
        <h2>Community Reviews</h2>
        <div className="review-stats">
          {totalReviews > 0 ? (
            <>
              <div className="average-rating">
                {renderStars(Math.round(averageRating))}
                <span className="rating-text">
                  {averageRating.toFixed(1)}/10 ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </>
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      <div className="review-actions">
        {user && (
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        )}
        
        <div className="sort-controls">
          <label htmlFor="sortBy">Sort by:</label>
          <select 
            id="sortBy"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="review-form">
          <h3>Write a Review for {animeTitle}</h3>
          
          <div className="form-group">
            <label>Rating: {reviewForm.rating}/10</label>
            {renderStars(reviewForm.rating, true, (rating) => 
              setReviewForm({...reviewForm, rating})
            )}
          </div>

          <div className="form-group">
            <label htmlFor="review-title">Title (optional):</label>
            <input
              type="text"
              id="review-title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
              placeholder="Give your review a title"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="review-content">Review:</label>
            <textarea
              id="review-content"
              value={reviewForm.content}
              onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
              placeholder="Share your thoughts about this anime..."
              maxLength={2000}
              rows={6}
              required
            />
            <small>{reviewForm.content.length}/2000 characters</small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={reviewForm.spoilerWarning}
                onChange={(e) => setReviewForm({...reviewForm, spoilerWarning: e.target.checked})}
              />
              This review contains spoilers
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowReviewForm(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              {review.spoilerWarning && (
                <div className="spoiler-warning">
                  ⚠️ This review contains spoilers
                </div>
              )}
              
              <div className="review-header-item">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.username} />
                    ) : (
                      review.user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h4>
                      {review.user.username}
                      {review.user.verified && <span className="verified-badge">✓</span>}
                    </h4>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                      <span>{review.rating}/10</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>

              {review.title && <h5 className="review-title">{review.title}</h5>}
              
              <div className="review-content">
                <p>{review.content}</p>
              </div>

              <div className="review-actions-item">
                <button 
                  className="action-btn like"
                  onClick={() => handleLikeReview(review._id)}
                  title="Like this review"
                >
                  👍 {review.likes?.length || 0}
                </button>
                
                <button 
                  className="action-btn dislike"
                  onClick={() => handleDislikeReview(review._id)}
                  title="Dislike this review"
                >
                  👎 {review.dislikes?.length || 0}
                </button>
                
                <button 
                  className="action-btn helpful"
                  onClick={() => handleMarkHelpful(review._id)}
                  title="Mark as helpful"
                >
                  ✨ Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .review-system {
          margin: 2rem 0;
          padding: 2rem;
          background: var(--color-surface);
          border-radius: 16px;
          border: 1px solid var(--color-border);
        }

        .review-header {
          margin-bottom: 2rem;
        }

        .review-header h2 {
          margin: 0 0 1rem 0;
          color: var(--color-text);
          font-size: 1.8rem;
        }

        .review-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .average-rating {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-text {
          font-weight: 600;
          color: var(--color-text);
        }

        .review-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .write-review-btn {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .write-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--color-accent-rgb), 0.3);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls select {
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-bg-alt);
          color: var(--color-text);
        }

        .review-form {
          background: var(--color-bg-alt);
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--color-border);
        }

        .review-form h3 {
          margin: 0 0 1.5rem 0;
          color: var(--color-text);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text);
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface);
          color: var(--color-text);
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto !important;
        }

        .form-group small {
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .star {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0.3;
          transition: opacity 0.3s ease;
          padding: 0.25rem;
        }

        .star.filled {
          opacity: 1;
        }

        .star.interactive:hover {
          opacity: 0.7;
        }

        .star:disabled {
          cursor: default;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .form-actions button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .form-actions button:first-child {
          background: var(--color-surface);
          color: var(--color-text-dim);
          border: 1px solid var(--color-border);
        }

        .submit-btn {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-item {
          background: var(--color-bg-alt);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .spoiler-warning {
          background: #ff6b35;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .review-header-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          overflow: hidden;
        }

        .reviewer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reviewer-details h4 {
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .verified-badge {
          color: var(--color-accent-glow);
          font-size: 1.2rem;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .review-date {
          color: var(--color-text-dim);
          font-size: 0.9rem;
        }

        .review-title {
          margin: 0 0 1rem 0;
          color: var(--color-text);
          font-size: 1.1rem;
        }

        .review-content p {
          margin: 0;
          line-height: 1.6;
          color: var(--color-text);
        }

        .review-actions-item {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }

        .action-btn {
          background: none;
          border: 1px solid var(--color-border);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          color: var(--color-text-dim);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: var(--color-surface);
          color: var(--color-text);
          border-color: var(--color-accent);
        }

        .loading,
        .no-reviews {
          text-align: center;
          padding: 2rem;
          color: var(--color-text-dim);
        }

        @media (max-width: 768px) {
          .review-system {
            padding: 1rem;
          }

          .review-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .review-header-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .review-actions-item {
            flex-wrap: wrap;
          }

          .stars {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewSystem;