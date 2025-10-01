import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FeedbackForm = ({ onClose }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    page: window.location.pathname,
    browser: navigator.userAgent,
    device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit feedback');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="feedback-success">
        <div className="success-icon">✓</div>
        <h3>Thank you for your feedback!</h3>
        <p>We've received your message and will review it soon.</p>
        
        <style jsx>{`
          .feedback-success {
            text-align: center;
            padding: 2rem;
          }

          .success-icon {
            width: 60px;
            height: 60px;
            background: #00aa00;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin: 0 auto 1rem;
          }

          .feedback-success h3 {
            margin: 0 0 1rem 0;
            color: var(--color-text);
          }

          .feedback-success p {
            margin: 0;
            color: var(--color-text-dim);
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h3>Send Feedback</h3>
      
      <div className="form-group">
        <label htmlFor="type">Type of feedback:</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="improvement">Improvement Suggestion</option>
          <option value="complaint">Complaint</option>
          <option value="compliment">Compliment</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief description of the issue"
          maxLength={200}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Please provide detailed information about your feedback"
          maxLength={1000}
          rows={5}
          required
        />
        <small>{formData.description.length}/1000 characters</small>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>

      <style jsx>{`
        .feedback-form {
          padding: 1.5rem;
          max-width: 500px;
        }

        .feedback-form h3 {
          margin: 0 0 1.5rem 0;
          color: var(--color-text);
          font-size: 1.5rem;
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
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-bg-alt);
          color: var(--color-text);
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb), 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-group small {
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: var(--color-surface);
          color: var(--color-text-dim);
          border: 1px solid var(--color-border);
        }

        .cancel-btn:hover {
          background: var(--color-bg-alt);
          color: var(--color-text);
        }

        .submit-btn {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--color-accent-rgb), 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
};

const FeedbackButton = ({ inline = false }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button 
        className={inline ? "feedback-trigger-inline" : "feedback-trigger"}
        onClick={() => setShowForm(true)}
        title="Send Feedback"
      >
        💬 Feedback
      </button>

      {showForm && (
        <div className="feedback-modal">
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="modal-content">
            <button 
              className="close-btn"
              onClick={() => setShowForm(false)}
              aria-label="Close feedback form"
            >
              ×
            </button>
            <FeedbackForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <style jsx>{`
        .feedback-trigger {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 8px 25px rgba(var(--color-accent-rgb), 0.3);
          transition: all 0.3s ease;
          z-index: 100;
          font-size: 0.9rem;
        }

        .feedback-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(var(--color-accent-rgb), 0.4);
        }

        .feedback-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: var(--color-surface);
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--color-text-dim);
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: var(--color-bg-alt);
          color: var(--color-text);
        }

        .feedback-trigger-inline {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(var(--color-accent-rgb), 0.2);
          transition: all 0.3s ease;
          font-size: 0.85rem;
          position: relative;
        }

        .feedback-trigger-inline:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(var(--color-accent-rgb), 0.3);
        }

        @media (max-width: 768px) {
          .feedback-trigger {
            bottom: 1rem;
            right: 1rem;
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }

          .modal-content {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }
        }
      `}</style>
    </>
  );
};

export default FeedbackButton;