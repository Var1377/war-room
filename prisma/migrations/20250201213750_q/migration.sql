/*
  Warnings:

  - Made the column `overview` on table `Scenario` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Scenario" ("createdAt", "id", "model", "overview", "prompt", "title") SELECT "createdAt", "id", "model", "overview", "prompt", "title" FROM "Scenario";
DROP TABLE "Scenario";
ALTER TABLE "new_Scenario" RENAME TO "Scenario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
