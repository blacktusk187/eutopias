import type { Migration, Payload } from 'payload'

export const addIssueNumber: Migration = {
  name: '20251109_add_issue_number',
  up: async (args) => {
    const { payload } = args as { payload: Payload }
    await payload.db.drizzle.execute(`
      DO $$
      BEGIN
        -- live table
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='posts' AND column_name='issue_number'
        ) THEN
          ALTER TABLE public.posts ADD COLUMN issue_number numeric;
        END IF;

        -- versions table (admin reads this) - Payload uses version_ prefix for version columns
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='_posts_v' AND column_name='version_issue_number'
        ) THEN
          ALTER TABLE public._posts_v ADD COLUMN version_issue_number numeric;
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
          WHERE table_schema='public' AND table_name='_posts_v' AND column_name='version_issue_number'
        ) THEN
          ALTER TABLE public._posts_v DROP COLUMN version_issue_number;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='posts' AND column_name='issue_number'
        ) THEN
          ALTER TABLE public.posts DROP COLUMN issue_number;
        END IF;
      END
      $$;
    `)
  },
}

export default addIssueNumber

