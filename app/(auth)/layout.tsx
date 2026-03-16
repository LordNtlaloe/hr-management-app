import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left panel — branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
                {/* Background grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                {/* Glow */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-15" />

                {/* Logo */}
                <div className="relative flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-3 h-3 rounded-sm bg-white" />
                    </div>
                    <span className="font-semibold tracking-tight text-white/90">Acme Inc.</span>
                </div>

                {/* Testimonial */}
                <div className="relative space-y-6">
                    <blockquote className="text-xl font-light leading-relaxed text-white/80 max-w-xs">
                        "This platform completely changed the way our team collaborates. Absolutely indispensable."
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-400 to-indigo-600" />
                        <div>
                            <p className="text-sm font-medium text-white/90">Sofia Hernandez</p>
                            <p className="text-xs text-white/40">Head of Design, Linear</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex items-center justify-center p-6 bg-white dark:bg-zinc-900">
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}