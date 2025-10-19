import type { Migration } from 'payload'
import { addLayoutSecondMediaToMediaBlock } from './src/migrations/20251019_add_layout_to_media_block'

export const migrations: Migration[] = [addLayoutSecondMediaToMediaBlock]
export default migrations
