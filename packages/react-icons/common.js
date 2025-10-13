import React from 'react'

const defaultSvgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

export function createIcon(name, render, viewBox = '0 0 24 24') {
  const Icon = React.forwardRef(function Icon(props, ref) {
    return React.createElement(
      'svg',
      {
        ...defaultSvgProps,
        ...props,
        ref,
        viewBox,
      },
      render(),
    )
  })

  Icon.displayName = name

  return Icon
}
