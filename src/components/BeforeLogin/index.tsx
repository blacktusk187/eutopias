import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Welcome to Eutopias Admin</b>
        {' — sign in to manage content and settings.'}
      </p>
      <ul>
        <li>
          <a href="/" target="_blank" rel="noopener noreferrer">
            View site
          </a>
        </li>
        <li>
          <a href="https://payloadcms.com/docs" target="_blank" rel="noopener noreferrer">
            Payload docs
          </a>
        </li>
      </ul>
    </div>
  )
}

export default BeforeLogin
