import React from 'react'
import { createIcon } from './common.js'

export const IoChevronBack = createIcon('IoChevronBack', () =>
  React.createElement('polyline', {
    points: '15 6 9 12 15 18',
  }),
)

export const IoChevronForward = createIcon('IoChevronForward', () =>
  React.createElement('polyline', {
    points: '9 6 15 12 9 18',
  }),
)

export const IoEllipsisHorizontal = createIcon('IoEllipsisHorizontal', () => [
  React.createElement('circle', { cx: 6, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none', key: 'dot1' }),
  React.createElement('circle', { cx: 12, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none', key: 'dot2' }),
  React.createElement('circle', { cx: 18, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none', key: 'dot3' }),
])
