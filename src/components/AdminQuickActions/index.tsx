import Link from 'next/link'
import React from 'react'

import './index.scss'

const baseClass = 'admin-quick-actions'

const AdminQuickActions: React.FC = () => {
  return (
    <nav className={baseClass} aria-labelledby="quick-actions-nav-heading">
      <div className={`${baseClass}__heading`} id="quick-actions-nav-heading">
        Quick actions
      </div>
      <ul className={`${baseClass}__list`}>
        <li className={`${baseClass}__item`}>
          <Link className={`${baseClass}__link`} href="/admin/collections/posts/create">
            Create a new Post
          </Link>
        </li>
        <li className={`${baseClass}__item`}>
          <Link className={`${baseClass}__link`} href="/admin/collections/pages/create">
            Create a new Page
          </Link>
        </li>
        <li className={`${baseClass}__item`}>
          <Link className={`${baseClass}__link`} href="/admin/collections/media">
            Manage Media
          </Link>
        </li>
        <li className={`${baseClass}__item`}>
          <a className={`${baseClass}__link`} href="/" target="_blank" rel="noopener noreferrer">
            View Site
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default AdminQuickActions


