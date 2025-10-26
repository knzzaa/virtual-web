import { Hono, Context } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getAllMaterials, getMaterialBySlug, toggleMaterialLike } from "../services/material.service";
import { UserContext } from "../dtos/auth.dto";

const materialRouter = new Hono();

// All material routes require authentication
materialRouter.use("*", authMiddleware);

// GET /api/materials - List all materials
materialRouter.get("/", async (c: Context) => {
  const user = c.get("user") as UserContext;
  const materials = await getAllMaterials(user.userId);
  return c.json(materials);
});

// GET /api/materials/:slug - Get single material
materialRouter.get("/:slug", async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as UserContext;
  const material = await getMaterialBySlug(slug, user.userId);
  return c.json(material);
});

// POST /api/materials/:slug/like - Toggle like
materialRouter.post("/:slug/like", async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as UserContext;
  const result = await toggleMaterialLike(slug, user.userId);
  return c.json(result);
});

export default materialRouter;
