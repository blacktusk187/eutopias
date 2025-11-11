import type { Migration, Payload } from 'payload'

export const addIssueBlockTable: Migration = {
  name: '20251109_add_issue_block_table',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await payload.db.drizzle.execute(`
      DO $$
      BEGIN
        -- Create pages_blocks_issue table if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema='public' AND table_name='pages_blocks_issue'
        ) THEN
          CREATE TABLE public.pages_blocks_issue (
            id varchar PRIMARY KEY,
            _order integer NOT NULL,
            _path text NOT NULL,
            _parent_id integer NOT NULL,
            issue_number numeric,
            block_name varchar,
            CONSTRAINT pages_blocks_issue_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE
          );

          -- Create indexes
          CREATE INDEX pages_blocks_issue_order_idx ON public.pages_blocks_issue(_order);
          CREATE INDEX pages_blocks_issue_parent_id_idx ON public.pages_blocks_issue(_parent_id);
          CREATE INDEX pages_blocks_issue_path_idx ON public.pages_blocks_issue(_path);
        END IF;

        -- Create _pages_v_blocks_issue table (for versions/drafts) if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema='public' AND table_name='_pages_v_blocks_issue'
        ) THEN
          CREATE TABLE public._pages_v_blocks_issue (
            id serial PRIMARY KEY,
            _order integer NOT NULL,
            _path text NOT NULL,
            _parent_id integer NOT NULL,
            issue_number numeric,
            block_name varchar,
            _uuid varchar,
            CONSTRAINT _pages_v_blocks_issue_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE
          );

          -- Create indexes
          CREATE INDEX _pages_v_blocks_issue_order_idx ON public._pages_v_blocks_issue(_order);
          CREATE INDEX _pages_v_blocks_issue_parent_id_idx ON public._pages_v_blocks_issue(_parent_id);
          CREATE INDEX _pages_v_blocks_issue_path_idx ON public._pages_v_blocks_issue(_path);
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
        -- Drop version table first
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema='public' AND table_name='_pages_v_blocks_issue'
        ) THEN
          DROP TABLE public._pages_v_blocks_issue;
        END IF;

        -- Drop main table
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema='public' AND table_name='pages_blocks_issue'
        ) THEN
          DROP TABLE public.pages_blocks_issue;
        END IF;
      END
      $$;
    `)
  },
}

export default addIssueBlockTable

