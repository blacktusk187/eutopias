// src/migrations/20251019_add_layout_second_media_to_media_block.ts
import type { Migration, PayloadRequest, Payload } from 'payload'

type MigArgs = { payload: Payload; req: PayloadRequest }

const SQL = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='pages_blocks_media_block'
      AND column_name='layout'
  ) THEN
    ALTER TABLE public.pages_blocks_media_block
      ADD COLUMN layout text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='pages_blocks_media_block'
      AND column_name='second_media_id'
  ) THEN
    ALTER TABLE public.pages_blocks_media_block
      ADD COLUMN second_media_id integer;
  END IF;

  -- OPTIONAL FK (safe, nullable)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_media_block_second_media_fk'
  ) THEN
    BEGIN
      ALTER TABLE public.pages_blocks_media_block
        ADD CONSTRAINT pages_blocks_media_block_second_media_fk
        FOREIGN KEY (second_media_id) REFERENCES public.media(id)
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;`

const DOWN_SQL = `
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_media_block_second_media_fk'
  ) THEN
    ALTER TABLE public.pages_blocks_media_block
      DROP CONSTRAINT pages_blocks_media_block_second_media_fk;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='pages_blocks_media_block'
      AND column_name='second_media_id'
  ) THEN
    ALTER TABLE public.pages_blocks_media_block
      DROP COLUMN second_media_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='pages_blocks_media_block'
      AND column_name='layout'
  ) THEN
    ALTER TABLE public.pages_blocks_media_block
      DROP COLUMN layout;
  END IF;
END
$$;`

export const addLayoutSecondMediaToMediaBlock: Migration = {
  name: '20251019_add_layout_second_media_to_media_block',
  up: async (args: unknown) => {
    const { payload } = args as MigArgs
    await payload.db.drizzle.execute(SQL)
  },
  down: async (args: unknown) => {
    const { payload } = args as MigArgs
    await payload.db.drizzle.execute(DOWN_SQL)
  },
}

export default addLayoutSecondMediaToMediaBlock
