import type { Migration, Payload } from 'payload'

export const addMediaBlockCols: Migration = {
  name: '20251020_add_media_block_cols',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await payload.db.drizzle.execute(`
      DO $$
      BEGIN
        -- live table
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='pages_blocks_media_block' AND column_name='layout'
        ) THEN
          ALTER TABLE public.pages_blocks_media_block ADD COLUMN layout text;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='pages_blocks_media_block' AND column_name='second_media_id'
        ) THEN
          ALTER TABLE public.pages_blocks_media_block ADD COLUMN second_media_id integer;
        END IF;

        -- versions table (admin reads this)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='_pages_v_blocks_media_block' AND column_name='layout'
        ) THEN
          ALTER TABLE public._pages_v_blocks_media_block ADD COLUMN layout text;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='_pages_v_blocks_media_block' AND column_name='second_media_id'
        ) THEN
          ALTER TABLE public._pages_v_blocks_media_block ADD COLUMN second_media_id integer;
        END IF;
      END
      $$;
    `)
  },
  down: async (args) => {
    const { payload } = args as { payload: Payload }
    await payload.db.drizzle.execute(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='_pages_v_blocks_media_block' AND column_name='second_media_id'
        ) THEN
          ALTER TABLE public._pages_v_blocks_media_block DROP COLUMN second_media_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='_pages_v_blocks_media_block' AND column_name='layout'
        ) THEN
          ALTER TABLE public._pages_v_blocks_media_block DROP COLUMN layout;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='pages_blocks_media_block' AND column_name='second_media_id'
        ) THEN
          ALTER TABLE public.pages_blocks_media_block DROP COLUMN second_media_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='pages_blocks_media_block' AND column_name='layout'
        ) THEN
          ALTER TABLE public.pages_blocks_media_block DROP COLUMN layout;
        END IF;
      END
      $$;
    `)
  },
}

export default addMediaBlockCols
