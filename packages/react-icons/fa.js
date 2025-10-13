import React from 'react'
import { createIcon } from './common.js'

export const FaArrowRight = createIcon('FaArrowRight', () => [
  React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12, key: 'shaft' }),
  React.createElement('polyline', { points: '13 6 19 12 13 18', key: 'head' }),
])
