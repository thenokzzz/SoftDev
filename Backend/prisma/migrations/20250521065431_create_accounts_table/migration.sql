-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "number_phone" VARCHAR(13) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");
