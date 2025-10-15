import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" DROP CONSTRAINT "pages_blocks_media_block_media2_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_media_block" DROP CONSTRAINT "_pages_v_blocks_media_block_media2_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "layout" SET DEFAULT 'single'::text;
  DROP TYPE "public"."enum_pages_blocks_media_block_layout";
  CREATE TYPE "public"."enum_pages_blocks_media_block_layout" AS ENUM('single');
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "layout" SET DEFAULT 'single'::"public"."enum_pages_blocks_media_block_layout";
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_media_block_layout" USING "layout"::"public"."enum_pages_blocks_media_block_layout";
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "layout" SET DEFAULT 'single'::text;
  DROP TYPE "public"."enum__pages_v_blocks_media_block_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_layout" AS ENUM('single');
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "layout" SET DEFAULT 'single'::"public"."enum__pages_v_blocks_media_block_layout";
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__pages_v_blocks_media_block_layout" USING "layout"::"public"."enum__pages_v_blocks_media_block_layout";
  DROP INDEX "pages_blocks_media_block_media2_idx";
  DROP INDEX "_pages_v_blocks_media_block_media2_idx";
  CREATE INDEX "categories_banner_image_1_idx" ON "categories" USING btree ("banner_image_id");
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "media2_id";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "media2_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_media_block_layout" ADD VALUE 'side-by-side-vertical';
  ALTER TYPE "public"."enum_pages_blocks_media_block_layout" ADD VALUE 'side-by-side-horizontal';
  ALTER TYPE "public"."enum__pages_v_blocks_media_block_layout" ADD VALUE 'side-by-side-vertical';
  ALTER TYPE "public"."enum__pages_v_blocks_media_block_layout" ADD VALUE 'side-by-side-horizontal';
  DROP INDEX "categories_banner_image_1_idx";
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "media2_id" integer;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "media2_id" integer;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media2_id_media_id_fk" FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media2_id_media_id_fk" FOREIGN KEY ("media2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_media_block_media2_idx" ON "pages_blocks_media_block" USING btree ("media2_id");
  CREATE INDEX "_pages_v_blocks_media_block_media2_idx" ON "_pages_v_blocks_media_block" USING btree ("media2_id");`)
}
