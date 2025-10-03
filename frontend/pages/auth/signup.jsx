import React from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="back-link">
            <span className="material-icons">arrow_back</span>
            Back to Home
          </Link>
        </div>
        
        <div className="auth-content">
          <div className="auth-branding">
            <h1 className="brand-title">Guide2Anime</h1>
            <p className="brand-subtitle">Join Us!</p>
            <p className="brand-description">Create an account to get personalized anime recommendations</p>
          </div>

          <div className="clerk-wrapper">
            <SignUp 
              routing="hash"
              afterSignInUrl="/recommendations"
              afterSignUpUrl="/recommendations"
              signInUrl="/auth/login"
              forceRedirectUrl="/recommendations"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

SignupPage.getLayout = function getLayout(page) {
  return page;
};
