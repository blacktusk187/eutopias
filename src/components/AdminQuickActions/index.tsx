'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'admin-quick-actions'

const AdminQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <nav className={`${baseClass} nav-group`} aria-labelledby="quick-actions-nav-heading">
      <button
        type="button"
        className="nav-group__label flex items-center justify-between w-full"
        id="quick-actions-nav-heading"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>Quick actions</span>
        <svg
          className="icon icon--chevron nav-group__indicator"
          viewBox="0 0 20 20"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
          focusable="false"
        >
          <path className="stroke" d="M14 8L10 12L6 8" strokeLinecap="square" />
        </svg>
      </button>
      {isOpen && (
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
      )}
    </nav>
  )
}

export default AdminQuickActions
