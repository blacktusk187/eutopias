import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First, let's check if the constraint exists and drop it if it does
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_banner_image_id_media_id_fk'
        AND table_name = 'categories'
      ) THEN
        ALTER TABLE "categories" DROP CONSTRAINT "categories_banner_image_id_media_id_fk";
      END IF;
    END $$;
  `)

  // Recreate the constraint with proper settings
  await db.execute(sql`
    ALTER TABLE "categories" ADD CONSTRAINT "categories_banner_image_id_media_id_fk" 
    FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "categories" DROP CONSTRAINT "categories_banner_image_id_media_id_fk";
  `)
}
