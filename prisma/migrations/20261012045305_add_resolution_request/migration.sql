-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "resolutionRequestMessage" TEXT,
ADD COLUMN     "resolutionRequestOutcomeId" INTEGER,
ADD COLUMN     "resolutionRequestType" TEXT,
ADD COLUMN     "resolutionRequestedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Market_resolutionRequestedAt_idx" ON "Market"("resolutionRequestedAt");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_resolutionRequestOutcomeId_fkey" FOREIGN KEY ("resolutionRequestOutcomeId") REFERENCES "Outcome"("id") ON DELETE SET NULL ON UPDATE CASCADE;
