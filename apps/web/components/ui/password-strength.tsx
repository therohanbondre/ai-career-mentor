"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface StrengthResult {
  score: number        // 0–4
  label: string
  color: string
  barColor: string
  checks: {
    label: string
    passed: boolean
  }[]
}

function analyzePassword(password: string): StrengthResult {
  const checks = [
    { label: "At least 8 characters",        passed: password.length >= 8 },
    { label: "Uppercase letter (A–Z)",        passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)",        passed: /[a-z]/.test(password) },
    { label: "Number (0–9)",                  passed: /\d/.test(password) },
    { label: "Special character (!@#$…)",     passed: /[^A-Za-z0-9]/.test(password) },
  ]

  const score = checks.filter((c) => c.passed).length

  const levels: { label: string; color: string; barColor: string }[] = [
    { label: "",          color: "text-muted-foreground",  barColor: "bg-muted" },
    { label: "Very weak", color: "text-red-500",           barColor: "bg-red-500" },
    { label: "Weak",      color: "text-orange-500",        barColor: "bg-orange-500" },
    { label: "Fair",      color: "text-yellow-500",        barColor: "bg-yellow-500" },
    { label: "Strong",    color: "text-blue-500",          barColor: "bg-blue-500" },
    { label: "Very strong", color: "text-green-500",       barColor: "bg-green-500" },
  ]

  const level = levels[Math.min(score, 5)]

  return { score, label: level.label, color: level.color, barColor: level.barColor, checks }
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const result = useMemo(() => analyzePassword(password), [password])

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              result.score >= bar ? result.barColor : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Label */}
      {result.label && (
        <p className={cn("text-xs font-medium", result.color)}>
          {result.label}
        </p>
      )}

      {/* Checklist */}
      <ul className="space-y-1" aria-label="Password requirements">
        {result.checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              check.passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            <span aria-hidden="true">{check.passed ? "✓" : "○"}</span>
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
