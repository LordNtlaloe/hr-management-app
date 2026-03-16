"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: { token?: string };
}) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (!searchParams.token) {
            setError("Invalid or missing reset token.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await resetPassword(
                { newPassword: password, token: searchParams.token },
                {
                    onSuccess: () => router.push("/auth/sign-in?reset=true"),
                    onError: (ctx) => setError(ctx.error.message),
                }
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Set new password
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Choose a strong password for your account.
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
                    <Label htmlFor="password">New password</Label>
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
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset password
                </Button>
            </form>
        </div>
    );
}