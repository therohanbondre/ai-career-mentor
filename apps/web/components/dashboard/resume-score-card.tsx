import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp } from "lucide-react"

/* 
 * Architectural Decision: Resume Score Card
 * - Visual representation of resume quality score
 * - Progress indicator for score
 * - Trend indicator for improvement
 * - Consistent with SaaS dashboard design
 */

interface ResumeScoreCardProps {
  score: number
  trend?: "up" | "down" | "stable"
  lastAnalyzed?: string
}

export function ResumeScoreCard({ score, trend = "stable", lastAnalyzed }: ResumeScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Badge variant={score >= 80 ? "success" : score >= 60 ? "warning" : "destructive"}>
              {getScoreLabel(score)}
            </Badge>
          </div>
          
          <Progress value={score} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <TrendingUp className={`h-3 w-3 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`} />
              <span>
                {trend === "up" ? "+5%" : trend === "down" ? "-3%" : "0%"} from last week
              </span>
            </div>
            {lastAnalyzed && <span>Last analyzed: {lastAnalyzed}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
