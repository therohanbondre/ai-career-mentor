import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock, Target } from "lucide-react"

/* 
 * Architectural Decision: Interview Progress Component
 * - Tracks interview practice sessions
 * - Shows completion rate
 * - Average score tracking
 * - Time spent practicing
 */

interface InterviewProgressProps {
  totalSessions: number
  completedSessions: number
  averageScore: number
  totalHours: number
  targetRole: string
}

export function InterviewProgress({
  totalSessions,
  completedSessions,
  averageScore,
  totalHours,
  targetRole,
}: InterviewProgressProps) {
  const completionRate = Math.round((completedSessions / totalSessions) * 100)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Interview Practice</CardTitle>
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Target Role</p>
            <p className="font-semibold">{targetRole}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <Progress value={completionRate} className="h-1 mt-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{averageScore}</p>
              <Badge 
                variant={averageScore >= 80 ? "success" : averageScore >= 60 ? "warning" : "destructive"}
                className="mt-1"
              >
                {averageScore >= 80 ? "Excellent" : averageScore >= 60 ? "Good" : "Needs Work"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{totalHours}h practiced</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{completedSessions}/{totalSessions} sessions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
