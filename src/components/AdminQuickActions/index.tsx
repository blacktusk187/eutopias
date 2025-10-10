'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'admin-quick-actions'

const AdminQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <nav className={baseClass} aria-labelledby="quick-actions-nav-heading">
      <button
        type="button"
        className={`${baseClass}__heading`}
        id="quick-actions-nav-heading"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Quick actions
        <svg
          className={`${baseClass}__chevron`}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="currentColor" />
        </svg>
      </button>
      {isOpen && (
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
      )}
    </nav>
  )
}

export default AdminQuickActions
