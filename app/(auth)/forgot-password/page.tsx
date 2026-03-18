"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await requestPasswordReset(
                { email, redirectTo: "/auth/reset-password" },
                {
                    onSuccess: () => setSent(true),
                    onError: (ctx) => setError(ctx.error.message),
                }
            );
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="space-y-4 text-center">
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Reset link sent</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        If <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span> has an account, you'll receive a reset link shortly.
                    </p>
                </div>
                <Link href="/sign-in">
                    <Button variant="outline" className="mt-2 w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to sign in
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Forgot password?
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send reset link
                </Button>
            </form>

            <Link
                href="/sign-in"
                className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
            </Link>
        </div>
    );
}