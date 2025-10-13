import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Manually add media2_id column to _pages_v_blocks_media_block table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = '_pages_v_blocks_media_block' 
        AND column_name = 'media2_id'
      ) THEN
        ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "media2_id" integer;
      END IF;
    END $$;
  `)

  // Manually add layout column to _pages_v_blocks_media_block table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = '_pages_v_blocks_media_block' 
        AND column_name = 'layout'
      ) THEN
        ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "layout" varchar DEFAULT 'single';
      END IF;
    END $$;
  `)

  // Add foreign key constraint for media2_id in version table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = '_pages_v_blocks_media_block_media2_id_media_id_fk'
      ) THEN
        ALTER TABLE "_pages_v_blocks_media_block" 
        ADD CONSTRAINT "_pages_v_blocks_media_block_media2_id_media_id_fk" 
        FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") 
        ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;
  `)

  // Add index for media2_id in version table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = '_pages_v_blocks_media_block_media2_idx'
      ) THEN
        CREATE INDEX "_pages_v_blocks_media_block_media2_idx" 
        ON "_pages_v_blocks_media_block" USING btree ("media2_id");
      END IF;
    END $$;
  `)
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
