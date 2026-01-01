import Constants from "expo-constants";

/**
 * Determine API base URL in order of precedence:
 * 1. EXPO_PUBLIC_API_BASE_URL environment variable (recommended)
 * 2. Packager/debugger host (when running in Expo dev) -> use its IP with port 3000
 * 3. Detect if running on Android Emulator -> use 10.0.2.2:3000
 * 4. Fallback to localhost:3000 (works on iOS simulator)
 */
function detectApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;

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

  // For production Android device, use Mac's IP address (192.168.100.196)
  // Update this if Mac's IP changes
  return "http://192.168.100.196:3000";
}

export const API_BASE_URL = detectApiBaseUrl();