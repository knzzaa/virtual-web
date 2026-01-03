import Constants from "expo-constants";

const DEFAULT_PROD_API_BASE_URL = "https://virtual-web-ratu-dina-be.vercel.app";

/**
 * Determine API base URL in order of precedence:
 * 1. EXPO_PUBLIC_API_BASE_URL environment variable (recommended)
 * 2. Packager/debugger host (when running in Expo dev) -> use its IP with port 3000
 * 3. Detect if running on Android Emulator -> use 10.0.2.2:3000
 * 4. Production fallback to hosted API
 */
function detectApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;

  const extraBaseUrl = (Constants.expoConfig as any)?.extra?.apiBaseUrl;
  if (typeof extraBaseUrl === "string" && extraBaseUrl.length > 0) return extraBaseUrl;

  // When running in Expo dev, the debuggerHost contains '<ip>:<port>' (e.g. '172.20.10.2:8081')
  const dbgHost = (Constants.manifest as any)?.debuggerHost || (Constants.expoConfig as any)?.packagerOpts?.devClient?.host;
  if (typeof dbgHost === "string" && dbgHost.includes(":")) {
    const ip = dbgHost.split(":")[0];
    return `http://${ip}:3000`;
  }

  // Android Emulator uses 10.0.2.2 to access host machine
  // This is the default gateway IP in Android emulator
  if (__DEV__) {
    return "http://10.0.2.2:3000";
  }

  // Production fallback: hosted API
  return DEFAULT_PROD_API_BASE_URL;
}

export const API_BASE_URL = detectApiBaseUrl();