-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "CancellationMode" AS ENUM ('AUTOMATED_REFUND', 'ADMIN_CONTACT', 'NON_REFUNDABLE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE_MADA', 'ONLINE_APPLE_PAY', 'ONLINE_CARD', 'CASH', 'POS_TERMINAL');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "languagePref" TEXT NOT NULL DEFAULT 'ar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "operatingStartHour" INTEGER NOT NULL DEFAULT 16,
    "operatingEndHour" INTEGER NOT NULL DEFAULT 24,
    "slotHoldDurationMins" INTEGER NOT NULL DEFAULT 10,
    "cancellationMode" "CancellationMode" NOT NULL DEFAULT 'ADMIN_CONTACT',
    "cancellationBufferHours" INTEGER NOT NULL DEFAULT 24,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "priceSar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "totalPriceSar" DECIMAL(10,2) NOT NULL,
    "lockExpiresAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "bookings_courtId_startTime_status_idx" ON "bookings"("courtId", "startTime", "status");

-- CreateIndex
CREATE INDEX "bookings_status_lockExpiresAt_idx" ON "bookings"("status", "lockExpiresAt");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
