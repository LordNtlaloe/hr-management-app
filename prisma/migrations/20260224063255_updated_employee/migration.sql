/*
  Warnings:

  - You are about to drop the column `employee_position` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "position" TEXT;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "employee_position";
