"use client"

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-card/60 px-6 py-6">
                <div className="mx-auto max-w-7xl flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
                    ))}
                </div>
                <div className="h-64 animate-pulse rounded-2xl bg-muted" />
                <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            </div>
        </div>
    )
}