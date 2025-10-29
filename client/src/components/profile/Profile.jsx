import React from "react";
import "./Profile.css";
import "../shared/MediaShared.css";
 
const Profile = ({ user }) => {
  if (!user) {
    return (
      <div className='profile-container'>
        <h1 className='profile-title'>Please log in to view your profile</h1>
      </div>
    );
  }
 
  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
 
  return (
    <div className='profile-container'>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div className='profile-avatar' aria-hidden>
          {initials}
        </div>
        <h1 className='profile-title'>User Profile</h1>
      </div>
 
      <div className='profile-info'>
        <div className='profile-info-item'>
          <span className='label'>Username:</span>
          <span className='value'>{user.username}</span>
        </div>
        <div className='profile-info-item'>
          <span className='label'>Email:</span>
          <span className='value'>{user.email}</span>
        </div>
        <div className='profile-info-item'>
          <span className='label'>User ID:</span>
          <span className='value'>{user._id}</span>
        </div>
      </div>
    </div>
  );
};
 
export default Profile;
 

// import React, { useState, useEffect } from 'react'
// import './Profile.css'
// import "../shared/MediaShared.css"

// const Profile = () => {
//   // simple data for now — replace with props or context when available
//   // try to load a saved user from localStorage (key: currentUser), fall back to defaults
//   const saved = JSON.parse(localStorage.getItem('currentUser') || 'null')
//   const initialUser = saved || {
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     joined: 'January 1, 2020',
//   }

//   const [user, setUser] = useState(initialUser)
//   const [editing, setEditing] = useState(false)
//   const [form, setForm] = useState({ name: user.name, email: user.email })
//   const [message, setMessage] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })

//   useEffect(() => {
//     // keep form in sync if user changes externally
//     setForm({ name: user.name, email: user.email })
//   }, [user.name, user.email])

//   const initials = (user.name || '').split(' ').map(n => n[0] || '').join('').slice(0,2).toUpperCase()

//   const handleChange = (e) => {
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
//   }

//   const handleSave = (e) => {
//     e.preventDefault()
//     // simple validation
//     if (!form.name.trim() || !form.email.trim()) {
//       setMessage('Name and email are required')
//       return
//     }

//     // validate basic email format
//     const emailVal = form.email.trim()
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     if (!emailRegex.test(emailVal)) {
//       setMessage('Please enter a valid email address')
//       return
//     }

//     const updated = { ...user, name: form.name.trim(), email: emailVal }
//     setUser(updated)
//     localStorage.setItem('currentUser', JSON.stringify(updated))
//     setEditing(false)
//     setMessage('Profile saved')
//     setTimeout(() => setMessage(''), 2500)
//   }

//   const handleCancel = () => {
//     setForm({ name: user.name, email: user.email })
//     setEditing(false)
//     setMessage('')
//   }

//   const handlePwChange = (e) => {
//     setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
//   }

//   const handlePwSave = (e) => {
//     e.preventDefault()
//     setMessage('')
//     const { current, new: newPw, confirm } = pwForm
//     if (!newPw || newPw.length < 6) {
//       setMessage('New password must be at least 6 characters')
//       return
//     }
//     if (newPw !== confirm) {
//       setMessage('New passwords do not match')
//       return
//     }

//     // Try to update users array if it exists (used by Register)
//     const usersRaw = localStorage.getItem('users')
//     if (usersRaw) {
//       try {
//         const users = JSON.parse(usersRaw)
//         // find user by email
//         const idx = users.findIndex(u => u.email === user.email)
//         if (idx > -1) {
//           // if a stored password exists, require current to match
//           if (users[idx].password && users[idx].password !== current) {
//             setMessage('Current password is incorrect')
//             return
//           }
//           users[idx].password = newPw
//           localStorage.setItem('users', JSON.stringify(users))
//         }
//       } catch (err) {
//         // ignore parse errors
//       }
//     }

//     // also store on currentUser object
//     const saved = JSON.parse(localStorage.getItem('currentUser') || 'null')
//     const updated = { ...(saved || user), password: newPw }
//     localStorage.setItem('currentUser', JSON.stringify(updated))
//     setPwForm({ current: '', new: '', confirm: '' })
//     setShowPassword(false)
//     setMessage('Password updated')
//     setTimeout(() => setMessage(''), 2500)
//   }

//   return (
//     <div className="profile-container">
//       <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'}}>
//         <div className="profile-avatar" aria-hidden>{initials}</div>
//         <h1 className="profile-title">User Profile</h1>
//         <button className="edit-btn" onClick={() => setEditing(true)}>Edit profile</button>
//       </div>

//       <div className="profile-info">
//         {editing ? (
//           <form className="edit-form" onSubmit={handleSave}>
//               <input className="edit-input" name="name" value={form.name} onChange={handleChange} placeholder="Name" />
//               <input className="edit-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
//             <div className="edit-actions">
//               <button type="submit">Save</button>
//               <button type="button" onClick={handleCancel}>Cancel</button>
//             </div>
//             {message && <div style={{marginTop: '0.5rem', color: message.includes('saved') || message.includes('updated') ? 'green' : 'red'}}>{message}</div>}
//           </form>
//         ) : (
//           <>
//             <div className="profile-info-item"><span className="label">Name:</span> <span className="value">{user.name}</span></div>
//             <div className="profile-info-item"><span className="label">Email:</span> <span className="value">{user.email}</span></div>
//             <div className="profile-info-item"><span className="label">Joined:</span> <span className="value">{user.joined}</span></div>
//             <div style={{marginTop: '0.5rem'}}>
//               <button className="edit-btn" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Close password' : 'Change password'}</button>
//             </div>
//             {showPassword && (
//               <form className="edit-form" onSubmit={handlePwSave} style={{marginTop: '0.75rem'}}>
//                 <input className="edit-input" name="current" value={pwForm.current} onChange={handlePwChange} placeholder="Current password" type="password" />
//                 <input className="edit-input" name="new" value={pwForm.new} onChange={handlePwChange} placeholder="New password" type="password" />
//                 <input className="edit-input" name="confirm" value={pwForm.confirm} onChange={handlePwChange} placeholder="Confirm new password" type="password" />
//                 <div className="edit-actions">
//                   <button type="submit">Save password</button>
//                   <button type="button" onClick={() => { setShowPassword(false); setPwForm({ current: '', new: '', confirm: '' }); setMessage('') }}>Cancel</button>
//                 </div>
//                 {message && <div style={{marginTop: '0.5rem', color: message.includes('updated') ? 'green' : 'red'}}>{message}</div>}
//               </form>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Profile