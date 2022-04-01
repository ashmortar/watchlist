/*
  Warnings:

  - Added the required column `rating` to the `ListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `watched` to the `ListItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemJson" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL,
    "rating" INTEGER NOT NULL,
    CONSTRAINT "ListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListItem" ("createdAt", "id", "itemJson", "itemType", "listId", "updatedAt") SELECT "createdAt", "id", "itemJson", "itemType", "listId", "updatedAt" FROM "ListItem";
DROP TABLE "ListItem";
ALTER TABLE "new_ListItem" RENAME TO "ListItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
