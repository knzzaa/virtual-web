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
 * Material API Service
 */
class MaterialService {
  /**
   * Get all materials with like status
   * @returns {Promise<Array>}
   */
  async getAllMaterials() {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(API_ENDPOINTS.MATERIALS, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch materials");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  }

  /**
   * Get single material by slug
   * @param {string} slug - Material slug
   * @returns {Promise<Object>}
   */
  async getMaterialBySlug(slug) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.MATERIALS}/${slug}`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Material not found");
        }
        throw new Error("Failed to fetch material");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching material:", error);
      throw error;
    }
  }

  /**
   * Toggle like status for material
   * @param {string} slug - Material slug
   * @returns {Promise<Object>} - { liked: boolean }
   */
  async toggleMaterialLike(slug) {
    try {
      // throw new Error("Error");
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await fetch(`${API_ENDPOINTS.MATERIALS}/${slug}/like`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }
}

/**
 * UI Helper Functions
 */
class MaterialUI {
  /**
   * Get gradient class based on index
   * @param {number} index - Material index
   * @returns {string}
   */
  getGradientClass(index) {
    const gradients = ["gradient-1", "gradient-2", "gradient-3", "gradient-4"];
    return gradients[index % gradients.length];
  }

  /**
   * Render material card
   * @param {Object} material - Material object
   * @param {number} index - Index for gradient
   * @returns {string} - HTML string
   */
  renderMaterialCard(material, index) {
    const gradientClass = this.getGradientClass(index);
    const likedClass = material.isLikedByUser ? "liked" : "";

    return `
      <a href="view.html?slug=${material.slug}" class="card ${gradientClass}">
        <img
          src="../../assets/img/books.png"
          alt="Book icon"
          class="card-icon"
        />
        <h3>${this.escapeHtml(material.title)}</h3>
        <button
          class="heart ${likedClass}"
          data-slug="${material.slug}"
          onclick="event.preventDefault(); event.stopPropagation(); window.materialUI.handleLikeClick(this);"
        >
          ❤
        </button>
      </a>
    `;
  }

  /**
   * Handle like button click
   * @param {HTMLElement} button - Like button element
   */
  async handleLikeClick(button) {
    const slug = button.getAttribute("data-slug");
    const materialService = new MaterialService();

    try {
      // Optimistically update UI
      button.classList.toggle("liked");

      // Call API
      const result = await materialService.toggleMaterialLike(slug);

      // Sync with server response
      if (result.liked) {
        button.classList.add("liked");
      } else {
        button.classList.remove("liked");
      }
    } catch (error) {
      // Revert on error
      button.classList.toggle("liked");
      console.error("Failed to toggle like:", error);
      alert("Failed to update like status. Please try again.");
    }
  }

  /**
   * Render materials grid
   * @param {Array} materials - Array of materials
   * @param {HTMLElement} container - Container element
   */
  renderMaterialsGrid(materials, container) {
    if (!materials || materials.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📚</div>
          <p class="empty-text">No materials available yet.</p>
        </div>
      `;
      return;
    }

    const html = materials
      .map((material, index) => this.renderMaterialCard(material, index))
      .join("");

    container.innerHTML = html;
  }

  /**
   * Show loading state
   * @param {HTMLElement} container - Container element
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Loading materials...</p>
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
 * Initialize materials list page
 */
async function initMaterialsListPage() {
  const container = document.getElementById("materialsGrid");
  if (!container) return;

  const materialService = new MaterialService();
  const materialUI = new MaterialUI();

  try {
    materialUI.showLoading(container);
    const materials = await materialService.getAllMaterials();
    materialUI.renderMaterialsGrid(materials, container);
  } catch (error) {
    console.error("Failed to load materials:", error);
    materialUI.showError(
      container,
      "Failed to load materials. Please try again."
    );
  }
}

/**
 * Initialize material detail page
 */
async function initMaterialDetailPage() {
  const container = document.getElementById("materialContent");
  if (!container) return;

  const urlUtils = new URLUtils();
  const slug = urlUtils.getQueryParam("slug");
  const materialService = new MaterialService();
  const materialUI = new MaterialUI();

  if (!slug) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p class="empty-text">No material specified.</p>
        <a href="index.html" class="retry-btn btn-link">
          Go back to materials list
        </a>
      </div>
    `;
    return;
  }

  try {
    // Show loading
    materialUI.showLoading(container);

    // Fetch material
    const material = await materialService.getMaterialBySlug(slug);

    // Update page title
    document.title = `EnglishLab - ${material.title}`;
    const pageTitle = document.getElementById("pageTitle");
    if (pageTitle) {
      pageTitle.textContent = `EnglishLab - ${material.title}`;
    }

    // Render material
    renderMaterialDetail(material, container, materialUI);
  } catch (error) {
    console.error("Failed to load material:", error);

    const errorMessage =
      error.message === "Material not found"
        ? "Material not found."
        : "Failed to load material. Please try again.";

    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">${
          error.message === "Material not found" ? "Not Found" : "Error"
        }</h3>
        <p class="error-message">${materialUI.escapeHtml(errorMessage)}</p>
        <a href="index.html" class="retry-btn btn-link">
          Go back to materials list
        </a>
      </div>
    `;
  }
}

/**
 * Render material detail content
 * @param {Object} material - Material object
 * @param {HTMLElement} container - Container element
 * @param {MaterialUI} materialUI - MaterialUI instance
 */
function renderMaterialDetail(material, container, materialUI) {
  const likedClass = material.isLikedByUser ? "liked" : "";

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-content">
        <h2 class="page-title">${materialUI.escapeHtml(material.title)}</h2>
        ${
          material.description
            ? `<p class="page-subtitle">${materialUI.escapeHtml(
                material.description
              )}</p>`
            : ""
        }
      </div>
      <button
        class="heart ${likedClass}"
        data-slug="${material.slug}"
        id="materialLikeBtn"
      >
        ❤
      </button>
    </div>

    <div class="content-card">
      ${material.contentHtml}
    </div>
  `;

  // Attach event listener to like button
  const likeBtn = document.getElementById("materialLikeBtn");
  if (likeBtn) {
    likeBtn.addEventListener("click", () => handleMaterialLike(likeBtn));
  }
}

/**
 * Handle material like button click
 * @param {HTMLElement} button - Like button element
 */
async function handleMaterialLike(button) {
  const slug = button.getAttribute("data-slug");
  const materialService = new MaterialService();

  try {
    // Optimistically update UI
    button.classList.toggle("liked");

    // Call API
    const result = await materialService.toggleMaterialLike(slug);

    // Sync with server response
    if (result.liked) {
      button.classList.add("liked");
    } else {
      button.classList.remove("liked");
    }
  } catch (error) {
    // Revert on error
    button.classList.toggle("liked");
    console.error("Failed to toggle like:", error);
    alert("Failed to update like status. Please try again.");
  }
}

// Create singleton instances
const materialService = new MaterialService();
const materialUI = new MaterialUI();
const urlUtils = new URLUtils();

// Make materialUI and init functions available globally
window.materialUI = materialUI;
window.initMaterialsListPage = initMaterialsListPage;
window.initMaterialDetailPage = initMaterialDetailPage;

// Export for module usage
export {
  MaterialService,
  MaterialUI,
  URLUtils,
  materialService,
  materialUI,
  urlUtils,
  initMaterialsListPage,
  initMaterialDetailPage,
};
