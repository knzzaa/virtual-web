import auth from "./auth.js";
import { missionService, missionUI } from "./mission.js";

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
 * Render mission completion history table
 * @param {Array} completions - Array of mission completions
 * @param {HTMLElement} container - Container element
 */
function renderHistoryTable(completions, container) {
  if (!completions || completions.length === 0) {
    container.innerHTML = `
      <div class="history-header">
        <h2 class="history-title">Mission Completion History</h2>
        <p class="history-description">View all your completed missions</p>
      </div>

      <div class="no-submissions">
        <div class="no-submissions-icon">🎯</div>
        <p class="no-submissions-text">You haven't completed any missions yet.</p>
        <a href="index.html" class="no-submissions-link">
          Start Your First Mission
        </a>
      </div>
    `;
    return;
  }

  const rowsHtml = completions
    .map((completion, index) => {
      const percentage = Math.round(
        (completion.score / completion.totalQuestions) * 100
      );
      const badgeClass = getScoreBadgeClass(
        completion.score,
        completion.totalQuestions
      );

      return `
        <tr>
          <td class="number" data-label="#">${index + 1}</td>
          <td data-label="Mission">${missionUI.escapeHtml(
            completion.missionTitle
          )}</td>
          <td data-label="Score">
            <span class="score-badge ${badgeClass}">
              ${completion.score} / ${completion.totalQuestions}
            </span>
            <span class="percentage-badge ${badgeClass}">
              ${percentage}%
            </span>
          </td>
          <td class="date-cell" data-label="Completed At">
            ${formatDate(completion.completedAt)}
          </td>
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="history-header">
      <h2 class="history-title">Mission Completion History</h2>
      <p class="history-description">
        View all your completed missions and track your progress
      </p>
    </div>

    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th style="width: 80px;">#</th>
            <th>Mission</th>
            <th>Score</th>
            <th>Completed At</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Initialize mission history page
 */
async function initMissionHistoryPage() {
  const container = document.getElementById("historyContent");
  if (!container) return;

  try {
    // Show loading
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading mission history...</p>
      </div>
    `;

    // Fetch mission completion history
    const completions = await missionService.getCompletionHistory();

    // Render history table
    renderHistoryTable(completions, container);
  } catch (error) {
    console.error("Failed to load mission history:", error);

    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Error</h3>
        <p class="error-message">Failed to load mission history. Please try again.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Retry
        </button>
      </div>
    `;
  }
}

// Initialize page
initMissionHistoryPage();
