import axiosInstance from './axiosInstance';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Log in user with username and password.
   * Calls POST /api/auth/login
   *
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ token: string }>}
   */
  async login(credentials) {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user with username and password.
   * Calls POST /api/auth/register
   * Note: The role is automatically assigned by the backend.
   *
   * @param {{ username: string, password: string }} userData
   * @returns {Promise<{ id: number, username: string, role: string }>}
   */
  async register(userData) {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },
};
