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
      maxRows: 5,
      label: "Today's Picks",
      admin: {
        description: 'Select 3-5 posts to display in the left column',
      },
    },
    {
      name: 'featuredMain',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Main Featured Article',
      admin: {
        description: 'Large featured article displayed at the top right',
      },
    },
    {
      name: 'featuredSub1',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Featured Article 1',
      admin: {
        description: 'First article in the bottom grid',
      },
    },
    {
      name: 'featuredSub2',
      type: 'relationship',
      relationTo: 'posts',
      label: 'Featured Article 2',
      admin: {
        description: 'Second article in the bottom grid',
      },
    },
  ],
  labels: {
    plural: 'Latest Stories Sections',
    singular: 'Latest Stories Section',
  },
}
