"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
    title: string
    description: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isCurrent = stepNumber === currentStep

                    return (
                        <div key={step.title} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-colors",
                                    isCompleted && "border-primary bg-primary text-primary-foreground",
                                    isCurrent && "border-primary text-primary",
                                    !isCompleted && !isCurrent && "border-muted-foreground text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-medium">{stepNumber}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={cn(
                                    "text-sm font-medium",
                                    isCurrent && "text-primary",
                                    isCompleted && "text-muted-foreground"
                                )}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground hidden md:block">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}