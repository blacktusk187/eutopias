import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add media2_id column to pages_blocks_media_block table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    ADD COLUMN IF NOT EXISTS "media2_id" integer;
  `)

  // Add layout column to pages_blocks_media_block table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    ADD COLUMN IF NOT EXISTS "layout" varchar DEFAULT 'single';
  `)

  // Add foreign key constraint for media2_id
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    ADD CONSTRAINT "pages_blocks_media_block_media2_id_media_id_fk" 
    FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") 
    ON DELETE set null ON UPDATE no action;
  `)

  // Add index for media2_id
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_media_block_media2_idx" 
    ON "pages_blocks_media_block" USING btree ("media2_id");
  `)

  // Add media2_id column to _pages_v_blocks_media_block table (version table)
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    ADD COLUMN IF NOT EXISTS "media2_id" integer;
  `)

  // Add layout column to _pages_v_blocks_media_block table (version table)
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    ADD COLUMN IF NOT EXISTS "layout" varchar DEFAULT 'single';
  `)

  // Add foreign key constraint for media2_id in version table
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    ADD CONSTRAINT "_pages_v_blocks_media_block_media2_id_media_id_fk" 
    FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") 
    ON DELETE set null ON UPDATE no action;
  `)

  // Add index for media2_id in version table
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_media_block_media2_idx" 
    ON "_pages_v_blocks_media_block" USING btree ("media2_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Remove the foreign key constraint from main table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    DROP CONSTRAINT IF EXISTS "pages_blocks_media_block_media2_id_media_id_fk";
  `)

  // Remove the index from main table
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_blocks_media_block_media2_idx";
  `)

  // Remove the columns from main table
  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    DROP COLUMN IF EXISTS "media2_id";
  `)

  await db.execute(sql`
    ALTER TABLE "pages_blocks_media_block" 
    DROP COLUMN IF EXISTS "layout";
  `)

  // Remove the foreign key constraint from version table
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    DROP CONSTRAINT IF EXISTS "_pages_v_blocks_media_block_media2_id_media_id_fk";
  `)

  // Remove the index from version table
  await db.execute(sql`
    DROP INDEX IF EXISTS "_pages_v_blocks_media_block_media2_idx";
  `)

  // Remove the columns from version table
  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    DROP COLUMN IF EXISTS "media2_id";
  `)

  await db.execute(sql`
    ALTER TABLE "_pages_v_blocks_media_block" 
    DROP COLUMN IF EXISTS "layout";
  `)
}
