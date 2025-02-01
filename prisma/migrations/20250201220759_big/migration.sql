-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stakeholder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "interests" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Stakeholder_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Stakeholder" ("id", "interests", "name", "role", "scenarioId") SELECT "id", "interests", "name", "role", "scenarioId" FROM "Stakeholder";
DROP TABLE "Stakeholder";
ALTER TABLE "new_Stakeholder" RENAME TO "Stakeholder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
