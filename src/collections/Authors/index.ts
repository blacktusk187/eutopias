import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'A brief biography of the author',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Author profile picture',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Social media and professional links',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'GitHub', value: 'github' },
            { label: 'Website', value: 'website' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'https://...',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Custom label for "Other" platform',
            condition: (data, siblingData) => siblingData?.platform === 'other',
          },
        },
      ],
    },
    {
      name: 'expertise',
      type: 'array',
      admin: {
        description: 'Areas of expertise or topics the author writes about',
      },
      fields: [
        {
          name: 'topic',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this author is currently active and can be assigned to new posts',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
