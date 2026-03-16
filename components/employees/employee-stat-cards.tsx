"use client"

import { Users, UserCheck, UserX, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface EmployeeStatsCardsProps {
    total: number
    active: number
    inactive: number
    previousMonthTotal?: number
    previousMonthActive?: number
}

export function EmployeeStatsCards({
    total,
    active,
    inactive,
    previousMonthTotal = 0,
    previousMonthActive = 0
}: EmployeeStatsCardsProps) {
    const activePercentage = total > 0 ? (active / total) * 100 : 0
    const totalChange = previousMonthTotal > 0 ? ((total - previousMonthTotal) / previousMonthTotal) * 100 : 0
    const activeChange = previousMonthActive > 0 ? ((active - previousMonthActive) / previousMonthActive) * 100 : 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        {totalChange > 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={totalChange > 0 ? "text-green-500" : "text-red-500"}>
                            {Math.abs(totalChange).toFixed(1)}%
                        </span>
                        <span className="ml-1">from last month</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{active}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        {activeChange > 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={activeChange > 0 ? "text-green-500" : "text-red-500"}>
                            {Math.abs(activeChange).toFixed(1)}%
                        </span>
                        <span className="ml-1">from last month</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
                    <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inactive}</div>
                    <Progress value={activePercentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {activePercentage.toFixed(1)}% active rate
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activePercentage.toFixed(1)}%</div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                            <span className="text-muted-foreground">Active</span>
                            <p className="font-medium">{active}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Inactive</span>
                            <p className="font-medium">{inactive}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}