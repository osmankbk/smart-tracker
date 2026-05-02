/*
  Warnings:

  - You are about to drop the column `token` on the `OrganizationInvite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `OrganizationInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `OrganizationInvite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

-- DropIndex
DROP INDEX "OrganizationInvite_organizationId_email_key";

-- DropIndex
DROP INDEX "OrganizationInvite_token_key";

-- AlterTable
ALTER TABLE "OrganizationInvite" DROP COLUMN "token",
ADD COLUMN     "acceptedById" TEXT,
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvite_tokenHash_key" ON "OrganizationInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvite_organizationId_idx" ON "OrganizationInvite"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationInvite_email_idx" ON "OrganizationInvite"("email");

-- CreateIndex
CREATE INDEX "OrganizationInvite_status_idx" ON "OrganizationInvite"("status");

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
