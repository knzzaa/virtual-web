// API Configuration
// TODO: GANTI NANTI (GA ADA MEKANISME .ENV UTK STATIC HTML CSS JS)
const API_BASE_URL = "https://virtual-web-ratu-be.vercel.app";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  MATERIALS: `${API_BASE_URL}/api/materials`,
  EXAMS: `${API_BASE_URL}/api/exams`,
  MISSIONS: `${API_BASE_URL}/api/missions`,
};

export default API_BASE_URL;
