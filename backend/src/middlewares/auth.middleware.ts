import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifyToken } from "../utils/jwt";
import { UserContext } from "../dtos/auth.dto";

export const authMiddleware = async (
  c: Context,
  next: Next
): Promise<Response | void> => {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Try to get token from cookie
      token = getCookie(c, "token");
    }

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    // Verify token and get user data from JWT payload (stateless)
    const payload = await verifyToken(token);

    // Attach user data to context
    const user: UserContext = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };

    c.set("user", user);

    return await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
