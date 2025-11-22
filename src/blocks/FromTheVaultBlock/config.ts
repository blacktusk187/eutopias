import type { Block, Field } from 'payload'

export const FromTheVaultBlock: Block = {
  slug: 'fromTheVault',
  interfaceName: 'FromTheVaultBlock',
  fields: [
    {
      name: 'currentIssueNumber',
      type: 'number',
      required: true,
      defaultValue: 35,
      label: 'Current Issue Number',
      admin: {
        description: 'The current issue number (past issues will be excluded)',
      },
    },
    {
      name: 'featuredArticles',
      type: 'array',
      label: 'Featured Articles by Issue',
      admin: {
        description: 'Select a featured article to display as the cover for each issue. If not set, the first post from the issue will be used.',
      },
      fields: [
        {
          name: 'issueNumber',
          type: 'number',
          required: true,
          label: 'Issue Number',
        },
        {
          name: 'featuredPost',
          type: 'relationship',
          relationTo: 'posts',
          required: false,
          label: 'Featured Post (Cover Image)',
          admin: {
            description: 'Optional: Select a specific post to use as the cover. If not selected, the first post from the issue will be used.',
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'From the Vault Sections',
    singular: 'From the Vault Section',
  },
}

