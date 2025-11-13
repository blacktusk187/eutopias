-- Migration SQL to add featuredSub3 and featuredSub4 columns
-- Run this on both preview and production databases
-- Date: 2025-01-XX

DO $$
BEGIN
  -- ============================================
  -- Add columns to pages_blocks_latest_stories (live table)
  -- ============================================
  
  -- Add featured_sub3_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pages_blocks_latest_stories' AND column_name='featured_sub3_id'
  ) THEN
    ALTER TABLE public.pages_blocks_latest_stories ADD COLUMN featured_sub3_id integer;
  END IF;

  -- Add featured_sub4_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pages_blocks_latest_stories' AND column_name='featured_sub4_id'
  ) THEN
    ALTER TABLE public.pages_blocks_latest_stories ADD COLUMN featured_sub4_id integer;
  END IF;

  -- Add foreign key constraint for featured_sub3_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' 
    AND table_name='pages_blocks_latest_stories' 
    AND constraint_name='pages_blocks_latest_stories_featured_sub3_id_posts_id_fk'
  ) THEN
    ALTER TABLE public.pages_blocks_latest_stories
    ADD CONSTRAINT pages_blocks_latest_stories_featured_sub3_id_posts_id_fk
    FOREIGN KEY (featured_sub3_id) REFERENCES public.posts(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key constraint for featured_sub4_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' 
    AND table_name='pages_blocks_latest_stories' 
    AND constraint_name='pages_blocks_latest_stories_featured_sub4_id_posts_id_fk'
  ) THEN
    ALTER TABLE public.pages_blocks_latest_stories
    ADD CONSTRAINT pages_blocks_latest_stories_featured_sub4_id_posts_id_fk
    FOREIGN KEY (featured_sub4_id) REFERENCES public.posts(id) ON DELETE SET NULL;
  END IF;

  -- Add index for featured_sub3_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' 
    AND tablename='pages_blocks_latest_stories' 
    AND indexname='pages_blocks_latest_stories_featured_sub3_idx'
  ) THEN
    CREATE INDEX pages_blocks_latest_stories_featured_sub3_idx 
    ON public.pages_blocks_latest_stories(featured_sub3_id);
  END IF;

  -- Add index for featured_sub4_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' 
    AND tablename='pages_blocks_latest_stories' 
    AND indexname='pages_blocks_latest_stories_featured_sub4_idx'
  ) THEN
    CREATE INDEX pages_blocks_latest_stories_featured_sub4_idx 
    ON public.pages_blocks_latest_stories(featured_sub4_id);
  END IF;

  -- ============================================
  -- Add columns to _pages_v_blocks_latest_stories (versions/drafts table)
  -- ============================================
  
  -- Add featured_sub3_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='_pages_v_blocks_latest_stories' AND column_name='featured_sub3_id'
  ) THEN
    ALTER TABLE public._pages_v_blocks_latest_stories ADD COLUMN featured_sub3_id integer;
  END IF;

  -- Add featured_sub4_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='_pages_v_blocks_latest_stories' AND column_name='featured_sub4_id'
  ) THEN
    ALTER TABLE public._pages_v_blocks_latest_stories ADD COLUMN featured_sub4_id integer;
  END IF;

  -- Add foreign key constraint for featured_sub3_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' 
    AND table_name='_pages_v_blocks_latest_stories' 
    AND constraint_name='_pages_v_blocks_latest_stories_featured_sub3_id_posts_id_fk'
  ) THEN
    ALTER TABLE public._pages_v_blocks_latest_stories
    ADD CONSTRAINT _pages_v_blocks_latest_stories_featured_sub3_id_posts_id_fk
    FOREIGN KEY (featured_sub3_id) REFERENCES public.posts(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key constraint for featured_sub4_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' 
    AND table_name='_pages_v_blocks_latest_stories' 
    AND constraint_name='_pages_v_blocks_latest_stories_featured_sub4_id_posts_id_fk'
  ) THEN
    ALTER TABLE public._pages_v_blocks_latest_stories
    ADD CONSTRAINT _pages_v_blocks_latest_stories_featured_sub4_id_posts_id_fk
    FOREIGN KEY (featured_sub4_id) REFERENCES public.posts(id) ON DELETE SET NULL;
  END IF;

  -- Add index for featured_sub3_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' 
    AND tablename='_pages_v_blocks_latest_stories' 
    AND indexname='_pages_v_blocks_latest_stories_featured_sub3_idx'
  ) THEN
    CREATE INDEX _pages_v_blocks_latest_stories_featured_sub3_idx 
    ON public._pages_v_blocks_latest_stories(featured_sub3_id);
  END IF;

  -- Add index for featured_sub4_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' 
    AND tablename='_pages_v_blocks_latest_stories' 
    AND indexname='_pages_v_blocks_latest_stories_featured_sub4_idx'
  ) THEN
    CREATE INDEX _pages_v_blocks_latest_stories_featured_sub4_idx 
    ON public._pages_v_blocks_latest_stories(featured_sub4_id);
  END IF;

END
$$;

