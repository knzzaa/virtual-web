import auth from './auth.js';

async function updateUIBasedOnAuth() {
  const isAuth = await auth.isAuthenticated();
  const navLinks = document.getElementById('navLinks');
  const heroButtons = document.getElementById('heroButtons');
  const footerLinks = document.getElementById('footerLinks');
  const ctaTitle = document.getElementById('ctaTitle');
  const ctaDescription = document.getElementById('ctaDescription');
  const ctaButton = document.getElementById('ctaButton');

  if (isAuth) {
    // User is authenticated - show dashboard button
    navLinks.innerHTML = `
      <a href="dashboard/material/index.html" class="nav-btn">Dashboard</a>
    `;

    heroButtons.innerHTML = `
      <a href="dashboard/material/index.html" class="btn btn-primary">
        Go to Dashboard
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    `;

    // Update CTA section for authenticated users
    ctaTitle.textContent = 'Continue your learning journey';
    ctaDescription.textContent = 'Access your materials, exams, and missions';
    ctaButton.innerHTML = `
      <a href="dashboard/material/index.html" class="btn btn-light">
        Go to Dashboard
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
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

    heroButtons.innerHTML = `
      <a href="auth/register.html" class="btn btn-primary">
        Get Started
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
      <a href="auth/login.html" class="btn btn-secondary">Login</a>
    `;

    // Update CTA section for unauthenticated users
    ctaTitle.textContent = 'Ready to start learning?';
    ctaDescription.textContent = 'Join thousands of learners improving their English skills every day';
    ctaButton.innerHTML = `
      <a href="auth/register.html" class="btn btn-light">
        Create Free Account
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
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
