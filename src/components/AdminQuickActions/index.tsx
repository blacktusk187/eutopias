'use client'

import React from 'react'
import { NavGroup } from '@payloadcms/ui'
import Link from 'next/link'

const AdminQuickActions: React.FC = () => {
  return (
    <NavGroup label="Quick actions">
      <ul className="nav-group__list">
        <li className="nav__item">
          <Link className="nav__link" href="/admin/collections/posts/create">
            Create a new Post
          </Link>
        </li>
        <li className="nav__item">
          <Link className="nav__link" href="/admin/collections/pages/create">
            Create a new Page
          </Link>
        </li>
        <li className="nav__item">
          <Link className="nav__link" href="/admin/collections/media">
            Manage Media
          </Link>
        </li>
        <li className="nav__item">
          <a className="nav__link" href="/" target="_blank" rel="noopener noreferrer">
            View Site
          </a>
        </li>
      </ul>
    </NavGroup>
  )
}

export default AdminQuickActions
