import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Verify token and get user data
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token: newToken, ...userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('aniverse.justAuthed', '1');
      setToken(newToken);
      setUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error?.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, ...userInfo } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('aniverse.justAuthed', '1');
      setToken(newToken);
      setUser(userInfo);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error?.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google', { credential });
      const { token: newToken, ...userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', newToken);
      localStorage.setItem('aniverse.justAuthed', '1');
      setToken(newToken);
      setUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error?.response?.data?.error || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('aniverse.justAuthed');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};