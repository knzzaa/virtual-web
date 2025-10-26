import auth from "./auth.js";
import { missionService } from "./mission.js";

/**
 * Initialize mission index page
 * Fetches next mission and displays info dynamically
 */
async function initMissionIndexPage() {
  const missionHeroText = document.querySelector(".mission-hero-text");
  const startButton = document.querySelector(".mission-start-btn");

  if (!missionHeroText) return;

  try {
    // Fetch next mission
    const data = await missionService.getNextMission();

    // Check if all missions are completed
    if (!data.mission) {
      missionHeroText.innerHTML = `
        <h1 class="mission-title">All Missions Completed! 🎉</h1>
        <p class="mission-subtitle">
          Congratulations! You've completed all available missions.
          Check back later for new challenges!
        </p>
        <a href="../material/index.html" class="cta-btn mission-start-btn">
          <span>Back to Materials</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      `;
      return;
    }

    const mission = data.mission;
    const progress = data.progress;

    // Check if this is a resumed mission
    const isResuming = progress && progress.questionsAnswered > 0;

    // Update mission title and description
    const titleEl = missionHeroText.querySelector(".mission-title");
    const subtitleEl = missionHeroText.querySelector(".mission-subtitle");

    if (titleEl) {
      titleEl.textContent = mission.title;
    }

    if (subtitleEl && mission.description) {
      subtitleEl.textContent = mission.description;
    }

    // Update stats
    const statItems = missionHeroText.querySelectorAll(".stat-item");
    if (statItems.length >= 2) {
      // Update questions stat
      const questionsValue = statItems[0].querySelector(".stat-value");
      const questionsLabel = statItems[0].querySelector(".stat-label");
      if (questionsValue) {
        if (isResuming) {
          questionsValue.textContent = `${progress.questionsAnswered}/${mission.totalQuestions}`;
          if (questionsLabel) {
            questionsLabel.textContent = "Progress";
          }
        } else {
          questionsValue.textContent = mission.totalQuestions;
          if (questionsLabel) {
            questionsLabel.textContent = "Questions";
          }
        }
      }

      // Time estimate stays the same (could be dynamic based on questions)
      // Keep the existing time display
    }

    // Update start button text if resuming
    if (startButton && isResuming) {
      const buttonText = startButton.querySelector("span");
      if (buttonText) {
        buttonText.textContent = "Continue Mission";
      }
    }

    // Update start button link to include mission slug
    if (startButton) {
      startButton.href = `show.html?slug=${mission.slug}`;
    }

    // Show score if resuming
    if (isResuming && progress.currentScore > 0) {
      const statsContainer = missionHeroText.querySelector(".mission-stats");
      if (statsContainer) {
        // Add a score stat item
        const scoreStatHtml = `
          <div class="stat-item">
            <div class="stat-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">${progress.currentScore}</span>
              <span class="stat-label">Current Score</span>
            </div>
          </div>
        `;
        statsContainer.insertAdjacentHTML("beforeend", scoreStatHtml);
      }
    }
  } catch (error) {
    console.error("Failed to load mission info:", error);
    // Keep the default static content if fetch fails
    // Optionally show an error message
    if (missionHeroText) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.style.cssText =
        "background: #fff3cd; color: #856404; padding: 1rem; border-radius: 8px; margin-top: 1rem;";
      errorDiv.textContent =
        "Unable to load mission info. Please try again later.";
      missionHeroText.appendChild(errorDiv);
    }
  }
}

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

// Initialize page
initMissionIndexPage();
