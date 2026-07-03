import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle, XCircle } from "lucide-react"

/* 
 * Architectural Decision: ATS Score Card
 * - Detailed ATS scoring breakdown
 * - Multiple score components
 * - Visual indicators for each metric
 * - Actionable insights
 */

interface ATSScoreCardProps {
  overallScore: number
  keywordScore: number
  formatScore: number
  contentScore: number
  readabilityScore: number
}

export function ATSScoreCard({
  overallScore,
  keywordScore,
  formatScore,
  contentScore,
  readabilityScore,
}: ATSScoreCardProps) {
  const metrics = [
    { label: "Keywords", score: keywordScore, icon: CheckCircle },
    { label: "Format", score: formatScore, icon: Target },
    { label: "Content", score: contentScore, icon: CheckCircle },
    { label: "Readability", score: readabilityScore, icon: XCircle },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">
                {overallScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <Badge variant={overallScore >= 80 ? "success" : overallScore >= 60 ? "warning" : "destructive"}>
              {overallScore >= 80 ? "High" : overallScore >= 60 ? "Medium" : "Low"}
            </Badge>
          </div>
          
          <Progress value={overallScore} className="h-2" />
          
          <div className="space-y-3">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className="font-medium">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-1" />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
