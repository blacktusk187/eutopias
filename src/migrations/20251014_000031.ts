import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Force add media2_id column to _pages_v_blocks_media_block table
  try {
    await db.execute(sql`
      ALTER TABLE "_pages_v_blocks_media_block" 
      ADD COLUMN "media2_id" integer;
    `)
    console.log('Added media2_id column to _pages_v_blocks_media_block')
  } catch (error) {
    console.log('media2_id column may already exist:', error.message)
  }

  // Force add layout column to _pages_v_blocks_media_block table
  try {
    await db.execute(sql`
      ALTER TABLE "_pages_v_blocks_media_block" 
      ADD COLUMN "layout" varchar DEFAULT 'single';
    `)
    console.log('Added layout column to _pages_v_blocks_media_block')
  } catch (error) {
    console.log('layout column may already exist:', error.message)
  }

  // Add foreign key constraint for media2_id in version table
  try {
    await db.execute(sql`
      ALTER TABLE "_pages_v_blocks_media_block" 
      ADD CONSTRAINT "_pages_v_blocks_media_block_media2_id_media_id_fk" 
      FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") 
      ON DELETE set null ON UPDATE no action;
    `)
    console.log('Added foreign key constraint for media2_id')
  } catch (error) {
    console.log('Foreign key constraint may already exist:', error.message)
  }

  // Add index for media2_id in version table
  try {
    await db.execute(sql`
      CREATE INDEX "_pages_v_blocks_media_block_media2_idx" 
      ON "_pages_v_blocks_media_block" USING btree ("media2_id");
    `)
    console.log('Added index for media2_id')
  } catch (error) {
    console.log('Index may already exist:', error.message)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
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
