import type { Payload, PayloadRequest } from 'payload'
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
    title: 'Health & Wellness',
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
      'Global Traditions',
      'Ancient Wisdom',
      'Technology',
      'Regenerative Tech',
      'Science',
    ],
  },
]

type SeedSummary = {
  parentsCreated: number
  parentsExisting: number
  childrenCreated: number
  childrenExisting: number
}

export async function seedNestedCategories(
  payload: Payload,
  req?: PayloadRequest,
): Promise<SeedSummary> {
  const summary: SeedSummary = {
    parentsCreated: 0,
    parentsExisting: 0,
    childrenCreated: 0,
    childrenExisting: 0,
  }

  const makeSlug = (input: string): string =>
    toKebabCase(input)
      .replace(/[\/]+/g, '-') // replace forward slashes
      .replace(/[^a-z0-9-]+/g, '-') // remove any other unsafe chars
      .replace(/-+/g, '-') // collapse dashes
      .replace(/^-|-$/g, '') // trim dashes

  for (const node of categoryTree) {
    const parentSlug = makeSlug(node.title)

    // Find or create parent
    const parentExisting = await payload.find({
      collection: 'categories',
      where: { slug: { equals: parentSlug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let parentDoc = parentExisting?.docs?.[0]
    if (parentDoc) {
      summary.parentsExisting += 1
      payload.logger.info(`Category parent exists: ${node.title} (${parentSlug})`)
    } else {
      payload.logger.info(`Creating category parent: ${node.title} (${parentSlug})`)
      parentDoc = await payload.create({
        collection: 'categories',
        depth: 0,
        data: { title: node.title, slug: parentSlug },
        req,
        overrideAccess: true,
      })
      summary.parentsCreated += 1
    }

    if (node.children && node.children.length > 0) {
      for (const childTitle of node.children) {
        const rawChildSlug = makeSlug(childTitle.replace(/^\*/g, ''))
        const childSlug = makeSlug(`${parentSlug}-${rawChildSlug}`)
        const existingChild = await payload.find({
          collection: 'categories',
          where: {
            and: [{ slug: { equals: childSlug } }, { parent: { equals: parentDoc.id } }],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })

        if (!existingChild?.docs?.[0]) {
          payload.logger.info(
            `Creating child category: ${childTitle} (${childSlug}) under ${node.title} (${parentSlug})`,
          )
          await payload.create({
            collection: 'categories',
            depth: 0,
            data: {
              title: childTitle.replace(/^\*/g, ''),
              slug: childSlug,
              parent: parentDoc.id,
            },
            req,
            overrideAccess: true,
          })
          summary.childrenCreated += 1
        } else {
          payload.logger.info(
            `Child category exists: ${childTitle} (${childSlug}) under ${node.title} (${parentSlug})`,
          )
          summary.childrenExisting += 1
        }
      }
    }
  }

  payload.logger.info(
    `Seeding categories complete — parents created: ${summary.parentsCreated}, parents existing: ${summary.parentsExisting}, children created: ${summary.childrenCreated}, children existing: ${summary.childrenExisting}`,
  )

  return summary
}
