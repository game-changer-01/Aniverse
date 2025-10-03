import React from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function AuthDebugPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', background: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      <h1>Clerk Authentication Debug</h1>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#16213e', borderRadius: '8px' }}>
        <h2>Status:</h2>
        <p><strong>Is Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
        <p><strong>Is Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
        
        {isSignedIn && user && (
          <div style={{ marginTop: '1rem' }}>
            <h3>User Info:</h3>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}</p>
            <p><strong>Username:</strong> {user.username || 'N/A'}</p>
            <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {isSignedIn ? (
          <>
            <button 
              onClick={handleSignOut}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e3c770',
                border: 'none',
                borderRadius: '8px',
                color: '#1a1a2e',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
            <button 
              onClick={() => router.push('/recommendations')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#5856d6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go to Recommendations
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => router.push('/auth/login')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e3c770',
                border: 'none',
                borderRadius: '8px',
                color: '#1a1a2e',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
            <button 
              onClick={() => router.push('/auth/signup')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dd2a7b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go to Signup
            </button>
          </>
        )}
        <button 
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#16213e',
            border: '1px solid #e3c770',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

AuthDebugPage.getLayout = function getLayout(page) {
  return page;
};
