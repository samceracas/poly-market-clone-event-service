-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CHOICE');

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "event_id" TEXT,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_order" SERIAL NOT NULL,
    "market_id" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;
