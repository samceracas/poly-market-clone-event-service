-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('CLOSED', 'OPEN');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('OPEN', 'SUSPENDED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "liquidity_b" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "status" "MarketStatus" NOT NULL DEFAULT 'OPEN';
