import { useEffect } from 'react';
import Layout from '../src/components/Layout';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Guide2Anime';
  }, []);

  return (
    <Layout>
      <div className="policy-page">
        <div className="policy-hero">
          <div className="hero-gradient"></div>
          <h1 className="policy-title">Privacy Policy</h1>
          <p className="policy-subtitle">Your privacy matters to us</p>
          <div className="hero-decoration"></div>
        </div>

        <div className="policy-container">
          <div className="policy-content">
            <section className="policy-section">
              <h2>Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you create an account, 
                update your profile, use our services, or communicate with us. This may include:
              </p>
              <ul>
                <li>Name and email address</li>
                <li>Profile information and preferences</li>
                <li>Anime watchlist and ratings</li>
                <li>Reviews and feedback</li>
                <li>Communication history</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul>
                <li>Personalizing your anime recommendations</li>
                <li>Managing your account and preferences</li>
                <li>Sending you updates and notifications</li>
                <li>Responding to your requests and support inquiries</li>
                <li>Improving our platform and user experience</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. We use 
                industry-standard encryption and security practices to safeguard your data.
              </p>
            </section>

            <section className="policy-section">
              <h2>Third-Party Services</h2>
              <p>
                We may use third-party services (such as Jikan API, AniList API, and MangaDex API) to 
                provide anime and manga information. These services may have their own privacy policies, 
                and we encourage you to review them.
              </p>
            </section>

            <section className="policy-section">
              <h2>Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and 
                store certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </section>

            <section className="policy-section">
              <h2>Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. 
                You can also request a copy of your data or object to certain processing activities. 
                To exercise these rights, please contact us.
              </p>
            </section>

            <section className="policy-section">
              <h2>Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p className="last-updated">Last Updated: October 3, 2025</p>
            </section>

            <section className="policy-section contact-section">
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <a href="mailto:szproduction447@gmail.com" className="contact-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email Us
              </a>
            </section>
          </div>
        </div>

        <style jsx>{`
          .policy-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
          }

          .policy-hero {
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
            background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
            pointer-events: none;
          }

          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
          }

          .policy-title {
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

          .policy-subtitle {
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

          .policy-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 2rem 4rem;
          }

          .policy-content {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 215, 0, 0.2);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: fadeInUp 0.6s ease-out 0.4s both;
          }

          .policy-section {
            margin-bottom: 3rem;
          }

          .policy-section:last-child {
            margin-bottom: 0;
          }

          .policy-section h2 {
            font-size: 1.75rem;
            color: #ffd700;
            margin: 0 0 1rem 0;
            font-weight: 600;
            position: relative;
            padding-bottom: 0.75rem;
          }

          .policy-section h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #ffd700, #dd2a7b);
            border-radius: 2px;
          }

          .policy-section p {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.8;
            margin: 0 0 1rem 0;
            font-size: 1rem;
          }

          .policy-section ul {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
          }

          .policy-section ul li {
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.8;
            margin: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
          }

          .policy-section ul li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: #dd2a7b;
            font-weight: bold;
          }

          .last-updated {
            font-style: italic;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
            margin-top: 1.5rem;
          }

          .contact-section {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 215, 0, 0.2);
          }

          .contact-button {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            margin-top: 1rem;
            background: linear-gradient(135deg, #ffd700, #dd2a7b);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
          }

          .contact-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(255, 215, 0, 0.5);
          }

          .contact-button svg {
            width: 20px;
            height: 20px;
          }

          @media (max-width: 768px) {
            .policy-hero {
              padding: 4rem 1.5rem 3rem;
            }

            .policy-title {
              font-size: 2.5rem;
            }

            .policy-subtitle {
              font-size: 1rem;
            }

            .policy-content {
              padding: 2rem 1.5rem;
            }

            .policy-section h2 {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
