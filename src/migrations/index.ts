import type { Migration } from 'payload'
import { addIssueNumber } from './20251109_add_issue_number'
import { addMediaBlockCols } from './20251020_add_media_block_cols'
import { addIssueBlockTable } from './20251109_add_issue_block_table'

export const migrations: Migration[] = [addMediaBlockCols, addIssueNumber, addIssueBlockTable]
export default migrations
