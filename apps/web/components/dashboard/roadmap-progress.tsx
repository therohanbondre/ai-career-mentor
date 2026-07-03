import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle2, Circle } from "lucide-react"

/* 
 * Architectural Decision: Roadmap Progress Component
 * - Visual learning roadmap progress
 * - Module completion tracking
 * - Estimated time remaining
 * - Motivational progress indicator
 */

interface RoadmapProgressProps {
  title: string
  progress: number
  totalModules: number
  completedModules: number
  estimatedWeeks: number
  status: "active" | "paused" | "completed"
}

export function RoadmapProgress({
  title,
  progress,
  totalModules,
  completedModules,
  estimatedWeeks,
  status,
}: RoadmapProgressProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Learning Roadmap</CardTitle>
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {completedModules} of {totalModules} modules completed
            </p>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={status === "completed" ? "success" : status === "active" ? "default" : "secondary"}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {estimatedWeeks} weeks remaining
            </span>
          </div>
          
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs">
                {i < completedModules ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={i < completedModules ? "text-muted-foreground line-through" : "text-muted-foreground"}>
                  Module {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
