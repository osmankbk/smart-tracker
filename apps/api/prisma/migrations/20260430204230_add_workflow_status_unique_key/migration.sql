/*
  Warnings:

  - A unique constraint covering the columns `[workflowId,key]` on the table `WorkflowStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStatus_workflowId_key_key" ON "WorkflowStatus"("workflowId", "key");
