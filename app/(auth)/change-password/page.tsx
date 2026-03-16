"use client";

import { useState } from "react";
import { changePassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword !== confirm) {
            setError("New passwords do not match.");
            return;
        }
        setError(null);
        setSuccess(false);
        setLoading(true);
        try {
            await changePassword(
                { currentPassword, newPassword, revokeOtherSessions: true },
                {
                    onSuccess: () => {
                        setSuccess(true);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirm("");
                    },
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
                    Change password
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Update your password. All other sessions will be signed out.
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Password updated successfully.</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current">Current password</Label>
                    <Input
                        id="current"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="new">New password</Label>
                    <Input
                        id="new"
                        type="password"
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <Input
                        id="confirm"
                        type="password"
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update password
                </Button>
            </form>
        </div>
    );
}