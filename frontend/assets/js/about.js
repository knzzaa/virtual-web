import auth from './auth.js';

async function updateUIBasedOnAuth() {
  const isAuth = await auth.isAuthenticated();
  const navLinks = document.getElementById('navLinks');
  const footerLinks = document.getElementById('footerLinks');
  const aboutCtaTitle = document.getElementById('aboutCtaTitle');
  const aboutCtaDescription = document.getElementById('aboutCtaDescription');
  const aboutCtaButtons = document.getElementById('aboutCtaButtons');

  if (isAuth) {
    // User is authenticated - show dashboard button
    navLinks.innerHTML = `
      <a href="dashboard/material/index.html" class="nav-btn">Dashboard</a>
    `;

    // Update CTA for authenticated users
    aboutCtaTitle.textContent = 'Continue Your Learning Journey';
    aboutCtaDescription.textContent = 'Access your materials, exams, and missions in the dashboard';
    aboutCtaButtons.innerHTML = `
      <a href="dashboard/material/index.html" class="btn">Go to Dashboard</a>
    `;

    // Show Learn links for authenticated users
    footerLinks.innerHTML = `
      <div class="footer-column">
        <h4>Learn</h4>
        <a href="dashboard/material/index.html">Materials</a>
        <a href="dashboard/exam/index.html">Exams</a>
        <a href="dashboard/mission/index.html">Missions</a>
      </div>
      <div class="footer-column">
        <h4>About</h4>
        <a href="about.html">About Us</a>
      </div>
    `;
  } else {
    // User is not authenticated - show login/signup
    navLinks.innerHTML = `
      <a href="auth/login.html" class="nav-link">Login</a>
      <a href="auth/register.html" class="nav-btn">Sign Up</a>
    `;

    // Update CTA for unauthenticated users
    aboutCtaTitle.textContent = 'Ready to Start Your English Journey?';
    aboutCtaDescription.textContent = 'Join thousands of learners improving their English skills every day';
    aboutCtaButtons.innerHTML = `
      <a href="auth/register.html" class="btn">Get Started</a>
      <a href="auth/login.html" class="btn btn-secondary">Login</a>
    `;

    // Show only About for unauthenticated users
    footerLinks.innerHTML = `
      <div class="footer-column">
        <h4>About</h4>
        <a href="about.html">About Us</a>
      </div>
    `;
  }
}

// Run on page load
updateUIBasedOnAuth();
