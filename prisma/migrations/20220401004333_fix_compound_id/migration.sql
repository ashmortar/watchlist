/*
  Warnings:

  - The primary key for the `ListMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ListMember` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListMember" (
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "listId"),
    CONSTRAINT "ListMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListMember_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ListMember" ("createdAt", "listId", "updatedAt", "userId") SELECT "createdAt", "listId", "updatedAt", "userId" FROM "ListMember";
DROP TABLE "ListMember";
ALTER TABLE "new_ListMember" RENAME TO "ListMember";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
