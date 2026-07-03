import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle2, TrendingUp, GraduationCap, Briefcase } from "lucide-react"

interface MatchScoreCardProps {
  overallMatch: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  matchedSkills: string[]
  summary: string
}

export function MatchScoreCard({
  overallMatch,
  skillMatch,
  experienceMatch,
  educationMatch,
  matchedSkills,
  summary,
}: MatchScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "success" as const
    if (score >= 60) return "warning" as const
    return "destructive" as const
  }

  const metrics = [
    { label: "Skills", score: skillMatch, icon: CheckCircle2, color: "text-blue-500" },
    { label: "Experience", score: experienceMatch, icon: Briefcase, color: "text-purple-500" },
    { label: "Education", score: educationMatch, icon: GraduationCap, color: "text-green-500" },
  ]

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Job Match Score
          </CardTitle>
          <Badge variant={getScoreVariant(overallMatch)} className="text-base px-3 py-1">
            {overallMatch >= 80 ? "Excellent" : overallMatch >= 60 ? "Good" : "Fair"} Match
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-6xl font-extrabold ${getScoreColor(overallMatch)}`}>
              {overallMatch}
            </span>
            <span className="text-3xl font-medium text-muted-foreground">/100</span>
          </div>
          <Progress value={overallMatch} className="mt-4 h-3" />
        </div>

        {/* Sub-metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>

        {/* Matched Skills Preview */}
        {matchedSkills.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">
              <TrendingUp className="mr-1 inline h-4 w-4 text-green-600" />
              Matched Skills ({matchedSkills.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.slice(0, 8).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {matchedSkills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{matchedSkills.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
