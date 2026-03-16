import { betterAuth } from "better-auth"
import { prisma } from "./prisma"
import { headers } from "next/headers"
import { Role } from "@prisma/client"

// Create server-side auth instance
export const auth = betterAuth({
    database: prisma,
    // ... your auth config
})

export async function getServerSession() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        return session
    } catch (error) {
        console.error("Error getting server session:", error)
        return null
    }
}

export type ServerUser = {
    id: string
    name: string
    email: string
    image?: string | null
    role: Role
}