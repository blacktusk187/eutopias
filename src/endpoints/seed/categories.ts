import type { Payload } from 'payload'
import { toKebabCase } from '@/utilities/toKebabCase'

type CategoryNode = {
  title: string
  children?: string[]
}

export const categoryTree: CategoryNode[] = [
  {
    title: 'Travel',
    children: [
      'Adventure Travel',
      'Wellness Travel',
      'Spa',
      'Farm to Table',
      'Farm Stays',
      'Family-Friendly Travel',
      'Retreat Getaways',
      'Workshops',
    ],
  },
  {
    title: 'Health / Wellness',
    children: [
      'Nutrition',
      'Food',
      'Recipes',
      'Fitness',
      'Self-Care',
      'Spa',
      'Regenerative Medicine',
      'Modalities',
      'Therapies',
      'Sound Healing',
      'Science',
    ],
  },
  {
    title: 'Outdoors',
    children: [
      'Recreation & Sport',
      'Environment',
      'Nature',
      'Regenerative Living',
      'Regenerative Ag',
      'Science',
      'Homesteading/Garden',
    ],
  },
  {
    title: 'Culture',
    children: [
      'Architecture & Design',
      'Music',
      'Sound Healing',
      'Glocal Traditions/Lifestyle/Practices',
      'Ancient Wisdom/Practices',
      'Technology',
      'Regenerative Tech',
      'Science',
    ],
  },
]

export async function seedNestedCategories(payload: Payload): Promise<void> {
  for (const node of categoryTree) {
    const parentSlug = toKebabCase(node.title)

    // Find or create parent
    const parentExisting = await payload.find({
      collection: 'categories',
      where: { slug: { equals: parentSlug } },
      limit: 1,
      depth: 0,
    })

    const parentDoc =
      parentExisting?.docs?.[0] ||
      (await payload.create({
        collection: 'categories',
        depth: 0,
        data: { title: node.title, slug: parentSlug },
      }))

    if (node.children && node.children.length > 0) {
      for (const childTitle of node.children) {
        const childSlug = toKebabCase(childTitle.replace(/^\*/g, ''))
        const existingChild = await payload.find({
          collection: 'categories',
          where: {
            and: [
              { slug: { equals: childSlug } },
              { parent: { equals: parentDoc.id } },
            ],
          },
          limit: 1,
          depth: 0,
        })

        if (!existingChild?.docs?.[0]) {
          await payload.create({
            collection: 'categories',
            depth: 0,
            data: {
              title: childTitle.replace(/^\*/g, ''),
              slug: childSlug,
              parent: parentDoc.id,
            },
          })
        }
      }
    }
  }
}


