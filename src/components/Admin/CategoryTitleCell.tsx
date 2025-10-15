'use client'

import React from 'react'

type Props = {
  cellData?: unknown
  rowData?: {
    parent?: unknown
  }
}

export const CategoryTitleCell: React.FC<Props> = ({ cellData, rowData }) => {
  const isChildCategory = Boolean(rowData?.parent)

  if (!isChildCategory) {
    return <span>{String(cellData ?? '')}</span>
  }

  return (
    <span
      style={{
        backgroundColor: '#dbeafe', // blue-100
        color: '#1e3a8a', // blue-800
        padding: '2px 8px',
        borderRadius: 6,
        display: 'inline-block',
      }}
      title="Subcategory"
    >
      {String(cellData ?? '')}
    </span>
  )
}

export default CategoryTitleCell
