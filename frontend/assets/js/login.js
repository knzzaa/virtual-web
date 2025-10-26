import auth from "./auth.js";

// Check if user is already authenticated, redirect to dashboard
async function checkAuthAndRedirect() {
  const isAuth = await auth.isAuthenticated();
  if (isAuth) {
    window.location.href = "/dashboard/material/index.html";
  }
}

// Handle login form submission
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Clear previous messages
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
  successMessage.textContent = "";
  successMessage.style.display = "none";

  // Get form data
  const formData = new FormData(loginForm);
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    // Disable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "LOGGING IN...";

    // Call login API
    await auth.login(data);

    // Show success message
    successMessage.textContent = "Login successful! Redirecting...";
    successMessage.style.display = "block";

    // Redirect to dashboard or intended page
    setTimeout(() => {
      const redirectUrl = auth.getRedirectAfterLogin();
      window.location.href = redirectUrl;
    }, 500);
  } catch (error) {
    // Show error message
    errorMessage.textContent =
      error.message || "Login failed. Please try again.";
    errorMessage.style.display = "block";

    // Re-enable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "LOGIN";
  }
});

// Run auth check on page load
checkAuthAndRedirect();
