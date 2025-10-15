import * as migration_20251012_194200_add_banner_image from './20251012_194200_add_banner_image';
import * as migration_20251012_202500_fix_banner_constraint from './20251012_202500_fix_banner_constraint';
import * as migration_20251013_230000_add_media_block_columns from './20251013_230000_add_media_block_columns';
import * as migration_20251013_234500 from './20251013_234500';
import * as migration_20251014_000031 from './20251014_000031';
import * as migration_20251015_143606_fix_dev_push from './20251015_143606_fix_dev_push';

export const migrations = [
  {
    up: migration_20251012_194200_add_banner_image.up,
    down: migration_20251012_194200_add_banner_image.down,
    name: '20251012_194200_add_banner_image',
  },
  {
    up: migration_20251012_202500_fix_banner_constraint.up,
    down: migration_20251012_202500_fix_banner_constraint.down,
    name: '20251012_202500_fix_banner_constraint',
  },
  {
    up: migration_20251013_230000_add_media_block_columns.up,
    down: migration_20251013_230000_add_media_block_columns.down,
    name: '20251013_230000_add_media_block_columns',
  },
  {
    up: migration_20251013_234500.up,
    down: migration_20251013_234500.down,
    name: '20251013_234500',
  },
  {
    up: migration_20251014_000031.up,
    down: migration_20251014_000031.down,
    name: '20251014_000031',
  },
  {
    up: migration_20251015_143606_fix_dev_push.up,
    down: migration_20251015_143606_fix_dev_push.down,
    name: '20251015_143606_fix_dev_push'
  },
];
