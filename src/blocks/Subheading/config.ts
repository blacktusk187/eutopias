import type { Block } from 'payload'

export const Subheading: Block = {
  slug: 'subheading',
  interfaceName: 'SubheadingBlock',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'h2',
      options: [
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
      ],
    },
  ],
  labels: {
    plural: 'Subheadings',
    singular: 'Subheading',
  },
}
