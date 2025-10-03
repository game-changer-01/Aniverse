import { useEffect, useState } from 'react';
import Layout from '../src/components/Layout';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us - Guide2Anime';
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('szproduction447@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="contact-page">
        <div className="contact-hero">
          <div className="hero-gradient"></div>
          <h1 className="contact-title">Get In Touch</h1>
          <p className="contact-subtitle">We'd love to hear from you!</p>
          <div className="hero-decoration"></div>
        </div>

        <div className="contact-container">
          <div className="contact-grid">
            {/* Email Card */}
            <div className="contact-card">
              <div className="card-icon email-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3>Email Us</h3>
              <p>Send us an email and we'll get back to you as soon as possible.</p>
              <div className="email-display">
                <span>szproduction447@gmail.com</span>
                <button onClick={handleCopyEmail} className="copy-button" aria-label="Copy email">
                  {copied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  )}
                </button>
              </div>
              <a href="mailto:szproduction447@gmail.com" className="action-button primary-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Send Email
              </a>
            </div>

            {/* Social Media Card */}
            <div className="contact-card">
              <div className="card-icon social-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2 0-.68.06-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.923 7.923 0 0 1 9.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8.008 8.008 0 0 1 5.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.65 15.65 0 0 0-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"/>
                </svg>
              </div>
              <h3>Follow Us</h3>
              <p>Connect with us on social media for updates and anime content.</p>
              <div className="social-links">
                <a href="https://twitter.com/SaturoA69525" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </a>
                <a href="https://www.instagram.com/mr_._sam_23/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="https://www.linkedin.com/in/samarpith-menezes/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Support Card */}
            <div className="contact-card full-width">
              <div className="card-icon support-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
              </div>
              <h3>Need Help?</h3>
              <p>
                Have questions about Guide2Anime? Check out our FAQ or send us a message. 
                We're here to help you discover your next favorite anime!
              </p>
              <div className="faq-topics">
                <span className="topic-tag">Account Issues</span>
                <span className="topic-tag">Recommendations</span>
                <span className="topic-tag">Technical Support</span>
                <span className="topic-tag">Feedback</span>
                <span className="topic-tag">Partnerships</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .contact-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          }

          .contact-hero {
            position: relative;
            padding: 6rem 2rem 4rem;
            text-align: center;
            overflow: hidden;
          }

          .hero-gradient {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, 
              rgba(255, 215, 0, 0.1) 0%, 
              rgba(221, 42, 123, 0.05) 50%, 
              rgba(88, 86, 214, 0.1) 100%
            );
            pointer-events: none;
          }

          .hero-decoration {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(88, 86, 214, 0.15) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
            pointer-events: none;
          }

          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
          }

          .contact-title {
            position: relative;
            font-family: 'Japan Ramen', cursive;
            font-size: 4rem;
            background: linear-gradient(135deg, #ffd700 0%, #dd2a7b 50%, #5856d6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 1rem 0;
            text-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
            animation: fadeInDown 0.6s ease-out;
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .contact-subtitle {
            position: relative;
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .contact-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem 4rem;
          }

          .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .contact-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 20px;
            padding: 3rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            animation: fadeInUp 0.6s ease-out both;
          }

          .contact-card:nth-child(1) { animation-delay: 0.3s; }
          .contact-card:nth-child(2) { animation-delay: 0.4s; }
          .contact-card:nth-child(3) { animation-delay: 0.5s; }

          .contact-card.full-width {
            grid-column: 1 / -1;
          }

          .contact-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ffd700, #dd2a7b, #5856d6);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .contact-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(255, 215, 0, 0.2);
          }

          .contact-card:hover::before {
            opacity: 1;
          }

          .card-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            position: relative;
          }

          .email-icon {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(221, 42, 123, 0.2));
            color: #ffd700;
          }

          .social-icon {
            background: linear-gradient(135deg, rgba(221, 42, 123, 0.2), rgba(88, 86, 214, 0.2));
            color: #dd2a7b;
          }

          .support-icon {
            background: linear-gradient(135deg, rgba(88, 86, 214, 0.2), rgba(255, 215, 0, 0.2));
            color: #5856d6;
          }

          .contact-card h3 {
            font-size: 1.75rem;
            color: #ffffff;
            margin: 0 0 1rem 0;
            text-align: center;
            font-weight: 600;
          }

          .contact-card p {
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.8;
            text-align: center;
            margin: 0 0 2rem 0;
          }

          .email-display {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            justify-content: center;
          }

          .email-display span {
            color: rgba(255, 255, 255, 0.9);
            font-family: monospace;
            font-size: 0.95rem;
          }

          .copy-button {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            padding: 0.5rem;
            cursor: pointer;
            color: #ffd700;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .copy-button:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: scale(1.1);
          }

          .action-button {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.05rem;
            text-decoration: none;
            transition: all 0.3s ease;
            justify-content: center;
            width: 100%;
          }

          .primary-button {
            background: linear-gradient(135deg, #ffd700, #dd2a7b);
            color: white;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
          }

          .primary-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(255, 215, 0, 0.5);
          }

          .social-links {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .social-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .social-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .social-link.twitter::before {
            background: linear-gradient(135deg, rgba(29, 161, 242, 0.2), rgba(29, 161, 242, 0.1));
          }

          .social-link.instagram::before {
            background: linear-gradient(135deg, rgba(225, 48, 108, 0.2), rgba(193, 53, 132, 0.1));
          }

          .social-link.linkedin::before {
            background: linear-gradient(135deg, rgba(0, 119, 181, 0.2), rgba(0, 119, 181, 0.1));
          }

          .social-link:hover {
            transform: translateX(5px);
            border-color: rgba(255, 215, 0, 0.5);
          }

          .social-link:hover::before {
            opacity: 1;
          }

          .social-link span {
            position: relative;
            z-index: 1;
            font-weight: 600;
          }

          .social-link svg {
            position: relative;
            z-index: 1;
          }

          .faq-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
          }

          .topic-tag {
            padding: 0.5rem 1.25rem;
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 20px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }

          .topic-tag:hover {
            background: rgba(255, 215, 0, 0.2);
            transform: translateY(-2px);
          }

          @media (max-width: 968px) {
            .contact-grid {
              grid-template-columns: 1fr;
            }

            .contact-card.full-width {
              grid-column: auto;
            }
          }

          @media (max-width: 768px) {
            .contact-hero {
              padding: 4rem 1.5rem 3rem;
            }

            .contact-title {
              font-size: 2.5rem;
            }

            .contact-subtitle {
              font-size: 1rem;
            }

            .contact-card {
              padding: 2rem 1.5rem;
            }

            .email-display {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
