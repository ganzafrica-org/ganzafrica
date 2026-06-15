import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface PendingApprovalsProps {
    data: any[]
}

export const PendingApprovals = ({ data }: PendingApprovalsProps) => {
    const pendingRecords = data.filter(record => record.status === 'pending_approval')

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600" />
                    Pending Approvals
                </CardTitle>
                <CardDescription>Attendance records requiring manager approval</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {pendingRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-yellow-100 text-yellow-700">
                                        {record.name.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{record.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {record.department} • {record.task || 'No task assigned'}
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        Reason: {record.attendanceType === 'no_task' ? 'No tasks assigned for the day' : 'Manual attendance entry'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                                <Button>
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    ))}
                    {pendingRecords.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p>No pending approvals</p>
                            <p className="text-sm">All attendance records are up to date</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
