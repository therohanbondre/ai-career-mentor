"use client"

/* 
 * Architectural Decision: Interview Hook
 * - Client-side interview state management
 * - Reusable interview operations
 * - Real-time feedback handling
 * - Type-safe data structures
 */
import { useState, useCallback } from "react"
import type { InterviewSession, InterviewQuestion } from "@/types"

export function useInterview() {
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async (type: string, role: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, jobRole: role }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create interview session")
      }
      
      const data = await response.json()
      setSession(data.session)
      return data.session as InterviewSession
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAnswer = useCallback(async (
    sessionId: string,
    questionId: string,
    answer: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/interview/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }
      
      const data = await response.json()
      return data.feedback
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFeedback = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/interview/${sessionId}/feedback`)
      
      if (!response.ok) {
        throw new Error("Failed to get feedback")
      }
      
      const data = await response.json()
      return data.feedback
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    session,
    currentQuestion,
    loading,
    error,
    createSession,
    submitAnswer,
    getFeedback,
    setCurrentQuestion,
  }
}
