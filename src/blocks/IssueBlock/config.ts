import type { Block } from 'payload'

export const IssueBlock: Block = {
  slug: 'issue',
  interfaceName: 'IssueBlock',
  fields: [
    {
      name: 'issueNumber',
      type: 'number',
      required: true,
      defaultValue: 35,
      label: 'Issue Number',
      admin: {
        description: 'The issue number to display posts from',
      },
    },
  ],
  labels: {
    plural: 'Issue Sections',
    singular: 'Issue Section',
  },
}

