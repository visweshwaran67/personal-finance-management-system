import axios from 'axios';

// Resolve base URL from environment or fallback to Spring Boot default port 8080
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token from sessionStorage to protected requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handler & session expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error or server not running
      const networkError = new Error(
        'Unable to reach backend server. Please verify the Spring Boot service is running on ' + baseURL
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized (Expired or invalid token)
    if (status === 401) {
      // Don't redirect if the user was simply failing a login attempt on /api/auth/login
      const isAuthEndpoint = error.config.url?.includes('/api/auth/login');
      if (!isAuthEndpoint) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Dispatch event for reactive auth update across the app
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }

    // Extract human-readable error messages from Spring Boot responses
    let message = 'An unexpected error occurred. Please try again.';
    let fieldErrors = null;

    if (typeof data === 'string' && data.trim()) {
      message = data;
    } else if (data && typeof data === 'object') {
      if (data.message) {
        message = data.message;
      } else if (status === 400) {
        // Validation errors map: { amount: "must be positive", description: "is required" }
        fieldErrors = data;
        const messages = Object.values(data);
        if (messages.length > 0) {
          message = messages.join('. ');
        } else {
          message = 'Validation failed. Please verify the entered data.';
        }
      } else if (status === 403) {
        message = 'Access forbidden. You do not have permission for this resource.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      }
    }

    error.normalizedMessage = message;
    error.fieldErrors = fieldErrors;
    return Promise.reject(error);
  }
);

export default axiosInstance;
