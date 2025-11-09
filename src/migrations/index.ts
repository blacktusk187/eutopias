import type { Migration } from 'payload'
import { addIssueNumber } from './20251109_add_issue_number'
import { addMediaBlockCols } from './20251020_add_media_block_cols'

export const migrations: Migration[] = [addMediaBlockCols, addIssueNumber]
export default migrations
