import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Brain, 
  MessageSquare, 
  BookOpen, 
  Plus,
  Zap
} from "lucide-react"

/* 
 * Architectural Decision: Quick Actions Component
 * - One-click access to common actions
 * - Visual icons for quick recognition
 * - Consistent with SaaS dashboard patterns
 * - Encourages user engagement
 */

interface QuickAction {
  label: string
  icon: React.ElementType
  href: string
  description: string
}

const quickActions: QuickAction[] = [
  {
    label: "Upload Resume",
    icon: FileText,
    href: "/dashboard/resumes/upload",
    description: "Add a new resume",
  },
  {
    label: "Analyze Skills",
    icon: Brain,
    href: "/dashboard/skills/analyze",
    description: "Check skill gaps",
  },
  {
    label: "Start Interview",
    icon: MessageSquare,
    href: "/dashboard/interviews/start",
    description: "Practice with AI",
  },
  {
    label: "View Roadmap",
    icon: BookOpen,
    href: "/dashboard/roadmap",
    description: "Learning path",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.href}
                variant="outline"
                className="h-auto flex-col space-y-2 p-4"
                asChild
              >
                <a href={action.href}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </a>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
