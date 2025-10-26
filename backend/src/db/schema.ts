import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ===== USERS TABLE =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== CONTENT TABLES =====

// Materials table
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentHtml: text("content_html").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Exams table
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  htmlContent: text("html_content"), // content before the question list
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Exam questions table
export const examQuestions = pgTable("exam_questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  questionNumber: integer("question_number").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(), // 'text' or 'radio'
  questionText: text("question_text").notNull(),
  correctAnswer: varchar("correct_answer", { length: 255 }), // for 'text' type
  options: jsonb("options"), // for 'radio' type
  correctOptionIndex: integer("correct_option_index"), // for 'radio' type
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Missions table
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mission questions table
export const missionQuestions = pgTable("mission_questions", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(),
  correctOptionIndex: integer("correct_option_index").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== USER STATE TABLES =====

// Material likes table
export const materialLikes = pgTable(
  "material_likes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("material_likes_user_material_unique").on(
      table.userId,
      table.materialId
    ),
  ]
);

// Exam submissions table
export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Mission progress table (temporary state while taking mission)
export const missionProgress = pgTable(
  "mission_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missionId: integer("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    answers: jsonb("answers").notNull(), // { "1": 0, "2": 1 }
    currentScore: integer("current_score").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("mission_progress_user_mission_unique").on(
      table.userId,
      table.missionId
    ),
  ]
);

// Mission completions table
export const missionCompletions = pgTable("mission_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  missionId: integer("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// ===== TYPE EXPORTS =====
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type NewExamQuestion = typeof examQuestions.$inferInsert;

export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;

export type MissionQuestion = typeof missionQuestions.$inferSelect;
export type NewMissionQuestion = typeof missionQuestions.$inferInsert;

export type MaterialLike = typeof materialLikes.$inferSelect;
export type NewMaterialLike = typeof materialLikes.$inferInsert;

export type ExamSubmission = typeof examSubmissions.$inferSelect;
export type NewExamSubmission = typeof examSubmissions.$inferInsert;

export type MissionProgress = typeof missionProgress.$inferSelect;
export type NewMissionProgress = typeof missionProgress.$inferInsert;

export type MissionCompletion = typeof missionCompletions.$inferSelect;
export type NewMissionCompletion = typeof missionCompletions.$inferInsert;
