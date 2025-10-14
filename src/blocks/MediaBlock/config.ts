import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'media2',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional second image for side-by-side layouts',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'shadowed',
      options: [
        { label: 'Bordered', value: 'bordered' },
        { label: 'Shadowed (default)', value: 'shadowed' },
        { label: 'Frameless', value: 'frameless' },
      ],
      admin: {
        description: 'Visual style of the image',
      },
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'sm',
      options: [
        { label: 'Small (default)', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'XL', value: 'xl' },
        { label: 'Full', value: 'full' },
      ],
      admin: {
        description: 'Content width of the image block',
      },
    },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center (default)', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      admin: {
        description: 'Horizontal alignment within the content',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'single',
      options: [
        { label: 'Single image (default)', value: 'single' },
        { label: 'Two images side by side (vertical)', value: 'side-by-side-vertical' },
        { label: 'Two images side by side (horizontal)', value: 'side-by-side-horizontal' },
      ],
      admin: {
        description: 'Layout for multiple images - only applies when media2 is uploaded',
      },
    },
  ],
}
