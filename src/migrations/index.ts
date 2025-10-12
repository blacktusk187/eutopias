import * as migration_20251012_194200_add_banner_image from './20251012_194200_add_banner_image';

export const migrations = [
  {
    up: migration_20251012_194200_add_banner_image.up,
    down: migration_20251012_194200_add_banner_image.down,
    name: '20251012_194200_add_banner_image'
  },
];
