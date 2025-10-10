'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import { SeedButton } from './SeedButton'
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
        <h4>Welcome {displayName} to the Eutopias admin</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' with a few pages, posts, and projects to jump-start your new site, then '}
          <a href="/" target="_blank">
            visit your website
          </a>
          {' to see the results.'}
        </li>
        <li>
          If you created this repo using Payload Cloud, head over to GitHub and clone it to your
          local machine. It will be under the <i>GitHub Scope</i> that you selected when creating
          this project.
        </li>
        <li>
          {'Modify your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' and add more '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, we also recommend you check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
        <li>
          Commit and push your changes to the repository to trigger a redeployment of your project.
        </li>
      </ul>
      <section className={`${baseClass}__quick-menu`} aria-labelledby="quick-actions-heading">
        <h5 id="quick-actions-heading" className={`${baseClass}__heading`}>
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
      {'Pro Tip: This block is a '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        custom component
      </a>
      , you can remove it at any time by updating your <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard
