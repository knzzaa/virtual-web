import { db } from "../db";
import { exams, examQuestions, examSubmissions } from "../db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import {
  ExamListItem,
  ExamDetailResponse,
  ExamSubmitInput,
  ExamSubmitResponse,
  ExamQuestionResponse,
  ExamResultItem,
  ExamSubmissionHistoryItem,
} from "../dtos/exam.dto";
import { NotFoundException, BadRequestException } from "../utils/exceptions";
import { QuestionType } from "../types/enums";

/**
 * Get all exams
 */
export async function getAllExams(): Promise<ExamListItem[]> {
  const result = await db
    .select({
      id: exams.id,
      slug: exams.slug,
      title: exams.title,
      description: exams.description,
      orderIndex: exams.orderIndex,
    })
    .from(exams)
    .orderBy(asc(exams.orderIndex));

  return result;
}

/**
 * Get exam with questions (without answers)
 */
export async function getExamBySlug(slug: string): Promise<ExamDetailResponse> {
  // Get exam
  const [exam] = await db
    .select({
      id: exams.id,
      slug: exams.slug,
      title: exams.title,
      description: exams.description,
      htmlContent: exams.htmlContent,
    })
    .from(exams)
    .where(eq(exams.slug, slug))
    .limit(1);

  if (!exam) {
    throw new NotFoundException("Exam not found");
  }

  // Get questions (without correct answers)
  const questions = await db
    .select({
      id: examQuestions.id,
      questionNumber: examQuestions.questionNumber,
      questionType: examQuestions.questionType,
      questionText: examQuestions.questionText,
      options: examQuestions.options,
    })
    .from(examQuestions)
    .where(eq(examQuestions.examId, exam.id))
    .orderBy(asc(examQuestions.orderIndex));

  const formattedQuestions: ExamQuestionResponse[] = questions.map((q) => ({
    id: q.id,
    questionNumber: q.questionNumber,
    questionType: q.questionType as QuestionType,
    questionText: q.questionText,
    options: q.questionType === QuestionType.RADIO ? (q.options as string[]) : undefined,
  }));

  return {
    exam,
    questions: formattedQuestions,
  };
}

/**
 * Submit exam answers and validate
 */
export async function submitExam(
  slug: string,
  userId: number,
  input: ExamSubmitInput
): Promise<ExamSubmitResponse> {
  // Get exam
  const [exam] = await db
    .select({ id: exams.id })
    .from(exams)
    .where(eq(exams.slug, slug))
    .limit(1);

  if (!exam) {
    throw new NotFoundException("Exam not found");
  }

  // Get all questions with correct answers
  const questions = await db
    .select()
    .from(examQuestions)
    .where(eq(examQuestions.examId, exam.id))
    .orderBy(asc(examQuestions.orderIndex));

  if (questions.length === 0) {
    throw new BadRequestException("Exam has no questions");
  }

  // Validate answers
  let score = 0;
  const results: ExamResultItem[] = [];

  for (const question of questions) {
    const userAnswer = input.answers[question.questionNumber.toString()];
    let isCorrect = false;

    if (question.questionType === QuestionType.TEXT) {
      // Case-insensitive comparison for text answers
      isCorrect =
        userAnswer?.trim().toLowerCase() ===
        question.correctAnswer?.toLowerCase();

      results.push({
        questionNumber: question.questionNumber,
        isCorrect,
        correctAnswer: isCorrect ? undefined : question.correctAnswer!,
      });
    } else if (question.questionType === QuestionType.RADIO) {
      // Parse user answer as integer
      const selectedIndex = parseInt(userAnswer);
      isCorrect = selectedIndex === question.correctOptionIndex;

      results.push({
        questionNumber: question.questionNumber,
        isCorrect,
        correctOptionIndex: isCorrect
          ? undefined
          : question.correctOptionIndex!,
      });
    }

    if (isCorrect) {
      score++;
    }
  }

  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Save submission to database
  const [submission] = await db
    .insert(examSubmissions)
    .values({
      userId,
      examId: exam.id,
      answers: input.answers,
      score,
      totalQuestions,
    })
    .returning({ id: examSubmissions.id });

  return {
    submissionId: submission.id,
    score,
    totalQuestions,
    percentage,
    results,
  };
}

/**
 * Get exam submission history for a specific exam
 */
export async function getExamSubmissionHistory(
  slug: string,
  userId: number
): Promise<ExamSubmissionHistoryItem[]> {
  // Get exam
  const [exam] = await db
    .select({ id: exams.id })
    .from(exams)
    .where(eq(exams.slug, slug))
    .limit(1);

  if (!exam) {
    throw new NotFoundException("Exam not found");
  }

  // Get submission history
  const submissions = await db
    .select({
      id: examSubmissions.id,
      score: examSubmissions.score,
      totalQuestions: examSubmissions.totalQuestions,
      submittedAt: examSubmissions.submittedAt,
    })
    .from(examSubmissions)
    .where(
      and(eq(examSubmissions.examId, exam.id), eq(examSubmissions.userId, userId))
    )
    .orderBy(desc(examSubmissions.submittedAt));

  return submissions.map((s) => ({
    id: s.id,
    score: s.score,
    totalQuestions: s.totalQuestions,
    submittedAt: s.submittedAt,
  }));
}
