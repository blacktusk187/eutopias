import React from 'react'
import './index.scss'

const BeforeLogin: React.FC = () => {
  return (
    <div className="before-login">
      <p>
        <b>Welcome to Eutopias Admin</b>
        {' — sign in to manage content and settings.'}
      </p>
    </div>
  )
}

export default BeforeLogin
