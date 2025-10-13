import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "categories" ADD COLUMN "banner_image_id" integer;
    ALTER TABLE "categories" ADD CONSTRAINT "categories_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "categories_banner_image_idx" ON "categories" USING btree ("banner_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "categories_banner_image_idx";
    ALTER TABLE "categories" DROP CONSTRAINT "categories_banner_image_id_media_id_fk";
    ALTER TABLE "categories" DROP COLUMN "banner_image_id";
  `)
}
