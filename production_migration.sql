-- Production Migration SQL
-- Run this on your production database to add issue number support and issue block tables
-- Date: 2025-11-09

-- ============================================
-- Migration 1: Add issue_number columns
-- ============================================

DO $$
BEGIN
  -- Add issue_number to posts table (live table)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='posts' AND column_name='issue_number'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN issue_number numeric;
  END IF;

  -- Add version_issue_number to _posts_v table (versions table for admin)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='_posts_v' AND column_name='version_issue_number'
  ) THEN
    ALTER TABLE public._posts_v ADD COLUMN version_issue_number numeric;
  END IF;

  -- Add issue_number to pages_blocks_archive table (for pages that use archive blocks)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pages_blocks_archive' AND column_name='issue_number'
  ) THEN
    ALTER TABLE public.pages_blocks_archive ADD COLUMN issue_number numeric;
  END IF;

  -- Add issue_number to _pages_v_blocks_archive table (for drafts/admin)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='_pages_v_blocks_archive' AND column_name='issue_number'
  ) THEN
    ALTER TABLE public._pages_v_blocks_archive ADD COLUMN issue_number numeric;
  END IF;
END
$$;

-- ============================================
-- Migration 2: Create issue block tables
-- ============================================

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

