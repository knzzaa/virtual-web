import Constants from "expo-constants";

/**
 * Determine API base URL in order of precedence:
 * 1. EXPO_PUBLIC_API_BASE_URL environment variable (recommended)
 * 2. Packager/debugger host (when running in Expo dev) -> use its IP with port 3000
 * 3. Fallback to localhost:3000 (works on iOS simulator)
 */
function detectApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;

  // When running in Expo dev, the debuggerHost contains '<ip>:<port>' (e.g. '172.20.10.2:8081')
  const dbgHost = (Constants.manifest as any)?.debuggerHost || (Constants.expoConfig as any)?.packagerOpts?.devClient?.host;
  if (typeof dbgHost === "string" && dbgHost.includes(":")) {
    const ip = dbgHost.split(":")[0];
    return `http://${ip}:3000`;
  }

  // Generic fallback — works for iOS simulator but not for physical devices
  return "http://localhost:3000";
}

export const API_BASE_URL = detectApiBaseUrl();