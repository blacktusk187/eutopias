import type { Block } from 'payload'

export const LatestStoriesBlock: Block = {
  slug: 'latestStories',
  interfaceName: 'LatestStoriesBlock',
  fields: [
    {
      name: 'todaysPicks',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      required: true,
      minRows: 3,
      maxRows: 8,
      label: "Today's Picks",
      admin: {
        description: 'Select 3-8 posts to display in the left column',
      },
      maxDepth: 3,
    },
    {
      name: 'featuredMain',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Main Featured Article',
      admin: {
        description: 'Large featured article displayed at the top right',
      },
      maxDepth: 3,
    },
    {
      name: 'featuredSub1',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Featured Article 1',
      admin: {
        description: 'First article in the bottom grid',
      },
      maxDepth: 3,
    },
    {
      name: 'featuredSub2',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Featured Article 2',
      admin: {
        description: 'Second article in the bottom grid',
      },
      maxDepth: 3,
    },
  ],
  labels: {
    plural: 'Latest Stories Sections',
    singular: 'Latest Stories Section',
  },
}
