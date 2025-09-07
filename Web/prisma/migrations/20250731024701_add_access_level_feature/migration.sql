-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('public', 'private', 'restricted', 'confidential');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'user', 'viewer');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "IntegrationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "IntegrationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'public',
    "uploadedBy" TEXT NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "vectorId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAccess" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "DocumentAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationType_name_key" ON "IntegrationType"("name");

-- CreateIndex
CREATE INDEX "DocumentAccess_documentId_idx" ON "DocumentAccess"("documentId");

-- CreateIndex
CREATE INDEX "DocumentAccess_userId_idx" ON "DocumentAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAccess_documentId_userId_key" ON "DocumentAccess"("documentId", "userId");

-- AddForeignKey
ALTER TABLE "IntegrationAccount" ADD CONSTRAINT "IntegrationAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationAccount" ADD CONSTRAINT "IntegrationAccount_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "IntegrationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
