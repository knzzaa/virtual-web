import { Hono, Context } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getNextMission, submitMissionAnswer, getMissionCompletionHistory } from "../services/mission.service";
import { missionAnswerSchema } from "../dtos/mission.dto";
import { UserContext } from "../dtos/auth.dto";

const missionRouter = new Hono();

// All mission routes require authentication
missionRouter.use("*", authMiddleware);

// GET /api/missions/next - Get next uncompleted mission
missionRouter.get("/next", async (c: Context) => {
  const user = c.get("user") as UserContext;
  const result = await getNextMission(user.userId);
  return c.json(result);
});

// POST /api/missions/:slug/answer - Submit answer for current question
missionRouter.post("/:slug/answer", async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as UserContext;
  const body = await c.req.json();

  // Validate input
  const validationResult = missionAnswerSchema.safeParse(body);
  if (!validationResult.success) {
    return c.json({ error: validationResult.error.issues }, 400);
  }

  const result = await submitMissionAnswer(slug, user.userId, validationResult.data);
  return c.json(result);
});

// GET /api/missions/completions - Get completion history
missionRouter.get("/completions", async (c: Context) => {
  const user = c.get("user") as UserContext;
  const history = await getMissionCompletionHistory(user.userId);
  return c.json(history);
});

export default missionRouter;
