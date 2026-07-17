/*
  Warnings:

  - You are about to drop the column `address` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `bookingDate` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `availabilityId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceAddress` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "address",
DROP COLUMN "bookingDate",
ADD COLUMN     "availabilityId" TEXT NOT NULL,
ADD COLUMN     "serviceAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "failureReason" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePhoto" TEXT;

-- DropEnum
DROP TYPE "PaymentProvider";

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "services_price_idx" ON "services"("price");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "availabilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
