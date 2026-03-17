-- 1. Créer la table contacts
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "contacts_email_key" ON "contacts"("email");

-- 2. Migrer les contacts existants (un contact par email unique)
INSERT INTO "contacts" ("id", "email", "name", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    cm."email",
    (SELECT cm2."name" FROM "contact_messages" cm2 WHERE cm2."email" = cm."email" ORDER BY cm2."createdAt" DESC LIMIT 1),
    MIN(cm."createdAt"),
    MAX(cm."createdAt")
FROM "contact_messages" cm
GROUP BY cm."email";

-- 3. Ajouter contactId (nullable) à contact_messages
ALTER TABLE "contact_messages" ADD COLUMN "contactId" TEXT;

-- 4. Remplir contactId
UPDATE "contact_messages" cm SET "contactId" = c."id" FROM "contacts" c WHERE c."email" = cm."email";

-- 5. NOT NULL
ALTER TABLE "contact_messages" ALTER COLUMN "contactId" SET NOT NULL;

-- 6. Drop colonnes devenues inutiles
ALTER TABLE "contact_messages" DROP COLUMN "email";
ALTER TABLE "contact_messages" DROP COLUMN "name";

-- 7. FK contact_messages -> contacts
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Renommer contactId -> contactMessageId dans message_replies
ALTER TABLE "message_replies" DROP CONSTRAINT "message_replies_contactId_fkey";
ALTER TABLE "message_replies" RENAME COLUMN "contactId" TO "contactMessageId";

-- 9. Ajouter attachments à message_replies
ALTER TABLE "message_replies" ADD COLUMN "attachments" JSONB NOT NULL DEFAULT '[]';

-- 10. FK message_replies -> contact_messages
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
