import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* 
 * Architectural Decision: Recent Resume Component
 * - Lists user's recent resumes
 * - Shows ATS score and status
 * - Quick actions (view, analyze, delete)
 * - Consistent with SaaS table design
 */

interface RecentResumeProps {
  id: string
  title: string
  createdAt: string
  atsScore?: number
  isPrimary: boolean
}

interface RecentResumeListProps {
  resumes: RecentResumeProps[]
}

export function RecentResumeList({ resumes }: RecentResumeListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{resume.title}</p>
                    {resume.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{resume.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {resume.atsScore !== undefined && (
                  <Badge
                    variant={resume.atsScore >= 80 ? "success" : resume.atsScore >= 60 ? "warning" : "destructive"}
                  >
                    {resume.atsScore}%
                  </Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Analyze</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {resumes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No resumes yet</p>
              <Button variant="outline" className="mt-4">
                Upload Resume
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
