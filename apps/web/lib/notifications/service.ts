import { prisma } from "@/lib/prisma"

/*
 * Notification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised helper for creating notifications from any API route.
 * All AI-triggered events call createNotification() so every new feature
 * automatically surfaces in the notification bell without extra work.
 */

export type NotificationType =
  | "RESUME_ANALYSIS_COMPLETE"
  | "SKILL_GAP_UPDATE"
  | "INTERVIEW_REMINDER"
  | "JOB_MATCH"
  | "APPLICATION_UPDATE"
  | "ROADMAP_UPDATE"
  | "PROJECT_RECOMMENDATION"
  | "SYSTEM"
  | "MARKETING"

export interface CreateNotificationInput {
  userId:    string
  type:      NotificationType
  title:     string
  message:   string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a single notification record.
 * Never throws — notification failures must not break the calling route.
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId:    input.userId,
        type:      input.type,
        title:     input.title,
        message:   input.message,
        actionUrl: input.actionUrl ?? null,
        metadata:  input.metadata  ?? undefined,
        status:    "UNREAD",
      },
    })
  } catch (error) {
    // Non-fatal — log but swallow so callers are unaffected
    console.error("[Notifications] Failed to create notification:", error)
  }
}

/**
 * Fetch the unread count for a user.
 * Used by the sidebar badge and bell component.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, status: "UNREAD" },
    })
  } catch {
    return 0
  }
}

// ─── Pre-built helpers for each event type ───────────────────────────────────

export async function notifyResumeAnalysisComplete(
  userId: string,
  resumeId: string,
  resumeTitle: string,
  atsScore: number
) {
  return createNotification({
    userId,
    type:      "RESUME_ANALYSIS_COMPLETE",
    title:     "Resume Analysis Complete",
    message:   `"${resumeTitle}" scored ${atsScore}/100 on ATS compatibility.`,
    actionUrl: `/dashboard/resumes/${resumeId}/analysis`,
    metadata:  { resumeId, atsScore },
  })
}

export async function notifySkillGapComplete(
  userId: string,
  skillGapId: string,
  targetRole: string,
  missingCount: number
) {
  return createNotification({
    userId,
    type:      "SKILL_GAP_UPDATE",
    title:     "Skill Gap Analysis Ready",
    message:   `Found ${missingCount} skill gap${missingCount !== 1 ? "s" : ""} for ${targetRole}.`,
    actionUrl: `/dashboard/jobs`,
    metadata:  { skillGapId, targetRole, missingCount },
  })
}

export async function notifyJobMatchComplete(
  userId: string,
  jobId: string,
  jobTitle: string,
  company: string,
  matchScore: number
) {
  return createNotification({
    userId,
    type:      "JOB_MATCH",
    title:     "Job Match Score Ready",
    message:   `Your resume is a ${matchScore}% match for ${jobTitle} at ${company}.`,
    actionUrl: `/dashboard/jobs`,
    metadata:  { jobId, matchScore },
  })
}

export async function notifyRoadmapGenerated(
  userId: string,
  roadmapId: string,
  targetRole: string,
  durationWeeks: number
) {
  return createNotification({
    userId,
    type:      "ROADMAP_UPDATE",
    title:     "Learning Roadmap Generated",
    message:   `Your ${durationWeeks}-week roadmap for ${targetRole} is ready.`,
    actionUrl: `/dashboard/roadmap`,
    metadata:  { roadmapId, targetRole, durationWeeks },
  })
}

export async function notifyInterviewComplete(
  userId: string,
  sessionId: string,
  jobRole: string,
  overallScore: number
) {
  return createNotification({
    userId,
    type:      "INTERVIEW_REMINDER",
    title:     "Mock Interview Complete",
    message:   `You scored ${overallScore}/100 in your ${jobRole} mock interview.`,
    actionUrl: `/dashboard/interviews/${sessionId}`,
    metadata:  { sessionId, overallScore },
  })
}

export async function notifyProjectRecommendation(
  userId: string,
  targetRole: string,
  projectCount: number
) {
  return createNotification({
    userId,
    type:      "PROJECT_RECOMMENDATION",
    title:     "New Project Recommendations",
    message:   `${projectCount} portfolio project${projectCount !== 1 ? "s" : ""} recommended for ${targetRole}.`,
    actionUrl: `/dashboard/projects`,
    metadata:  { targetRole, projectCount },
  })
}
