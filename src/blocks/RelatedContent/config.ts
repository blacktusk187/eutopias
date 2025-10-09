import type { Block } from 'payload'

export const RelatedContent: Block = {
  slug: 'relatedContent',
  interfaceName: 'RelatedContentBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'You may also like',
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      required: true,
      maxDepth: 2,
    },
  ],
  labels: {
    plural: 'Related Content Blocks',
    singular: 'Related Content Block',
  },
}
