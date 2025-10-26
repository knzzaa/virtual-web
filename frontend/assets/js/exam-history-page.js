import auth from "./auth.js";
import { examService, examUI, urlUtils } from "./exam.js";

// Handle logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.logout();
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  });
}

// Handle back button
const backLink = document.getElementById("backLink");
if (backLink) {
  const slug = urlUtils.getQueryParam("slug");
  if (slug) {
    backLink.href = `view.html?slug=${slug}`;
  } else {
    backLink.href = "index.html";
  }
}

/**
 * Format date to readable string
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string}
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Get score badge class based on percentage
 * @param {number} score - Score
 * @param {number} total - Total questions
 * @returns {string}
 */
function getScoreBadgeClass(score, total) {
  const percentage = (score / total) * 100;
  if (percentage === 100) return "perfect";
  if (percentage >= 70) return "good";
  return "needs-improvement";
}

/**
 * Render submission history table
 * @param {Array} submissions - Array of submissions
 * @param {Object} exam - Exam object
 * @param {HTMLElement} container - Container element
 */
function renderHistoryTable(submissions, exam, container) {
  if (!submissions || submissions.length === 0) {
    container.innerHTML = `
      <div class="no-submissions">
        <div class="no-submissions-icon">📝</div>
        <p class="no-submissions-text">You haven't submitted this exam yet.</p>
        <a href="view.html?slug=${exam.slug}" class="no-submissions-link">
          Take the Exam
        </a>
      </div>
    `;
    return;
  }

  const rowsHtml = submissions
    .map((submission, index) => {
      const percentage = Math.round(
        (submission.score / submission.totalQuestions) * 100
      );
      const badgeClass = getScoreBadgeClass(
        submission.score,
        submission.totalQuestions
      );

      return `
      <tr>
        <td class="number" data-label="#">${index + 1}</td>
        <td data-label="Score">
          <span class="score-badge ${badgeClass}">
            ${submission.score} / ${submission.totalQuestions}
          </span>
          <span class="percentage-badge ${badgeClass}">
            ${percentage}%
          </span>
        </td>
        <td class="date-cell" data-label="Submitted At">
          ${formatDate(submission.submittedAt)}
        </td>
      </tr>
    `;
    })
    .join("");

  container.innerHTML = `
    <div class="history-header">
      <h2 class="history-title">${examUI.escapeHtml(exam.title)}</h2>
      <p class="history-description">Submission History</p>
    </div>

    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th style="width: 80px;">#</th>
            <th>Score</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 2rem;">
      <a href="view.html?slug=${exam.slug}" class="btn">
        Take Exam Again
      </a>
    </div>
  `;
}

/**
 * Initialize submission history page
 */
async function initHistoryPage() {
  const container = document.getElementById("historyContent");
  if (!container) return;

  const slug = urlUtils.getQueryParam("slug");

  if (!slug) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">No exam specified.</p>
        <a href="index.html" class="retry-btn btn-link">
          Go back to exams list
        </a>
      </div>
    `;
    return;
  }

  try {
    // Show loading
    examUI.showLoading(container);

    // Fetch exam info and submission history
    const [examData, submissions] = await Promise.all([
      examService.getExamBySlug(slug),
      examService.getExamSubmissionHistory(slug),
    ]);

    // Update page title
    document.title = `EnglishLab - ${examData.exam.title} - History`;
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = `EnglishLab - ${examData.exam.title} - History`;
    }

    // Render history table
    renderHistoryTable(submissions, examData.exam, container);
  } catch (error) {
    console.error("Failed to load submission history:", error);

    const errorMessage =
      error.message === "Exam not found"
        ? "Exam not found."
        : "Failed to load submission history. Please try again.";

    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">${
          error.message === "Exam not found" ? "Not Found" : "Error"
        }</h3>
        <p class="error-message">${examUI.escapeHtml(errorMessage)}</p>
        <a href="index.html" class="retry-btn btn-link">
          Go back to exams list
        </a>
      </div>
    `;
  }
}

// Initialize page
initHistoryPage();
