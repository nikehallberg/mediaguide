import './Register.css'
import person from '../../assets/person.png'
import email from '../../assets/email.png'
import password from '../../assets/password.png'
import { useState } from 'react'


// Register component handles user registration logic and UI
const Register = () => {
  // State for form fields
  const [username, setUsername] = useState("")
  const [emailVal, setEmailVal] = useState("")
  const [passwordVal, setPasswordVal] = useState("")
  // State for error and success messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handles registration form submission
  const handleRegister = (e) => {
    e.preventDefault()
    // Validate that all fields are filled
    if (!username || !emailVal || !passwordVal) {
      setError("Please fill all fields")
      setSuccess("")
      return
    }
    // Retrieve users from localStorage or initialize as empty array
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    // Check if username already exists
    if (users.find(u => u.username === username)) {
      setError("Username already exists")
      setSuccess("")
      return
    }
    // Add new user to users array
    users.push({ username, email: emailVal, password: passwordVal })
    // Save updated users array to localStorage
    localStorage.setItem("users", JSON.stringify(users))
    // Show success message and clear form fields
    setSuccess("Registration successful! You can now log in.")
    setError("")
    setUsername("")
    setEmailVal("")
    setPasswordVal("")
  }

  // Render registration form
  return (
    <div className='register-container'>
      {/* Title */}
      <p>Register</p>
      <form onSubmit={handleRegister}>
        {/* Username input */}
        <div className='user-input'>
          <img src={person} alt="person"/>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        {/* Email input */}
        <div className='user-input'>
          <img src={email} alt="email"/>
          <input
            type='email'
            placeholder='Email'
            value={emailVal}
            onChange={e => setEmailVal(e.target.value)}
          />
        </div>
        {/* Password input */}
        <div className='user-input'>
          <img src={password} alt="password"/>
          <input
            type='password'
            placeholder='Password'
            value={passwordVal}
            onChange={e => setPasswordVal(e.target.value)}
          />
        </div>
        {/* Error and success messages */}
        {error && <div style={{color:"red"}}>{error}</div>}
        {success && <div style={{color:"green"}}>{success}</div>}
        {/* Submit button */}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register