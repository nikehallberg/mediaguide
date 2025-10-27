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