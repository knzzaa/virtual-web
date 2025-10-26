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
 * Exam API Service
 */
class ExamService {
  /**
   * Get all exams
   * @returns {Promise<Array>}
   */
  async getAllExams() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(API_ENDPOINTS.EXAMS, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  }

  /**
   * Get single exam by slug with questions
   * @param {string} slug - Exam slug
   * @returns {Promise<Object>}
   */
  async getExamBySlug(slug) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.EXAMS}/${slug}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Exam not found");
        }
        throw new Error("Failed to fetch exam");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error;
    }
  }

  /**
   * Submit exam answers
   * @param {string} slug - Exam slug
   * @param {Object} answers - { "1": "answer1", "2": "0" }
   * @returns {Promise<Object>}
   */
  async submitExam(slug, answers) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.EXAMS}/${slug}/submit`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit exam");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting exam:", error);
      throw error;
    }
  }

  /**
   * Get exam submission history
   * @param {string} slug - Exam slug
   * @returns {Promise<Array>}
   */
  async getExamSubmissionHistory(slug) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(
        `${API_ENDPOINTS.EXAMS}/${slug}/submissions`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch submission history");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching submission history:", error);
      throw error;
    }
  }
}

/**
 * UI Helper Functions
 */
class ExamUI {
  /**
   * Get gradient class based on index
   * @param {number} index - Exam index
   * @returns {string}
   */
  getGradientClass(index) {
    const gradients = ["gradient-1", "gradient-2", "gradient-3", "gradient-4"];
    return gradients[index % gradients.length];
  }

  /**
   * Render exam card
   * @param {Object} exam - Exam object
   * @param {number} index - Index for gradient
   * @returns {string} - HTML string
   */
  renderExamCard(exam, index) {
    const gradientClass = this.getGradientClass(index);

    return `
      <a href="view.html?slug=${exam.slug}" class="card ${gradientClass}">
        <img
          src="../../assets/img/clock.png"
          alt="Clock icon"
          class="card-icon"
        />
        <h3>${this.escapeHtml(exam.title)}</h3>
      </a>
    `;
  }

  /**
   * Render exams grid
   * @param {Array} exams - Array of exams
   * @param {HTMLElement} container - Container element
   */
  renderExamsGrid(exams, container) {
    if (!exams || exams.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-text">No exams available yet.</p>
        </div>
      `;
      return;
    }

    const html = exams
      .map((exam, index) => this.renderExamCard(exam, index))
      .join("");

    container.innerHTML = html;
  }

  /**
   * Render exam question based on type
   * @param {Object} question - Question object
   * @returns {string} - HTML string
   */
  renderQuestion(question) {
    if (question.questionType === "text") {
      // Replace underscores with input fields
      const inputHtml = `<input
        type="text"
        class="inline-input"
        id="q${question.questionNumber}"
        data-question-number="${question.questionNumber}"
        required
      />`;

      // Replace one or more consecutive underscores with the input element
      const questionWithInput = question.questionText.replace(
        /_{1,}/g,
        inputHtml
      );

      return `
        <li class="question-item">
          ${questionWithInput}
        </li>
      `;
    } else if (question.questionType === "radio") {
      const optionsHtml = question.options
        .map(
          (option, index) => `
          <label class="radio-label">
            <input
              type="radio"
              name="q${question.questionNumber}"
              value="${index}"
              data-question-number="${question.questionNumber}"
              required
            />
            ${this.escapeHtml(option)}
          </label>
        `
        )
        .join("");

      return `
        <li class="question-item">
          ${question.questionText}
          <div class="radio-options">
            ${optionsHtml}
          </div>
        </li>
      `;
    }
  }

  /**
   * Show loading state
   * @param {HTMLElement} container - Container element
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading exam...</p>
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
   * Show result message
   * @param {Object} result - Exam result
   * @param {HTMLElement} resultContainer - Result message container
   */
  showResult(result, resultContainer) {
    const { score, totalQuestions, percentage, results } = result;

    let message = "";
    let bgColor = "";
    let textColor = "";
    let borderColor = "";

    if (score === totalQuestions) {
      message = `🎉 Perfect! You got all ${totalQuestions} answers correct!`;
      bgColor = "#d4edda";
      textColor = "#155724";
      borderColor = "#c3e6cb";
    } else if (percentage >= 70) {
      message = `✅ Great job! You got ${score} out of ${totalQuestions} correct (${percentage}%)`;
      bgColor = "#d1ecf1";
      textColor = "#0c5460";
      borderColor = "#bee5eb";
    } else {
      message = `📝 You got ${score} out of ${totalQuestions} correct (${percentage}%). Keep practicing!`;
      bgColor = "#fff3cd";
      textColor = "#856404";
      borderColor = "#ffeaa7";
    }

    resultContainer.textContent = message;
    resultContainer.style.background = bgColor;
    resultContainer.style.color = textColor;
    resultContainer.style.border = `1px solid ${borderColor}`;
    resultContainer.classList.add("show");

    // Highlight wrong answers
    results.forEach((result) => {
      if (!result.isCorrect) {
        const input = document.querySelector(
          `[data-question-number="${result.questionNumber}"]`
        );
        if (input) {
          if (input.type === "text") {
            input.classList.add("wrong");
            // Show correct answer
            const correctSpan = document.createElement("span");
            correctSpan.style.color = "#28a745";
            correctSpan.style.marginLeft = "10px";
            correctSpan.textContent = `Correct: ${result.correctAnswer}`;
            input.parentElement.appendChild(correctSpan);
          } else if (input.type === "radio") {
            // Find all radios with the same name
            const radios = document.getElementsByName(input.name);
            radios.forEach((radio, idx) => {
              if (idx === result.correctOptionIndex) {
                radio.parentElement.style.background = "#d4edda";
                radio.parentElement.style.border = "1px solid #28a745";
              }
            });
          }
        }
      }
    });

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

/**
 * URL Utility Functions
 */
class URLUtils {
  /**
   * Get query parameter from URL
   * @param {string} param - Parameter name
   * @returns {string|null}
   */
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /**
   * Set query parameter in URL
   * @param {string} param - Parameter name
   * @param {string} value - Parameter value
   */
  setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, "", url);
  }
}

/**
 * Page Initialization Functions
 */

/**
 * Initialize exams list page
 */
async function initExamsListPage() {
  const container = document.getElementById("examsGrid");
  if (!container) return;

  const examService = new ExamService();
  const examUI = new ExamUI();

  try {
    examUI.showLoading(container);
    const exams = await examService.getAllExams();
    examUI.renderExamsGrid(exams, container);
  } catch (error) {
    console.error("Failed to load exams:", error);
    examUI.showError(container, "Failed to load exams. Please try again.");
  }
}

/**
 * Initialize exam detail page
 */
async function initExamDetailPage() {
  const container = document.getElementById("examContent");
  if (!container) return;

  const urlUtils = new URLUtils();
  const slug = urlUtils.getQueryParam("slug");
  const examService = new ExamService();
  const examUI = new ExamUI();

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

    // Fetch exam
    const examData = await examService.getExamBySlug(slug);

    // Update page title
    document.title = `EnglishLab - ${examData.exam.title}`;
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = `EnglishLab - ${examData.exam.title}`;
    }

    // Render exam
    renderExamDetail(examData, container, examUI, examService, slug);
  } catch (error) {
    console.error("Failed to load exam:", error);

    const errorMessage =
      error.message === "Exam not found"
        ? "Exam not found."
        : "Failed to load exam. Please try again.";

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

/**
 * Render exam detail content
 * @param {Object} examData - Exam data with questions
 * @param {HTMLElement} container - Container element
 * @param {ExamUI} examUI - ExamUI instance
 * @param {ExamService} examService - ExamService instance
 * @param {string} slug - Exam slug
 */
function renderExamDetail(examData, container, examUI, examService, slug) {
  const { exam, questions } = examData;

  const questionsHtml = questions.map((q) => examUI.renderQuestion(q)).join("");

  container.innerHTML = `
    <div class="exam-header">
      <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 class="exam-title">${examUI.escapeHtml(exam.title)}</h2>
          ${
            exam.description
              ? `<p class="exam-description">${examUI.escapeHtml(
                  exam.description
                )}</p>`
              : ""
          }
        </div>
        <a href="history.html?slug=${slug}" class="btn" style="background: #6c757d;">
          View History
        </a>
      </div>
    </div>

    <div class="content-card">
      ${exam.htmlContent || ""}

      <form id="examForm">
        <ol class="questions-list">
          ${questionsHtml}
        </ol>

        <div class="button-group">
          <button type="submit" class="btn">SUBMIT ANSWERS</button>
          <button type="button" class="btn btn-retry" id="retryBtn" style="display: none;">
            TRY AGAIN
          </button>
        </div>
      </form>

      <div id="resultMessage" class="result-message"></div>
    </div>
  `;

  // Attach event listeners
  const form = document.getElementById("examForm");
  const retryBtn = document.getElementById("retryBtn");
  const resultMsg = document.getElementById("resultMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Collect answers
    const answers = {};
    questions.forEach((q) => {
      if (q.questionType === "text") {
        const input = document.getElementById(`q${q.questionNumber}`);
        answers[q.questionNumber] = input.value.trim();
      } else if (q.questionType === "radio") {
        const selected = document.querySelector(
          `input[name="q${q.questionNumber}"]:checked`
        );
        if (selected) {
          answers[q.questionNumber] = selected.value;
        }
      }
    });

    try {
      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      // Submit to API
      const result = await examService.submitExam(slug, answers);

      // Show result
      examUI.showResult(result, resultMsg);

      // Hide submit button and show try again button
      submitBtn.style.display = "none";
      retryBtn.style.display = "inline-block";
    } catch (error) {
      console.error("Failed to submit exam:", error);
      alert("Failed to submit exam. Please try again.");

      // Re-enable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = "SUBMIT ANSWERS";
    }
  });

  retryBtn.addEventListener("click", () => {
    form.reset();
    resultMsg.classList.remove("show");
    resultMsg.textContent = "";

    // Show submit button and hide try again button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.style.display = "inline-block";
    submitBtn.disabled = false;
    submitBtn.textContent = "SUBMIT ANSWERS";
    retryBtn.style.display = "none";

    // Remove wrong highlights
    document.querySelectorAll("input, label").forEach((el) => {
      el.classList.remove("wrong", "correct");
      el.style.background = "";
      el.style.border = "";
    });

    // Remove correct answer hints
    document.querySelectorAll("span[style*='color']").forEach((span) => {
      if (span.textContent.startsWith("Correct:")) {
        span.remove();
      }
    });
  });
}

// Create singleton instances
const examService = new ExamService();
const examUI = new ExamUI();
const urlUtils = new URLUtils();

// Make instances and init functions available globally
window.examUI = examUI;
window.initExamsListPage = initExamsListPage;
window.initExamDetailPage = initExamDetailPage;

// Export for module usage
export {
  ExamService,
  ExamUI,
  URLUtils,
  examService,
  examUI,
  urlUtils,
  initExamsListPage,
  initExamDetailPage,
};
