import { Hono, Context } from "hono";
import { setCookie } from "hono/cookie";
import { authMiddleware } from "../middlewares/auth.middleware";
import { register, login } from "../services/auth.service";
import { registerSchema, loginSchema, UserContext } from "../dtos/auth.dto";

const authRouter = new Hono();

// POST /api/auth/register - Register a new user
authRouter.post("/register", async (c) => {
  const body = await c.req.json();

  // Validate input
  const validationResult = registerSchema.safeParse(body);
  if (!validationResult.success) {
    return c.json({ error: validationResult.error.issues }, 400);
  }

  // Register user using service
  const result = await register(validationResult.data);

  // Set HTTP-only cookie
  setCookie(c, "token", result.token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return c.json(
    {
      message: result.message,
      user: result.user,
      token: result.token, // Also return in response for non-browser clients
    },
    201
  );
});

// POST /api/auth/login - Login user
authRouter.post("/login", async (c) => {
  const body = await c.req.json();

  // Validate input
  const validationResult = loginSchema.safeParse(body);
  if (!validationResult.success) {
    return c.json({ error: validationResult.error.issues }, 400);
  }

  // Login user using service
  const result = await login(validationResult.data);

  // Set HTTP-only cookie
  setCookie(c, "token", result.token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return c.json({
    message: result.message,
    user: result.user,
    token: result.token, // Also return in response for non-browser clients
  });
});

// GET /api/auth/me - Get current user (protected route)
authRouter.get("/me", authMiddleware, async (c: Context) => {
  const user = c.get("user") as UserContext;
  return c.json({ user });
});

// POST /api/auth/logout - Logout user
authRouter.post("/logout", async (c) => {
  // Clear the cookie
  setCookie(c, "token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0,
    path: "/",
  });

  return c.json({ message: "Logged out successfully" });
});

export default authRouter;
