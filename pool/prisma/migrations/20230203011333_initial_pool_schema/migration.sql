-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DiningHall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PoolEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dining_hall_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "PoolEntry_dining_hall_id_fkey" FOREIGN KEY ("dining_hall_id") REFERENCES "DiningHall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PoolEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiningHallHours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
