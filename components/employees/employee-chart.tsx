"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"

interface EmployeeChartsProps {
    bySectionData: { section: string; count: number }[]
    byGenderData: { gender: string; count: number }[]
    trendData?: { month: string; hired: number; left: number }[]
    leaveBalanceData?: { type: string; used: number; remaining: number }[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function EmployeeCharts({
    bySectionData,
    byGenderData,
    trendData = [],
    leaveBalanceData = []
}: EmployeeChartsProps) {
    return (
        <Tabs defaultValue="distribution" className="space-y-4">
            <TabsList>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="trend">Trend</TabsTrigger>
                <TabsTrigger value="leave">Leave Balance</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employees by Section</CardTitle>
                            <CardDescription>Distribution across departments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-75">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bySectionData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="section" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8">
                                            {bySectionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employees by Gender</CardTitle>
                            <CardDescription>Gender distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-75">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={byGenderData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.gender}: ${entry.count}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {byGenderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="trend">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Trend</CardTitle>
                        <CardDescription>Hiring and turnover over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-100">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="hired" stroke="#8884d8" name="Hired" />
                                    <Line type="monotone" dataKey="left" stroke="#ff7300" name="Left" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="leave">
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Balance Overview</CardTitle>
                        <CardDescription>Current leave balances by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-100">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaveBalanceData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="type" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="used" fill="#ff7300" name="Used" />
                                    <Bar dataKey="remaining" fill="#8884d8" name="Remaining" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}