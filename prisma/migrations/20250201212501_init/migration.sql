-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    CONSTRAINT "Stakeholder_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "stakeholder1Id" TEXT NOT NULL,
    "stakeholder2Id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Relationship_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Relationship_stakeholder1Id_fkey" FOREIGN KEY ("stakeholder1Id") REFERENCES "Stakeholder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Relationship_stakeholder2Id_fkey" FOREIGN KEY ("stakeholder2Id") REFERENCES "Stakeholder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
