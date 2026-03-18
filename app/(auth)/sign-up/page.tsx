"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signUp.email(
                { name, email, password, callbackURL: "/dashboard" },
                {
                    onSuccess: () => setSuccess(true),
                    onError: (ctx) => setError(ctx.error.message),
                }
            );
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="space-y-4 text-center">
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Check your email</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        We sent a verification link to <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
                    </p>
                </div>
                <Link href="/sign-in">
                    <Button variant="outline" className="mt-2 w-full">
                        Back to sign in
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Create an account
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Start your free trial. No credit card required.
                </p>
            </div>

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Jane Smith"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

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

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create account
                </Button>
            </form>

            <Separator />

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline underline-offset-4"
                >
                    Sign in
                </Link>
            </p>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-600">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-600">Privacy Policy</Link>.
            </p>
        </div>
    );
}