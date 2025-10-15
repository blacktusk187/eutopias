import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import CategoryTitleCell from '@/components/Admin/CategoryTitleCell'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        components: {
          // Cast to any to satisfy Payload's Admin component typing in this project setup
          Cell: CategoryTitleCell as unknown as any,
        },
      },
    },
    {
      name: 'bannerImage',
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
      label: 'Banner Background Image',
      admin: {
        description:
          'Background image for the category banner. Recommended size: 1920x400px or similar aspect ratio.',
      },
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'banner_image',
      type: 'relationship',
      relationTo: 'media',
    },
  ],
}
