/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "accounts";

-- CreateTable
CREATE TABLE "Accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "number_phone" VARCHAR(13) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_email_key" ON "Accounts"("email");
