import auth from "./auth.js";

/**
 * Protected route guard
 * Checks if user is authenticated, redirects to login if not
 */
async function protectRoute() {
  const isAuth = await auth.isAuthenticated();

  if (!isAuth) {
    // Store current URL for redirect after login
    const currentPath = window.location.pathname;
    sessionStorage.setItem("redirectAfterLogin", currentPath);

    // Redirect to login
    window.location.href = "/auth/login.html";
  }
}

// Run protection check immediately
protectRoute();

export default protectRoute;
