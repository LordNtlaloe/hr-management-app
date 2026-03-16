-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MARITAL_STATUS" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'HR_REVIEW', 'SUPERVISOR_REVIEW', 'FINAL_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('RECOMMEND', 'NOT_RECOMMEND');

-- CreateEnum
CREATE TYPE "FinalDecision" AS ENUM ('APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "employeeId" INTEGER;

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "employee_number" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "picture" TEXT NOT NULL,
    "place_of_birth" TEXT NOT NULL,
    "is_citizen" BOOLEAN NOT NULL,
    "chief_name" TEXT,
    "district" TEXT,
    "nationality" TEXT,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "section_id" INTEGER,
    "legal_info_id" INTEGER,
    "education_history_id" INTEGER,
    "employment_history_id" INTEGER,
    "references_id" INTEGER,
    "employee_documents_id" INTEGER,
    "leave_id" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalInfo" (
    "id" SERIAL NOT NULL,
    "father_name" TEXT NOT NULL,
    "is_father_deceased" BOOLEAN NOT NULL,
    "father_place_of_birth" TEXT NOT NULL,
    "father_occupation" TEXT NOT NULL,
    "father_address" TEXT NOT NULL,
    "marital_status" "MARITAL_STATUS" NOT NULL DEFAULT 'SINGLE',
    "has_criminal_record" BOOLEAN NOT NULL,
    "criminal_record_info" TEXT,
    "has_been_dismissed" BOOLEAN NOT NULL,
    "dismissal_reason" TEXT,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "LegalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationHistory" (
    "id" SERIAL NOT NULL,
    "school_name" TEXT NOT NULL,
    "date_of_entry" TIMESTAMP(3) NOT NULL,
    "date_of_leave" TIMESTAMP(3) NOT NULL,
    "qualification" TEXT NOT NULL,
    "qualification_start_date" TIMESTAMP(3) NOT NULL,
    "qualification_completion_date" TIMESTAMP(3) NOT NULL,
    "additional_skills" TEXT[],
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "EducationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentHistory" (
    "id" SERIAL NOT NULL,
    "employer_name" TEXT NOT NULL,
    "employee_address" TEXT NOT NULL,
    "employer_position" TEXT NOT NULL,
    "duties" TEXT[],
    "employment_start" TIMESTAMP(3) NOT NULL,
    "employment_end" TIMESTAMP(3) NOT NULL,
    "salary" TEXT NOT NULL,
    "reason_for_leaving" TEXT NOT NULL,
    "notice_period" TEXT NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "EmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "References" (
    "id" SERIAL NOT NULL,
    "refernce_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "known_for" TEXT NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "References_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocuments" (
    "id" SERIAL NOT NULL,
    "national_id" TEXT NOT NULL,
    "passport" TEXT NOT NULL,
    "acdemic_certificates" TEXT[],
    "police_clearance" TEXT NOT NULL,
    "medical_certificates" TEXT NOT NULL,
    "drivers_license" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "EmployeeDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "section_name" TEXT NOT NULL,
    "employee_position" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveApplication" (
    "id" SERIAL NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rejected_by_id" INTEGER,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "userId" TEXT,
    "employeeId" INTEGER,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePartA" (
    "id" SERIAL NOT NULL,
    "leave_application_id" INTEGER NOT NULL,
    "employee_name" TEXT NOT NULL,
    "employment_number" TEXT NOT NULL,
    "employee_position" TEXT,
    "number_of_leave_days" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location_during_leave" TEXT,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "date_of_request" TIMESTAMP(3) NOT NULL,
    "employee_signature" TEXT NOT NULL,
    "filled_by_id" TEXT NOT NULL,
    "filled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeavePartA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePartB" (
    "id" SERIAL NOT NULL,
    "leave_application_id" INTEGER NOT NULL,
    "annual_leave_days" INTEGER NOT NULL,
    "deducted_days" INTEGER NOT NULL,
    "remaining_leave_days" INTEGER NOT NULL,
    "date_of_approval" TIMESTAMP(3),
    "hr_signature" TEXT,
    "filled_by_id" TEXT NOT NULL,
    "filled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeavePartB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePartC" (
    "id" SERIAL NOT NULL,
    "leave_application_id" INTEGER NOT NULL,
    "supervisor_comments" TEXT,
    "recommendation" "Recommendation",
    "date_of_review" TIMESTAMP(3),
    "supervisor_signature" TEXT,
    "filled_by_id" TEXT NOT NULL,
    "filled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeavePartC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePartD" (
    "id" SERIAL NOT NULL,
    "leave_application_id" INTEGER NOT NULL,
    "final_decision" "FinalDecision" NOT NULL,
    "date_of_decision" TIMESTAMP(3),
    "approver_signature" TEXT,
    "filled_by_id" TEXT NOT NULL,
    "filled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeavePartD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "annual_total" INTEGER NOT NULL DEFAULT 24,
    "annual_used" INTEGER NOT NULL DEFAULT 0,
    "annual_remaining" INTEGER NOT NULL DEFAULT 24,
    "sick_total" INTEGER NOT NULL DEFAULT 12,
    "sick_used" INTEGER NOT NULL DEFAULT 0,
    "sick_remaining" INTEGER NOT NULL DEFAULT 12,
    "unpaid_used" INTEGER NOT NULL DEFAULT 0,
    "maternity_used" INTEGER NOT NULL DEFAULT 0,
    "carried_over" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" INTEGER NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_number_key" ON "Employee"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePartA_leave_application_id_key" ON "LeavePartA"("leave_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePartB_leave_application_id_key" ON "LeavePartB"("leave_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePartC_leave_application_id_key" ON "LeavePartC"("leave_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePartD_leave_application_id_key" ON "LeavePartD"("leave_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employee_id_key" ON "LeaveBalance"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employee_id_year_key" ON "LeaveBalance"("employee_id", "year");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_legal_info_id_fkey" FOREIGN KEY ("legal_info_id") REFERENCES "LegalInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_education_history_id_fkey" FOREIGN KEY ("education_history_id") REFERENCES "EducationHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employment_history_id_fkey" FOREIGN KEY ("employment_history_id") REFERENCES "EmploymentHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_references_id_fkey" FOREIGN KEY ("references_id") REFERENCES "References"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employee_documents_id_fkey" FOREIGN KEY ("employee_documents_id") REFERENCES "EmployeeDocuments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_leave_id_fkey" FOREIGN KEY ("leave_id") REFERENCES "LeavePartA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartA" ADD CONSTRAINT "LeavePartA_leave_application_id_fkey" FOREIGN KEY ("leave_application_id") REFERENCES "LeaveApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartA" ADD CONSTRAINT "LeavePartA_filled_by_id_fkey" FOREIGN KEY ("filled_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartB" ADD CONSTRAINT "LeavePartB_leave_application_id_fkey" FOREIGN KEY ("leave_application_id") REFERENCES "LeaveApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartB" ADD CONSTRAINT "LeavePartB_filled_by_id_fkey" FOREIGN KEY ("filled_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartC" ADD CONSTRAINT "LeavePartC_leave_application_id_fkey" FOREIGN KEY ("leave_application_id") REFERENCES "LeaveApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartC" ADD CONSTRAINT "LeavePartC_filled_by_id_fkey" FOREIGN KEY ("filled_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartD" ADD CONSTRAINT "LeavePartD_leave_application_id_fkey" FOREIGN KEY ("leave_application_id") REFERENCES "LeaveApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePartD" ADD CONSTRAINT "LeavePartD_filled_by_id_fkey" FOREIGN KEY ("filled_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
