-- CreateIndex
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");

-- CreateIndex
CREATE INDEX "Event_state_idx" ON "Event"("state");

-- CreateIndex
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");

-- CreateIndex
CREATE INDEX "EventBonificado_serviceId_idx" ON "EventBonificado"("serviceId");

-- CreateIndex
CREATE INDEX "EventProvider_providerId_idx" ON "EventProvider"("providerId");

-- CreateIndex
CREATE INDEX "EventService_serviceId_idx" ON "EventService"("serviceId");

-- CreateIndex
CREATE INDEX "Movement_date_idx" ON "Movement"("date");

-- CreateIndex
CREATE INDEX "Movement_eventId_idx" ON "Movement"("eventId");

-- CreateIndex
CREATE INDEX "Movement_accountId_idx" ON "Movement"("accountId");

-- CreateIndex
CREATE INDEX "Movement_toAccountId_idx" ON "Movement"("toAccountId");

-- CreateIndex
CREATE INDEX "Service_proveedorId_idx" ON "Service"("proveedorId");
