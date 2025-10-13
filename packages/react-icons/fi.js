import React from 'react'
import { createIcon } from './common.js'

export const FiSearch = createIcon('FiSearch', () => [
  React.createElement('circle', { cx: 11, cy: 11, r: 6, key: 'circle' }),
  React.createElement('line', { x1: 16.5, y1: 16.5, x2: 21, y2: 21, key: 'handle' }),
])

export const FiX = createIcon('FiX', () => [
  React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18, key: 'line1' }),
  React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18, key: 'line2' }),
])

export const FiMenu = createIcon('FiMenu', () => [
  React.createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6, key: 'line1' }),
  React.createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12, key: 'line2' }),
  React.createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18, key: 'line3' }),
])

export const FiTrendingUp = createIcon('FiTrendingUp', () =>
  React.createElement('polyline', {
    points: '3 17 9 11 13 15 21 7',
  }),
)

export const FiChevronDown = createIcon('FiChevronDown', () =>
  React.createElement('polyline', {
    points: '6 9 12 15 18 9',
  }),
)

export const FiChevronUp = createIcon('FiChevronUp', () =>
  React.createElement('polyline', {
    points: '6 15 12 9 18 15',
  }),
)

export const FiCheck = createIcon('FiCheck', () =>
  React.createElement('polyline', {
    points: '5 12 10 17 19 8',
  }),
)
