import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    // Back-compat: legacy simple nav items used by the old footer
    {
      name: 'navItems',
      type: 'array',
      admin: {
        condition: () => false, // hide in admin now that groups exist
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },

    // New: grouped link columns (e.g. Legal, Our Sites, Join Us)
    {
      name: 'linkGroups',
      type: 'array',
      labels: {
        singular: 'Link Group',
        plural: 'Link Groups',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          labels: {
            singular: 'Link',
            plural: 'Links',
          },
          fields: [link({ appearances: false })],
          maxRows: 20,
        },
      ],
    },

    // New: social links for icon row
    {
      type: 'row',
      fields: [
        {
          name: 'followTitle',
          type: 'text',
          label: 'Follow Title',
          defaultValue: 'Follow us',
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      labels: {
        singular: 'Social Link',
        plural: 'Social Links',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'X / Twitter', value: 'x' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Reddit', value: 'reddit' },
            { label: 'Custom', value: 'custom' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
        },
      ],
      maxRows: 12,
    },

    // Optional copyright / small print
    {
      name: 'copyright',
      type: 'text',
      admin: {
        placeholder: 'Copyright © 2025 Eutopias. All rights reserved.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
