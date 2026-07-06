-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "display_order" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "updated_at" DROP NOT NULL;
