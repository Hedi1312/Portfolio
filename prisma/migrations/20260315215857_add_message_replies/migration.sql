-- CreateTable
CREATE TABLE "message_replies" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "message_replies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
