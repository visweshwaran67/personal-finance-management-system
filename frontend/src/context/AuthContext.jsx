import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

/**
 * Safely parse JWT payload without external dependencies.
 */
function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT payload', err);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      const payload = parseJwtPayload(storedToken);
      if (payload) {
        return {
          username: payload.sub || 'User',
          role: payload.role || 'USER',
        };
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on initial load
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      const payload = parseJwtPayload(storedToken);
      if (payload) {
        // Check if token has expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          // Token expired
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          setUser({
            username: payload.sub || 'User',
            role: payload.role || 'USER',
          });
        }
      } else {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Listen for session expiration events from axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Log in user
   * @param {string} username
   * @param {string} password
   */
  const login = async (username, password) => {
    const data = await authApi.login({ username, password });
    if (data && data.token) {
      sessionStorage.setItem('token', data.token);
      setToken(data.token);

      const payload = parseJwtPayload(data.token);
      const authenticatedUser = {
        username: payload?.sub || username,
        role: payload?.role || 'USER',
      };
      setUser(authenticatedUser);
      return authenticatedUser;
    } else {
      throw new Error('Authentication succeeded but token was missing from response.');
    }
  };

  /**
   * Log out user and clean up session
   */
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
