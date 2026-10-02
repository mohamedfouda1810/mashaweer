-- Deleted users are retained for historical records, but must not reserve
-- login identifiers needed by future registrations.
UPDATE "users"
SET
  "email" = 'deleted-' || "id" || '@deleted.invalid',
  "phone" = 'deleted-' || "id"
WHERE "deletedAt" IS NOT NULL
  AND (
    "email" NOT LIKE 'deleted-%@deleted.invalid'
    OR "phone" NOT LIKE 'deleted-%'
  );
