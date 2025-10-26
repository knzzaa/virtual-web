import auth from "./auth.js";
import { MissionController } from "./mission.js";

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

// Initialize mission controller
const missionController = new MissionController();
missionController.init();
