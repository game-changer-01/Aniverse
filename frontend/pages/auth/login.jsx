import React from 'react';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function LoginPage() {
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
            <p className="brand-subtitle">Welcome Back!</p>
            <p className="brand-description">Sign in to access personalized anime recommendations</p>
          </div>

          <div className="clerk-wrapper">
            <SignIn 
              routing="hash"
              afterSignInUrl="/recommendations"
              afterSignUpUrl="/recommendations"
              signUpUrl="/auth/signup"
              forceRedirectUrl="/recommendations"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

LoginPage.getLayout = function getLayout(page) {
  return page;
};
