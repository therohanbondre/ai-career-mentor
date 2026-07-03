import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react"

/* 
 * Architectural Decision: Job Match Card
 * - Shows best job match for user's profile
 * - Match score with visual indicator
 * - Key job details
 * - Quick action to apply
 */

interface JobMatchCardProps {
  jobTitle: string
  company: string
  matchScore: number
  location: string
  salary?: string
  posted: string
}

export function JobMatchCard({
  jobTitle,
  company,
  matchScore,
  location,
  salary,
  posted,
}: JobMatchCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Best Job Match</CardTitle>
        <Briefcase className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{jobTitle}</h3>
            <p className="text-sm text-muted-foreground">{company}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={matchScore >= 80 ? "success" : matchScore >= 60 ? "warning" : "destructive"}
              className="text-sm"
            >
              {matchScore}% Match
            </Badge>
            <span className="text-xs text-muted-foreground">{posted}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            {salary && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>{salary}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Full-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
