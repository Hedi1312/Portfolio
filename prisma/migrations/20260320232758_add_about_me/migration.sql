-- AlterTable
ALTER TABLE "cvs" ADD COLUMN     "resource_type" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "size" TEXT;

-- CreateTable
CREATE TABLE "about_me" (
    "id" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "stats" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_me_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_me_techs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#00D5BE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "aboutMeId" TEXT NOT NULL,

    CONSTRAINT "about_me_techs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "about_me_techs" ADD CONSTRAINT "about_me_techs_aboutMeId_fkey" FOREIGN KEY ("aboutMeId") REFERENCES "about_me"("id") ON DELETE CASCADE ON UPDATE CASCADE;
