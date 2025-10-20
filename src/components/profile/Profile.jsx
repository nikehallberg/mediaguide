import React from 'react'
import './Profile.css'
import "../shared/MediaShared.css"

const Profile = () => {
  // simple data for now — replace with props or context when available
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joined: 'January 1, 2020',
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="profile-container">
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'}}>
        <div className="profile-avatar" aria-hidden>{initials}</div>
        <h1 className="profile-title">User Profile</h1>
      </div>

      <div className="profile-info">
        <div className="profile-info-item"><span className="label">Name:</span> <span className="value">{user.name}</span></div>
        <div className="profile-info-item"><span className="label">Email:</span> <span className="value">{user.email}</span></div>
        <div className="profile-info-item"><span className="label">Joined:</span> <span className="value">{user.joined}</span></div>
      </div>
    </div>
  )
}

export default Profile