import { API_ENDPOINTS } from "./config.js";

/**
 * Helper function to get auth headers
 * @returns {Object}
 */
function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists (Safari fallback)
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Mission API Service
 */
class MissionService {
  /**
   * Get next uncompleted mission for user (with resume support)
   * @returns {Promise<Object>}
   */
  async getNextMission() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.MISSIONS}/next`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch next mission");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching next mission:", error);
      throw error;
    }
  }

  /**
   * Submit answer for current question
   * @param {string} slug - Mission slug
   * @param {number} questionNumber - Current question number
   * @param {number} selectedOptionIndex - Index of selected option
   * @returns {Promise<Object>}
   */
  async submitAnswer(slug, questionNumber, selectedOptionIndex) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.MISSIONS}/${slug}/answer`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionNumber,
          selectedOptionIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  }

  /**
   * Get mission completion history
   * @returns {Promise<Array>}
   */
  async getCompletionHistory() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.MISSIONS}/completions`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch completion history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching completion history:", error);
      throw error;
    }
  }
}

/**
 * UI Helper Functions
 */
class MissionUI {
  /**
   * Show loading state
   * @param {HTMLElement} container - Container element
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading mission...</p>
      </div>
    `;
  }

  /**
   * Show error state
   * @param {HTMLElement} container - Container element
   * @param {string} message - Error message
   */
  showError(container, message) {
    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Oops! Something went wrong</h3>
        <p class="error-message">${this.escapeHtml(message)}</p>
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

  /**
   * Show empty/completed state
   * @param {HTMLElement} container - Container element
   * @param {string} message - Message to display
   */
  showEmpty(container, message) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <p class="empty-text">${this.escapeHtml(message)}</p>
        <a href="../material/index.html" class="retry-btn btn-link">
          Go back to materials
        </a>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render question with options
   * @param {Object} question - Question object
   * @param {HTMLElement} questionEl - Question element
   * @param {HTMLElement} optionsEl - Options element
   * @param {Function} onSelect - Callback when option is selected
   */
  renderQuestion(question, questionEl, optionsEl, onSelect) {
    questionEl.textContent = question.questionText;
    optionsEl.innerHTML = "";

    question.options.forEach((option, idx) => {
      const div = document.createElement("div");
      div.classList.add("option");

      // Check if option is an image URL (contains file extensions)
      if (this.isImageUrl(option)) {
        // Check if it's an external URL or local path
        const imageSrc =
          option.startsWith("http://") || option.startsWith("https://")
            ? option
            : `../../assets/img/${option}`;

        const img = document.createElement("img");
        img.src = imageSrc;
        img.style.cssText =
          "border-radius: 10px; object-fit: cover; width: 100%; height: 100%;";
        img.alt = `Option ${idx + 1}`;
        img.onerror = () => {
          console.error(`Failed to load image: ${imageSrc}`);
          div.innerHTML = `<span style="color: red;">Image failed to load</span>`;
        };
        div.appendChild(img);
      } else {
        // Text option
        div.innerHTML = `<span>${this.escapeHtml(option)}</span>`;
      }

      div.addEventListener("click", () => onSelect(idx, div));
      optionsEl.appendChild(div);
    });
  }

  /**
   * Check if string is an image URL
   * @param {string} str - String to check
   * @returns {boolean}
   */
  isImageUrl(str) {
    if (!str) return false;

    // Check if it's a URL (http/https)
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return true; // Assume all external URLs are images for now
    }

    // Check for common image extensions for local files
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return imageExtensions.some((ext) => str.toLowerCase().includes(ext));
  }

  /**
   * Update progress bar
   * @param {number} questionsAnswered - Number of questions answered (0-based)
   * @param {number} total - Total questions
   * @param {HTMLElement} progressEl - Progress element
   */
  updateProgress(questionsAnswered, total, progressEl) {
    const percent = (questionsAnswered / total) * 100;
    progressEl.style.width = percent + "%";
  }

  /**
   * Show result bar (correct/wrong feedback)
   * @param {boolean} isCorrect - Whether answer was correct
   * @param {HTMLElement} resultBar - Result bar element
   * @param {HTMLElement} resultText - Result text element
   * @param {HTMLElement} correctIcon - Correct icon element
   * @param {HTMLElement} wrongIcon - Wrong icon element
   */
  showResultBar(isCorrect, resultBar, resultText, correctIcon, wrongIcon) {
    resultText.textContent = isCorrect ? "Excellent!" : "Wrong :(";

    // Remove previous classes
    resultBar.classList.remove("correct", "wrong");

    if (isCorrect) {
      correctIcon.style.display = "flex";
      wrongIcon.style.display = "none";
      resultBar.classList.add("correct");
    } else {
      correctIcon.style.display = "none";
      wrongIcon.style.display = "flex";
      resultBar.classList.add("wrong");
    }
    resultBar.style.display = "flex";
  }

  /**
   * Hide result bar
   * @param {HTMLElement} resultBar - Result bar element
   */
  hideResultBar(resultBar) {
    resultBar.style.display = "none";
  }

  /**
   * Show final screen
   * @param {number} score - Final score
   * @param {number} total - Total questions
   * @param {number} percentage - Percentage score
   * @param {HTMLElement} finalScreen - Final screen element
   * @param {HTMLElement} scoreText - Score text element
   * @param {HTMLElement} quizSection - Quiz section element
   * @param {HTMLElement} progressEl - Progress element
   */
  showFinalScreen(
    score,
    total,
    percentage,
    finalScreen,
    scoreText,
    quizSection,
    progressEl
  ) {
    quizSection.style.display = "none";
    finalScreen.classList.add("show");
    finalScreen.style.display = "block";
    progressEl.style.width = "100%";
    scoreText.textContent = `You got ${score} out of ${total} correct! (${percentage}%) 🎉`;
  }
}

/**
 * Mission Controller - Handles mission quiz flow
 */
class MissionController {
  constructor() {
    this.missionService = new MissionService();
    this.missionUI = new MissionUI();
    this.currentMission = null;
    this.currentQuestion = null;
    this.currentScore = 0;
    this.isProcessing = false;

    // DOM elements
    this.questionEl = null;
    this.optionsEl = null;
    this.progressEl = null;
    this.resultBar = null;
    this.resultText = null;
    this.finalScreen = null;
    this.scoreText = null;
    this.quizSection = null;
    this.correctIcon = null;
    this.wrongIcon = null;
    this.restartBtn = null;
  }

  /**
   * Initialize DOM elements
   */
  initElements() {
    this.questionEl = document.getElementById("question");
    this.optionsEl = document.getElementById("options");
    this.progressEl = document.getElementById("progress");
    this.resultBar = document.getElementById("result");
    this.resultText = document.getElementById("resultText");
    this.finalScreen = document.getElementById("final-screen");
    this.scoreText = document.getElementById("score");
    this.quizSection = document.getElementById("quiz-section");
    this.correctIcon = document.getElementById("correctAnswer");
    this.wrongIcon = document.getElementById("wrongAnswer");
    this.restartBtn = document.getElementById("restart");
  }

  /**
   * Load mission and start quiz
   */
  async loadMission() {
    try {
      // Show loading state initially
      this.questionEl.textContent = "";
      this.optionsEl.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Loading mission...</p>
        </div>
      `;

      const data = await this.missionService.getNextMission();

      // Check if all missions are completed
      if (!data.mission) {
        this.optionsEl.innerHTML = "";
        this.questionEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <p class="empty-text">${
              data.message || "All missions completed!"
            }</p>
            <a href="../material/index.html" class="retry-btn btn-link">
              Go back to materials
            </a>
          </div>
        `;
        return;
      }

      // Store mission data
      this.currentMission = data.mission;
      this.currentQuestion = data.currentQuestion;
      this.currentScore = data.progress?.currentScore || 0;

      // Clear loading state
      this.optionsEl.innerHTML = "";

      // Show quiz section
      this.quizSection.style.display = "block";

      // Render first question
      this.renderCurrentQuestion();

      // Update progress - show questions answered, not current question
      this.missionUI.updateProgress(
        data.progress?.questionsAnswered || 0,
        data.mission.totalQuestions,
        this.progressEl
      );
    } catch (error) {
      console.error("Failed to load mission:", error);
      this.optionsEl.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Oops! Something went wrong</h3>
          <p class="error-message">Failed to load mission. Please try again.</p>
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

  /**
   * Render current question
   */
  renderCurrentQuestion() {
    if (!this.currentQuestion) return;

    this.missionUI.renderQuestion(
      this.currentQuestion,
      this.questionEl,
      this.optionsEl,
      (idx, div) => this.handleAnswer(idx, div)
    );
  }

  /**
   * Handle answer selection
   * @param {number} selectedIndex - Index of selected option
   * @param {HTMLElement} div - Selected option element
   */
  async handleAnswer(selectedIndex, div) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Add active class
    div.classList.add("active");

    try {
      // Submit answer to backend
      const result = await this.missionService.submitAnswer(
        this.currentMission.slug,
        this.currentQuestion.questionNumber,
        selectedIndex
      );

      // Update score
      this.currentScore = result.currentScore;

      // Show result feedback
      this.missionUI.showResultBar(
        result.isCorrect,
        this.resultBar,
        this.resultText,
        this.correctIcon,
        this.wrongIcon
      );

      // Wait 1.5 seconds before moving to next question or showing results
      setTimeout(() => {
        this.missionUI.hideResultBar(this.resultBar);

        if (result.completed) {
          // Show final screen
          this.missionUI.showFinalScreen(
            result.finalScore,
            result.totalQuestions,
            result.percentage,
            this.finalScreen,
            this.scoreText,
            this.quizSection,
            this.progressEl
          );
        } else if (result.nextQuestion) {
          // Load next question
          this.currentQuestion = result.nextQuestion;
          this.renderCurrentQuestion();

          // Update progress - show number of questions answered (current question number - 1)
          this.missionUI.updateProgress(
            result.nextQuestion.questionNumber - 1,
            this.currentMission.totalQuestions,
            this.progressEl
          );
        }

        this.isProcessing = false;
      }, 1500);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
      div.classList.remove("active");
      this.isProcessing = false;
    }
  }

  /**
   * Initialize mission controller
   */
  init() {
    this.initElements();
    this.loadMission();
  }
}

// Create singleton instances
const missionService = new MissionService();
const missionUI = new MissionUI();

// Make available globally for direct page scripts
window.missionService = missionService;
window.missionUI = missionUI;
window.MissionController = MissionController;

// Export for module usage
export {
  MissionService,
  MissionUI,
  MissionController,
  missionService,
  missionUI,
};
