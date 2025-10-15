// src/migrations/20251015_143606_fix_dev_push.ts
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'
import { sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Remove stale FKs if they exist (no DO blocks; just IF EXISTS)
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block"
      DROP CONSTRAINT IF EXISTS "pages_blocks_media_block_media2_id_media_id_fk";
  `)

  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block"
      DROP CONSTRAINT IF EXISTS "_pages_v_blocks_media_block_media2_id_media_id_fk";
  `)

  // Drop stale indexes if present
  await db.execute(sql`DROP INDEX IF EXISTS "pages_blocks_media_block_media2_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "_pages_v_blocks_media_block_media2_idx";`)

  // Ensure expected index exists
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "categories_banner_image_1_idx"
      ON "categories" USING btree ("banner_image_id");
  `)

  // Drop the extra column(s) if present
  await db.execute(sql`ALTER TABLE "pages_blocks_media_block" DROP COLUMN IF EXISTS "media2_id";`)
  await db.execute(
    sql`ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN IF EXISTS "media2_id";`,
  )

  // Leave "layout" / enum alone:
  // - If those columns/types don't exist, touching them causes errors.
  // - If they do exist and are already correct, no action needed here.
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // No-op (drift cleanup); keep down empty to avoid reintroducing removed objects.
  await db.execute(sql`SELECT 1;`)
}
