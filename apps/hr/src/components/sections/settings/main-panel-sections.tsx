import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resolutionTimeData } from '@/data/help-desk-data'
import { ShieldCheck, Settings, Cpu, Edit, User } from 'lucide-react'

const categoryDistribution = [
  { category: 'IT Support', count: 23, fill: '#10b981' },
  { category: 'HR', count: 18, fill: '#3b82f6' },
  { category: 'Facilities', count: 12, fill: '#f59e0b' },
  { category: 'Payroll', count: 8, fill: '#ef4444' },
  { category: 'Training', count: 6, fill: '#8b5cf6' },
  { category: 'Other', count: 4, fill: '#6b7280' },
]

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Security':
      return <ShieldCheck className="h-4 w-4" />
    case 'General':
      return <Settings className="h-4 w-4" />
    case 'Integrations':
      return <Cpu className="h-4 w-4" />
    default:
      return <Settings className="h-4 w-4" />
  }
}

export function PagesPanel() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="rounded-t-lg border-b bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Helpdesk Configuration
        </CardTitle>
        <CardDescription>System settings and automation rules</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="font-medium">Category Settings</h4>
            <div className="space-y-3">
              {categoryDistribution.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.category)}
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.count} tickets</Badge>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Automation Rules</h4>
            <div className="space-y-3">
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Auto-assign IT tickets</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically assign IT Support tickets to available technicians
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Priority escalation</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escalate high priority tickets after 4 hours without response
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Satisfaction surveys</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send satisfaction survey when tickets are resolved
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h4 className="mb-4 font-medium">SLA Targets</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {resolutionTimeData.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <span className="font-medium">{item.priority} Priority</span>
                    <p className="text-sm text-muted-foreground">Current: {item.avgHours}h avg</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Target: {item.target}h</div>
                    <div
                      className={`text-sm ${
                        item.avgHours <= item.target ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {item.avgHours <= item.target ? 'Meeting SLA' : 'Missing SLA'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h5 className="mb-2 font-medium text-blue-800">Business Hours</h5>
                <p className="text-sm text-blue-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p className="text-sm text-blue-700">Weekend: Emergency only</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h5 className="mb-2 font-medium text-green-800">Contact Information</h5>
                <p className="text-sm text-green-700">Email: support@ganzafrica.org</p>
                <p className="text-sm text-green-700">Phone: +250 788 HELP (4357)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
