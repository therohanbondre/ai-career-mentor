import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Award, Target } from "lucide-react"

/* 
 * Architectural Decision: Charts Component
 * - Visual analytics using Recharts
 * - Multiple chart types for different metrics
 * - Responsive design
 * - Consistent color scheme
 */

const skillData = [
  { name: "JavaScript", level: 85 },
  { name: "Python", level: 70 },
  { name: "React", level: 90 },
  { name: "Node.js", level: 75 },
  { name: "TypeScript", level: 80 },
]

const scoreHistory = [
  { month: "Jan", resume: 65, ats: 60 },
  { month: "Feb", resume: 70, ats: 65 },
  { month: "Mar", resume: 75, ats: 70 },
  { month: "Apr", resume: 80, ats: 75 },
  { month: "May", resume: 85, ats: 80 },
  { month: "Jun", resume: 88, ats: 85 },
]

const interviewData = [
  { name: "Technical", value: 45, color: "#3b82f6" },
  { name: "Behavioral", value: 30, color: "#10b981" },
  { name: "System Design", value: 15, color: "#f59e0b" },
  { name: "Coding", value: 10, color: "#ef4444" },
]

export function SkillChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Skill Levels</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={skillData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="level" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ScoreHistoryChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Score History</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={scoreHistory}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="resume" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="ats" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function InterviewTypeChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Interview Types</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={interviewData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {interviewData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {interviewData.map((item) => (
            <div key={item.name} className="flex items-center space-x-1 text-xs">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
