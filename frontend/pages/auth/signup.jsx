import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(email, password, name);
    if (result.success) {
      router.push('/recommendations');
    } else {
      setError(result.message || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px' }}>
        <Link href="/">Back to Home</Link>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: '1rem' }}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#ffd700', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Sign Up
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link href="/auth/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

SignupPage.getLayout = function getLayout(page) {
  return page;
};
