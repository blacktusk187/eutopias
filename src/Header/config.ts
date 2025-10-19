// src/Header/config.ts
import type { GlobalConfig } from 'payload'
import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: { read: () => true },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [link({ appearances: false })],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],

    // ✅ Auto-populate from Categories if Header.navItems is empty
    afterRead: [
      async ({ req, doc }) => {
        if (Array.isArray(doc.navItems) && doc.navItems.length > 0) return doc

        const cats = await req.payload.find({
          collection: 'categories',
          where: { parent: { exists: false } },
          select: { title: true, slug: true },
          limit: 100,
          depth: 0,
        })

        const fallback = cats.docs.map((c: any) => ({
          link: {
            type: 'custom',
            label: c.title,
            url: `/category/${c.slug}`,
            newTab: false,
          },
        }))

        return { ...doc, navItems: fallback }
      },
    ],
  },
}
