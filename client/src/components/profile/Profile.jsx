import React, { useEffect, useState } from "react";
import "./Profile.css";
import "../shared/MediaShared.css";
import ReviewList from "../reviews/ReviewList";
import WatchlistPanel from "../watchList/WatchlistPanel";

const Profile = () => {
  const [user, setUser] = useState({ username: "", email: "", dateJoined: null, _id: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [watchOpen, setWatchOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [watchlistPreview, setWatchlistPreview] = useState(null);
  const [reviewPreview, setReviewPreview] = useState(null);
  const [loadingPreviews, setLoadingPreviews] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProfile(true);
      try {
        // backend provides /api/auth/me
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!mounted) return;
        if (!res.ok) {
          const username = localStorage.getItem("loggedInUser") || "";
          setUser({ username, email: "", dateJoined: null, _id: "" });
          setLoadingProfile(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        // backend returns { user }
        const u = data.user || data || {};
        setUser({
          username: u.username || u.name || localStorage.getItem("loggedInUser") || "",
          email: u.email || "",
          dateJoined: u.dateJoined || null,
          _id: u._id || ""
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        const username = localStorage.getItem("loggedInUser") || "";
        setUser({ username, email: "", dateJoined: null, _id: "" });
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load preview data
  const loadPreviews = async () => {
    if (!user._id) return; // Only load if user is authenticated
    
    try {
      // Load watchlist preview (first item)
      const watchRes = await fetch("/api/watchlist", { credentials: "include" });
      if (watchRes.ok) {
        const watchData = await watchRes.json();
        const items = watchData.items || [];
        if (items.length > 0) {
          setWatchlistPreview(items[0]);
        }
      }
      
      // Load reviews preview (first item)
      const reviewRes = await fetch("/api/reviews", { credentials: "include" });
      if (reviewRes.ok) {
        const reviewData = await reviewRes.json();
        const reviews = reviewData.reviews || [];
        if (reviews.length > 0) {
          setReviewPreview(reviews[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load previews", err);
    } finally {
      setLoadingPreviews(false);
    }
  };

  // Load previews when user data is available
  useEffect(() => {
    if (user._id && !loadingProfile) {
      loadPreviews();
    }
  }, [user._id, loadingProfile]);

  // Calculate membership duration
  const getMembershipDuration = (dateJoined) => {
    if (!dateJoined) return null;
    const joinDate = new Date(dateJoined);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
      return `${years}y ${remainingMonths}m`;
    }
  };

  const membershipDuration = getMembershipDuration(user.dateJoined);

  const initials = user.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Implemented but minimal callbacks
  const onWatchItemRemoved = ({ id, key }) => {
    // could refresh counts or UI if you keep them in Profile
    console.debug("onWatchItemRemoved", id, key);
    // Refresh preview to show updated state
    if (user._id) {
      loadPreviews();
    }
  };
  const onReviewRemoved = (id) => {
    console.debug("onReviewRemoved", id);
    // Refresh preview to show updated state
    if (user._id) {
      loadPreviews();
    }
  };

  if (!user.username && !loadingProfile) {
    return (
      <div className='profile-container'>
        <h1 className='profile-title'>Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className='profile-root'>
      <div className='profile-grid'>
        <div className='profile-info box'>
          <div className='profile-header'>
            <div className='profile-avatar' aria-hidden>
              {initials}
            </div>
            <h2>User Profile</h2>
          </div>
          {loadingProfile ? (
            <div className='profile-loading'>Loading profile…</div>
          ) : (
            <div className='profile-details'>
              <div className='profile-info-item'>
                <span className='label'>Username:</span>
                <span className='value'>{user.username}</span>
              </div>
              {user.email && (
                <div className='profile-info-item'>
                  <span className='label'>Email:</span>
                  <span className='value'>{user.email}</span>
                </div>
              )}
              {user.dateJoined && (
                <div className='profile-info-item date-joined'>
                  <span className='label'>Date Joined:</span>
                  <span className='value'>
                    {new Date(user.dateJoined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {membershipDuration && (
                      <span className='member-badge'>
                        📅 {membershipDuration}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {user._id && (
                <div className='profile-info-item'>
                  <span className='label'>User ID:</span>
                  <span className='value'>{user._id}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='profile-side'>
          <div className='box watchlist-box'>
            <div className='box-header'>
              <h3>Watchlist</h3>
              <button
                className='show-more-btn'
                onClick={() => setWatchOpen(true)}
              >
                Open
              </button>
            </div>
            <div className='box-body'>
              {loadingPreviews ? (
                <p>Loading preview...</p>
              ) : watchlistPreview ? (
                <div className='preview-item'>
                  <div className='preview-title'>{watchlistPreview.itemTitle}</div>
                  <div className='preview-type'>{watchlistPreview.itemType}</div>
                  <div className='preview-date'>
                    Added {new Date(watchlistPreview.dateAdded).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p>No items in your watchlist yet.</p>
              )}
            </div>
          </div>

          <div className='box reviews-box'>
            <div className='box-header'>
              <h3>Reviews</h3>
              <button
                className='show-more-btn'
                onClick={() => setReviewsOpen(true)}
              >
                Open
              </button>
            </div>
            <div className='box-body'>
              {loadingPreviews ? (
                <p>Loading preview...</p>
              ) : reviewPreview ? (
                <div className='preview-item'>
                  <div className='preview-title'>{reviewPreview.itemTitle}</div>
                  <div className='preview-rating'>
                    {'★'.repeat(Math.floor(reviewPreview.rating || 0))}{'☆'.repeat(5 - Math.floor(reviewPreview.rating || 0))}
                    <span className='rating-number'>({reviewPreview.rating}/5)</span>
                  </div>
                  <div className='preview-text'>
                    {reviewPreview.reviewText && reviewPreview.reviewText.length > 50
                      ? reviewPreview.reviewText.substring(0, 50) + '...'
                      : reviewPreview.reviewText || 'No review text'
                    }
                  </div>
                  <div className='preview-date'>
                    {new Date(reviewPreview.dateCreated).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p>No reviews written yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <WatchlistPanel
        open={watchOpen}
        onClose={() => setWatchOpen(false)}
        onRemoved={onWatchItemRemoved}
      />

      {reviewsOpen && (
        <div className='review-modal' onClick={() => setReviewsOpen(false)}>
          <div className='review-panel' onClick={(e) => e.stopPropagation()}>
            <h3>Your Reviews</h3>
            <ReviewList onDeleted={onReviewRemoved} />
            <div className='review-actions'>
              <button
                className='show-more-btn'
                onClick={() => setReviewsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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