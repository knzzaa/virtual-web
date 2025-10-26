import auth from "./auth.js";

// Check if user is already authenticated, redirect to dashboard
async function checkAuthAndRedirect() {
  const isAuth = await auth.isAuthenticated();
  if (isAuth) {
    window.location.href = "/dashboard/material/index.html";
  }
}

// Handle register form submission
const registerForm = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Clear previous messages
  errorMessage.textContent = "";
  errorMessage.style.display = "none";
  successMessage.textContent = "";
  successMessage.style.display = "none";

  // Get form data
  const formData = new FormData(registerForm);
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Check if passwords match
  if (password !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match!";
    errorMessage.style.display = "block";
    return;
  }

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: password,
  };

  try {
    // Disable submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "CREATING ACCOUNT...";

    // Call register API
    await auth.register(data);

    // Show success message
    successMessage.textContent = "Account created successfully! Redirecting...";
    successMessage.style.display = "block";

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard/material/index.html";
    }, 500);
  } catch (error) {
    // Show error message
    errorMessage.textContent =
      error.message || "Registration failed. Please try again.";
    errorMessage.style.display = "block";

    // Re-enable submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "SIGN UP";
  }
});

// Run auth check on page load
checkAuthAndRedirect();
