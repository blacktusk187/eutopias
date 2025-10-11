'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const { user } = useAuth()

  const displayName =
    (user as { name?: string; email?: string } | undefined)?.name ||
    (user as { name?: string; email?: string } | undefined)?.email ||
    'there'

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>
          Welcome <span className={`${baseClass}__userName`}>{displayName}</span> to the Eutopias
          admin
        </h4>
      </Banner>
      <section className={`${baseClass}__quick-menu`} aria-labelledby="quick-actions-heading">
        <h5 id="quick-actions-heading" className={`${baseClass}__heading dashboard_label`}>
          Quick actions
        </h5>
        <div className={`${baseClass}__tiles`}>
          <Link className={`${baseClass}__tile`} href="/admin/collections/posts/create">
            <span className={`${baseClass}__tileTitle`}>Create a new Post</span>
            <span className={`${baseClass}__tileDesc`}>Publish a story in minutes</span>
          </Link>
          <Link className={`${baseClass}__tile`} href="/admin/collections/pages/create">
            <span className={`${baseClass}__tileTitle`}>Create a new Page</span>
            <span className={`${baseClass}__tileDesc`}>Add static pages like About</span>
          </Link>
          <Link className={`${baseClass}__tile`} href="/admin/collections/media">
            <span className={`${baseClass}__tileTitle`}>Manage Media</span>
            <span className={`${baseClass}__tileDesc`}>Upload and organize assets</span>
          </Link>
          <a className={`${baseClass}__tile`} href="/" target="_blank" rel="noopener noreferrer">
            <span className={`${baseClass}__tileTitle`}>View Site</span>
            <span className={`${baseClass}__tileDesc`}>Open the public website</span>
          </a>
        </div>
      </section>
    </div>
  )
}

export default BeforeDashboard
