"use client"

import { useEffect, useState } from "react"
import EmployeeForm from "@/components/employees/multi-step-form/employee-form"

interface Section {
    id: number
    section_name: string
}

export default function Page() {
    const [sections, setSections] = useState<Section[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await fetch("/api/sections")
                const data = await res.json()
                console.log(data)
                setSections(data.data || [])
            } catch (error) {
                console.error("Failed to fetch sections", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSections()
    }, [])

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading sections...</div>
    }

    return <EmployeeForm sections={sections} />
}