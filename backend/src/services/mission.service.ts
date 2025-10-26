import { db } from "../db";
import {
  missions,
  missionQuestions,
  missionProgress,
  missionCompletions,
} from "../db/schema";
import { eq, and, asc, desc, isNull } from "drizzle-orm";
import {
  MissionNextResponse,
  MissionAnswerInput,
  MissionAnswerResponse,
  MissionCompletionHistoryItem,
} from "../dtos/mission.dto";
import { NotFoundException, BadRequestException } from "../utils/exceptions";

/**
 * Get next uncompleted mission for user (with resume support)
 */
export async function getNextMission(
  userId: number
): Promise<MissionNextResponse> {
  // First, check if user has an unfinished mission (in progress)
  const [inProgressMission] = await db
    .select({
      progressId: missionProgress.id,
      missionId: missionProgress.missionId,
      answers: missionProgress.answers,
      currentScore: missionProgress.currentScore,
      missionSlug: missions.slug,
      missionTitle: missions.title,
      missionDescription: missions.description,
    })
    .from(missionProgress)
    .innerJoin(missions, eq(missions.id, missionProgress.missionId))
    .where(eq(missionProgress.userId, userId))
    .limit(1);

  // If user has a mission in progress, resume it
  if (inProgressMission) {
    // Get all questions for this mission
    const questions = await db
      .select({
        questionNumber: missionQuestions.questionNumber,
        questionText: missionQuestions.questionText,
        options: missionQuestions.options,
      })
      .from(missionQuestions)
      .where(eq(missionQuestions.missionId, inProgressMission.missionId))
      .orderBy(asc(missionQuestions.orderIndex));

    if (questions.length === 0) {
      throw new BadRequestException("Mission has no questions");
    }

    const answersObj = inProgressMission.answers as Record<string, number>;
    const questionsAnswered = Object.keys(answersObj).length;
    const nextQuestionNumber = questionsAnswered + 1;

    // Find the next unanswered question
    const nextQuestion = questions.find(
      (q) => q.questionNumber === nextQuestionNumber
    );

    if (!nextQuestion) {
      // This shouldn't happen, but handle gracefully
      throw new BadRequestException("Next question not found");
    }

    return {
      mission: {
        id: inProgressMission.missionId,
        slug: inProgressMission.missionSlug,
        title: inProgressMission.missionTitle,
        description: inProgressMission.missionDescription,
        totalQuestions: questions.length,
      },
      currentQuestion: {
        questionNumber: nextQuestion.questionNumber,
        questionText: nextQuestion.questionText,
        options: nextQuestion.options as string[],
      },
      progress: {
        currentQuestionNumber: nextQuestionNumber,
        questionsAnswered,
        currentScore: inProgressMission.currentScore,
      },
    };
  }

  // No mission in progress, find first uncompleted mission (by ID, earliest created)
  const result = await db
    .select({
      missionId: missions.id,
      missionSlug: missions.slug,
      missionTitle: missions.title,
      missionDescription: missions.description,
      completionId: missionCompletions.id,
    })
    .from(missions)
    .leftJoin(
      missionCompletions,
      and(
        eq(missionCompletions.missionId, missions.id),
        eq(missionCompletions.userId, userId)
      )
    )
    .where(isNull(missionCompletions.id))
    .orderBy(asc(missions.id))
    .limit(1);

  if (result.length === 0) {
    return {
      mission: null,
      message: "All missions completed!",
    };
  }

  const mission = result[0];

  // Get total question count and first question
  const questions = await db
    .select({
      questionNumber: missionQuestions.questionNumber,
      questionText: missionQuestions.questionText,
      options: missionQuestions.options,
    })
    .from(missionQuestions)
    .where(eq(missionQuestions.missionId, mission.missionId))
    .orderBy(asc(missionQuestions.orderIndex));

  if (questions.length === 0) {
    throw new BadRequestException("Mission has no questions");
  }

  const firstQuestion = questions[0];

  return {
    mission: {
      id: mission.missionId,
      slug: mission.missionSlug,
      title: mission.missionTitle,
      description: mission.missionDescription,
      totalQuestions: questions.length,
    },
    currentQuestion: {
      questionNumber: firstQuestion.questionNumber,
      questionText: firstQuestion.questionText,
      options: firstQuestion.options as string[],
    },
    progress: {
      currentQuestionNumber: 1,
      questionsAnswered: 0,
      currentScore: 0,
    },
  };
}

/**
 * Submit answer for current question
 */
export async function submitMissionAnswer(
  slug: string,
  userId: number,
  input: MissionAnswerInput
): Promise<MissionAnswerResponse> {
  // Get mission
  const [mission] = await db
    .select({ id: missions.id })
    .from(missions)
    .where(eq(missions.slug, slug))
    .limit(1);

  if (!mission) {
    throw new NotFoundException("Mission not found");
  }

  // Get the question being answered
  const [question] = await db
    .select({
      id: missionQuestions.id,
      questionNumber: missionQuestions.questionNumber,
      correctOptionIndex: missionQuestions.correctOptionIndex,
    })
    .from(missionQuestions)
    .where(
      and(
        eq(missionQuestions.missionId, mission.id),
        eq(missionQuestions.questionNumber, input.questionNumber)
      )
    )
    .limit(1);

  if (!question) {
    throw new NotFoundException("Question not found");
  }

  // Check if answer is correct
  const isCorrect = input.selectedOptionIndex === question.correctOptionIndex;

  // Get or create progress
  const [existingProgress] = await db
    .select()
    .from(missionProgress)
    .where(
      and(
        eq(missionProgress.userId, userId),
        eq(missionProgress.missionId, mission.id)
      )
    )
    .limit(1);

  let currentScore: number;
  let updatedAnswers: Record<string, number>;

  if (existingProgress) {
    // Update existing progress
    const previousAnswers =
      (existingProgress.answers as Record<string, number>) || {};
    updatedAnswers = {
      ...previousAnswers,
      [input.questionNumber.toString()]: input.selectedOptionIndex,
    };
    currentScore = existingProgress.currentScore + (isCorrect ? 1 : 0);

    await db
      .update(missionProgress)
      .set({
        answers: updatedAnswers,
        currentScore,
        updatedAt: new Date(),
      })
      .where(eq(missionProgress.id, existingProgress.id));
  } else {
    // Create new progress
    updatedAnswers = {
      [input.questionNumber.toString()]: input.selectedOptionIndex,
    };
    currentScore = isCorrect ? 1 : 0;

    await db.insert(missionProgress).values({
      userId,
      missionId: mission.id,
      answers: updatedAnswers,
      currentScore,
    });
  }

  // Get all questions to check if this was the last one
  const allQuestions = await db
    .select({
      questionNumber: missionQuestions.questionNumber,
    })
    .from(missionQuestions)
    .where(eq(missionQuestions.missionId, mission.id))
    .orderBy(asc(missionQuestions.orderIndex));

  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(updatedAnswers).length;

  // If this was the last question, complete the mission
  if (answeredCount >= totalQuestions) {
    const percentage = Math.round((currentScore / totalQuestions) * 100);

    // Create completion record
    const [completion] = await db
      .insert(missionCompletions)
      .values({
        userId,
        missionId: mission.id,
        score: currentScore,
        totalQuestions,
      })
      .returning({ id: missionCompletions.id });

    // Delete progress
    await db
      .delete(missionProgress)
      .where(
        and(
          eq(missionProgress.userId, userId),
          eq(missionProgress.missionId, mission.id)
        )
      );

    return {
      isCorrect,
      correctOptionIndex: question.correctOptionIndex,
      currentScore,
      completed: true,
      finalScore: currentScore,
      totalQuestions,
      percentage,
      completionId: completion.id,
    };
  }

  // Get next question
  const nextQuestionNumber = input.questionNumber + 1;
  const [nextQuestion] = await db
    .select({
      questionNumber: missionQuestions.questionNumber,
      questionText: missionQuestions.questionText,
      options: missionQuestions.options,
    })
    .from(missionQuestions)
    .where(
      and(
        eq(missionQuestions.missionId, mission.id),
        eq(missionQuestions.questionNumber, nextQuestionNumber)
      )
    )
    .limit(1);

  if (!nextQuestion) {
    throw new NotFoundException("Next question not found");
  }

  return {
    isCorrect,
    correctOptionIndex: question.correctOptionIndex,
    currentScore,
    nextQuestion: {
      questionNumber: nextQuestion.questionNumber,
      questionText: nextQuestion.questionText,
      options: nextQuestion.options as string[],
    },
  };
}

/**
 * Get mission completion history for user
 */
export async function getMissionCompletionHistory(
  userId: number
): Promise<MissionCompletionHistoryItem[]> {
  const completions = await db
    .select({
      id: missionCompletions.id,
      missionId: missionCompletions.missionId,
      missionSlug: missions.slug,
      missionTitle: missions.title,
      score: missionCompletions.score,
      totalQuestions: missionCompletions.totalQuestions,
      completedAt: missionCompletions.completedAt,
    })
    .from(missionCompletions)
    .innerJoin(missions, eq(missions.id, missionCompletions.missionId))
    .where(eq(missionCompletions.userId, userId))
    .orderBy(desc(missionCompletions.completedAt));

  return completions;
}
