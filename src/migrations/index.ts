import * as migration_20251012_194200_add_banner_image from './20251012_194200_add_banner_image'
import * as migration_20251012_202500_fix_banner_constraint from './20251012_202500_fix_banner_constraint'

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
]
