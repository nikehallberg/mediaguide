import './Login.css'
import person from '../../assets/person.png'
import password from '../../assets/password.png'
import { useState } from 'react'


// Login component handles user login logic and UI
const Login = ({ onLogin }) => {
  // State for form fields
  const [username, setUsername] = useState("")
  const [passwordVal, setPasswordVal] = useState("")
  // State for error and success messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handles login form submission
  const handleLogin = (e) => {
    e.preventDefault()
    // Retrieve users from localStorage or initialize as empty array
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    // Find user with matching username and password
    const user = users.find(u => u.username === username && u.password === passwordVal)
    if (user) {
      // Successful login
      setSuccess("Login successful!")
      setError("")
      if (onLogin) onLogin(username)
    } else {
      // Invalid credentials
      setError("Invalid username or password")
      setSuccess("")
    }
  }

  // Render login form
  return (
    <div className='login-container'>
      {/* Title */}
      <p>Login</p>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login