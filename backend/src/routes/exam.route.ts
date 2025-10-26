import { Hono, Context } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getAllExams, getExamBySlug, submitExam, getExamSubmissionHistory } from "../services/exam.service";
import { examSubmitSchema } from "../dtos/exam.dto";
import { UserContext } from "../dtos/auth.dto";

const examRouter = new Hono();

// All exam routes require authentication
examRouter.use("*", authMiddleware);

// GET /api/exams - List all exams
examRouter.get("/", async (c: Context) => {
  const exams = await getAllExams();
  return c.json(exams);
});

// GET /api/exams/:slug - Get exam with questions (no answers)
examRouter.get("/:slug", async (c: Context) => {
  const slug = c.req.param("slug");
  const exam = await getExamBySlug(slug);
  return c.json(exam);
});

// POST /api/exams/:slug/submit - Submit exam answers
examRouter.post("/:slug/submit", async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as UserContext;
  const body = await c.req.json();

  // Validate input
  const validationResult = examSubmitSchema.safeParse(body);
  if (!validationResult.success) {
    return c.json({ error: validationResult.error.issues }, 400);
  }

  const result = await submitExam(slug, user.userId, validationResult.data);
  return c.json(result);
});

// GET /api/exams/:slug/submissions - Get submission history for exam
examRouter.get("/:slug/submissions", async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as UserContext;
  const history = await getExamSubmissionHistory(slug, user.userId);
  return c.json(history);
});

export default examRouter;
