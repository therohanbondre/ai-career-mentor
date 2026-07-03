import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, TrendingUp, ExternalLink } from "lucide-react"
import type { MissingSkill, SkillDetail, LearningPath } from "@/types"

interface MissingSkillsListProps {
  missingSkills: MissingSkill[] | SkillDetail[]
  learningPaths?: LearningPath[]
  recommendations?: string[]
}

export function MissingSkillsList({
  missingSkills,
  learningPaths,
  recommendations,
}: MissingSkillsListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "destructive" as const
      case "HIGH":     return "warning" as const
      case "MEDIUM":   return "secondary" as const
      default:         return "outline" as const
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "CRITICAL" || priority === "HIGH") {
      return <AlertCircle className="h-3 w-3" />
    }
    return null
  }

  // Sort by priority
  const sorted = [...missingSkills].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order]
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missing Skills</CardTitle>
        <CardDescription>
          Skills you should acquire to improve your match for this role
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Skills List */}
        <div className="space-y-3">
          {sorted.map((skill, idx) => {
            const isDetailed = "estimatedLearningTime" in skill
            const learningPath = learningPaths?.find(
              (lp) => lp.skill.toLowerCase() === skill.name?.toLowerCase?.() || skill.skill?.toLowerCase?.()
            )

            return (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(skill.priority)} className="gap-1">
                      {getPriorityIcon(skill.priority)}
                      {skill.priority}
                    </Badge>
                    <span className="font-semibold">
                      {"name" in skill ? skill.name : skill.skill}
                    </span>
                    {isDetailed && skill.category && (
                      <span className="text-xs text-muted-foreground">· {skill.category}</span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {"reason" in skill ? skill.reason : "Required for this role"}
                  </p>

                  {isDetailed && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {skill.estimatedLearningTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {skill.estimatedLearningTime}
                        </span>
                      )}
                      {skill.marketDemand && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {skill.marketDemand} demand
                        </span>
                      )}
                    </div>
                  )}

                  {learningPath && learningPath.resources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {learningPath.resources.slice(0, 2).map((res, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a href={res.url || "#"} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            {res.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
            <p className="font-semibold">Recommendations</p>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
