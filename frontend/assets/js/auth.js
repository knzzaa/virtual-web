import { API_ENDPOINTS } from "./config.js";

/**
 * Auth utility class for handling authentication
 */
class Auth {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Check if user is authenticated by calling /api/auth/me
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      // Get token from localStorage as fallback for Safari
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists (Safari fallback)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: "GET",
        credentials: "include", // Include cookies
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        return true;
      }

      // If auth failed, clear localStorage token
      localStorage.removeItem("auth_token");
      this.currentUser = null;
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      this.currentUser = null;
      return false;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>}
   */
  async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const isAuth = await this.isAuthenticated();
    return isAuth ? this.currentUser : null;
  }

  /**
   * Register a new user
   * @param {Object} data - Registration data (email, password, name)
   * @returns {Promise<Object>}
   */
  async register(data) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Store token in localStorage as fallback for Safari
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
      }

      this.currentUser = result.user;
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} data - Login data (email, password)
   * @returns {Promise<Object>}
   */
  async login(data) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      // Store token in localStorage as fallback for Safari
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
      }

      this.currentUser = result.user;
      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear localStorage token
      localStorage.removeItem("auth_token");
      this.currentUser = null;
    } catch (error) {
      console.error("Logout error:", error);
      // Clear localStorage even if logout request fails
      localStorage.removeItem("auth_token");
      throw error;
    }
  }

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    const currentPath = window.location.pathname;
    // Store the intended destination to redirect after login
    sessionStorage.setItem("redirectAfterLogin", currentPath);
    window.location.href = "/auth/login.html";
  }

  /**
   * Redirect to dashboard
   */
  redirectToDashboard() {
    window.location.href = "/dashboard/material/index.html";
  }

  /**
   * Get redirect URL after login
   * @returns {string}
   */
  getRedirectAfterLogin() {
    const redirect = sessionStorage.getItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");
    return redirect || "/dashboard/material/index.html";
  }
}

// Create and export a singleton instance
const auth = new Auth();
export default auth;
