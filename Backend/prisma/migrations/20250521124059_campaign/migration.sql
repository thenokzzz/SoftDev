-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" INTEGER NOT NULL,
    "collected_amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
