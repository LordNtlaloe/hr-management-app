import { Employee } from "./employee";

export interface Section {
    id: number;
    section_name: string;
    employee_id: string | null;
    employees?: Employee[];
}