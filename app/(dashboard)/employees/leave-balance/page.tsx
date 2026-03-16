'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface EmployeeLeaveBalanceProps {
    employeeId: number
}

export function EmployeeLeaveBalance({ employeeId }: EmployeeLeaveBalanceProps) {
    const [balance, setBalance] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        if (employeeId) {
            fetchBalance()
        }
    }, [employeeId, selectedYear])

    const fetchBalance = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/employees/${employeeId}/leave-balance?year=${selectedYear}`)
            const data = await response.json()
            if (data.success) {
                setBalance(data.data)
            }
        } catch (error) {
            toast("Error",{
                description: 'Failed to fetch leave balance',
                className: 'bg-red-500'
            })
        } finally {
            setLoading(false)
        }
    }

    const years = [selectedYear, selectedYear - 1, selectedYear - 2]

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-37.5" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!balance) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Leave Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No balance information available</p>
                </CardContent>
            </Card>
        )
    }

    const annualPercentage = (balance.annual_used / balance.annual_total) * 100
    const sickPercentage = (balance.sick_used / balance.sick_total) * 100

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leave Balance</CardTitle>
                    <p className="text-sm text-muted-foreground">Current leave year {balance.year}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-25">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={fetchBalance}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Annual Leave */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Annual Leave</span>
                        <span className="text-sm text-muted-foreground">
                            {balance.annual_used} / {balance.annual_total} days
                        </span>
                    </div>
                    <Progress value={annualPercentage} className="h-2" />
                    <div className="flex justify-between text-sm">
                        <span>Used: {balance.annual_used} days</span>
                        <span className="font-medium">Remaining: {balance.annual_remaining} days</span>
                    </div>
                </div>

                {/* Sick Leave */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Sick Leave</span>
                        <span className="text-sm text-muted-foreground">
                            {balance.sick_used} / {balance.sick_total} days
                        </span>
                    </div>
                    <Progress value={sickPercentage} className="h-2" />
                    <div className="flex justify-between text-sm">
                        <span>Used: {balance.sick_used} days</span>
                        <span className="font-medium">Remaining: {balance.sick_remaining} days</span>
                    </div>
                </div>

                {/* Other Leave Types */}
                {(balance.unpaid_used > 0 || balance.maternity_used > 0 || balance.carried_over > 0) && (
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium mb-2">Additional Information</h4>
                        <div className="space-y-1 text-sm">
                            {balance.unpaid_used > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unpaid Leave Used</span>
                                    <span>{balance.unpaid_used} days</span>
                                </div>
                            )}
                            {balance.maternity_used > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Maternity Leave Used</span>
                                    <span>{balance.maternity_used} days</span>
                                </div>
                            )}
                            {balance.carried_over > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Carried Over</span>
                                    <span>{balance.carried_over} days</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Remaining</span>
                        <span className="text-lg font-bold">
                            {balance.annual_remaining + balance.sick_remaining} days
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(balance.updated_at).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}