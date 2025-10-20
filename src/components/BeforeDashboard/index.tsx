'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const { user } = useAuth()
  const displayName = (user as { name?: string; email?: string })?.name || user?.email
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
            <div className={`${baseClass}__tileTitle`}>Create a new Post</div>
            <div className={`${baseClass}__tileDesc`}>Publish a story in minutes</div>
          </Link>
          <Link className={`${baseClass}__tile`} href="/admin/collections/pages/create">
            <div className={`${baseClass}__tileTitle`}>Create a new Page</div>
            <div className={`${baseClass}__tileDesc`}>Add static pages like About</div>
          </Link>
          <Link className={`${baseClass}__tile`} href="/admin/collections/media">
            <div className={`${baseClass}__tileTitle`}>Manage Media</div>
            <div className={`${baseClass}__tileDesc`}>Upload and organize assets</div>
          </Link>
          <a className={`${baseClass}__tile`} href="/" target="_blank" rel="noopener noreferrer">
            <div className={`${baseClass}__tileTitle`}>View Site</div>
            <div className={`${baseClass}__tileDesc`}>Open the public website</div>
          </a>
        </div>
      </section>
    </div>
  )
}

export default BeforeDashboard
