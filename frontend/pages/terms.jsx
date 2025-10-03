import { useEffect } from 'react';
import Layout from '../src/components/Layout';

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service - Guide2Anime';
  }, []);

  return (
    <Layout>
      <div className="policy-page">
        <div className="policy-hero">
          <div className="hero-gradient"></div>
          <h1 className="policy-title">Terms of Service</h1>
          <p className="policy-subtitle">Please read these terms carefully</p>
          <div className="hero-decoration"></div>
        </div>

        <div className="policy-container">
          <div className="policy-content">
            <section className="policy-section">
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using Guide2Anime, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section className="policy-section">
              <h2>Use License</h2>
              <p>
                Permission is granted to temporarily access the materials (information or software) 
                on Guide2Anime for personal, non-commercial transitory viewing only. This is the 
                grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>User Account</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current 
                information. Failure to do so constitutes a breach of the Terms. You are responsible 
                for safeguarding your password and for all activities that occur under your account.
              </p>
            </section>

            <section className="policy-section">
              <h2>User Content</h2>
              <p>
                Our service allows you to post, link, store, share and otherwise make available certain 
                information, text, graphics, or other material. You are responsible for the content you 
                post, including:
              </p>
              <ul>
                <li>Anime reviews and ratings</li>
                <li>Comments and feedback</li>
                <li>Profile information</li>
                <li>Any other user-generated content</li>
              </ul>
              <p>
                By posting content, you grant us the right and license to use, modify, perform, display, 
                reproduce, and distribute such content on and through the service.
              </p>
            </section>

            <section className="policy-section">
              <h2>Prohibited Uses</h2>
              <p>
                You may not use our service:
              </p>
              <ul>
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any harmful or objectionable content</li>
                <li>To impersonate or attempt to impersonate another user</li>
                <li>To engage in any automated data collection (scraping, bots, etc.)</li>
                <li>To interfere with or disrupt the service or servers</li>
                <li>To upload viruses or other malicious code</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>Intellectual Property</h2>
              <p>
                The service and its original content (excluding user-generated content), features, and 
                functionality are owned by Guide2Anime and are protected by international copyright, 
                trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                Anime data is provided by third-party APIs (Jikan, AniList, MangaDex) and remains the 
                property of their respective owners.
              </p>
            </section>

            <section className="policy-section">
              <h2>Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms. Upon 
                termination, your right to use the service will immediately cease.
              </p>
            </section>

            <section className="policy-section">
              <h2>Limitation of Liability</h2>
              <p>
                In no event shall Guide2Anime, nor its directors, employees, partners, agents, suppliers, 
                or affiliates, be liable for any indirect, incidental, special, consequential or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other 
                intangible losses.
              </p>
            </section>

            <section className="policy-section">
              <h2>Disclaimer</h2>
              <p>
                Your use of the service is at your sole risk. The service is provided on an "AS IS" and 
                "AS AVAILABLE" basis. The service is provided without warranties of any kind, whether 
                express or implied.
              </p>
            </section>

            <section className="policy-section">
              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is 
                material, we will try to provide at least 30 days' notice prior to any new terms taking 
                effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="last-updated">Last Updated: October 3, 2025</p>
            </section>

            <section className="policy-section contact-section">
              <h2>Questions?</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
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
            background: radial-gradient(circle, rgba(221, 42, 123, 0.1) 0%, transparent 70%);
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
