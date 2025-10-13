import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

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
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Background Image',
      admin: {
        description:
          'Background image for the category banner. Recommended size: 1920x400px or similar aspect ratio.',
      },
    },
    {
      name: 'imagePosition',
      type: 'select',
      label: 'Image Position',
      options: [
        {
          label: 'Top',
          value: 'top',
        },
        {
          label: 'Middle',
          value: 'center',
        },
        {
          label: 'Bottom',
          value: 'bottom',
        },
      ],
      defaultValue: 'center',
      admin: {
        description:
          'Choose which part of the image to display when the image is taller than the banner area.',
      },
    },
  ],
}
