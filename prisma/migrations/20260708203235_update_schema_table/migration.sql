/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `technician_profiles` table. All the data in the column will be lost.
  - Added the required column `bookingDate` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookingDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "profilePhoto";

-- CreateIndex
CREATE INDEX "technician_profiles_location_idx" ON "technician_profiles"("location");

-- CreateIndex
CREATE INDEX "technician_profiles_averageRating_idx" ON "technician_profiles"("averageRating");
