import './Login.css'
import person from '../../assets/person.png'
import password from '../../assets/password.png'
import { useState } from 'react'
import { login } from '../../services/authService'

// Login component handles user login logic and UI
const Login = ({ onLogin }) => {
  // State for form fields
  // `identifier` accepts either username or email
  const [identifier, setIdentifier] = useState("")
  const [passwordVal, setPasswordVal] = useState("")
  // State for error and success messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  // Forgot-password states
  const [showForgot, setShowForgot] = useState(false)
  const [forgotIdentifier, setForgotIdentifier] = useState("")
  const [forgotFound, setForgotFound] = useState(null)
  const [forgotMsg, setForgotMsg] = useState("")
  const [forgotNew, setForgotNew] = useState("")
  const [forgotConfirm, setForgotConfirm] = useState("")

  // Handles login form submission. Uses the centralized auth service which
  // will try a backend call and fall back to localStorage-based auth when
  // no server is available (good for demos and local dev).
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const id = (identifier || "").trim()
    const pw = passwordVal || ""
    if (!id || !pw) {
      setError("Please enter username/email and password")
      return
    }

    try {
      // login will either return a user object or throw an Error
      const user = await login(id, pw)
      setSuccess("Login successful!")
      setError("")
      try { localStorage.setItem('currentUser', JSON.stringify(user)) } catch (err) { /* ignore */ }
      if (onLogin) onLogin(user.username || user.email || user.id)
    } catch (err) {
      setError(err.message || 'Login failed')
      setSuccess("")
    }
  }

  const handleFindAccount = (e) => {
    e && e.preventDefault()
    setForgotMsg("")
    const id = (forgotIdentifier || "").trim().toLowerCase()
    if (!id) {
      setForgotMsg('Enter username or email')
      return
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => {
      const uname = (u.username || '').toString().toLowerCase()
      const mail = (u.email || '').toString().toLowerCase()
      return uname === id || mail === id
    })
    if (user) {
      setForgotFound(user)
      setForgotMsg('Account found — enter a new password')
    } else {
      setForgotFound(null)
      setForgotMsg('Account not found')
    }
  }

  const handleResetPassword = (e) => {
    e && e.preventDefault()
    setForgotMsg('')
    if (!forgotNew || forgotNew.length < 6) {
      setForgotMsg('New password must be at least 6 characters')
      return
    }
    if (forgotNew !== forgotConfirm) {
      setForgotMsg('Passwords do not match')
      return
    }

    // update users array if present
    const usersRaw = localStorage.getItem('users')
    if (usersRaw) {
      try {
        const users = JSON.parse(usersRaw)
        const idx = users.findIndex(u => (u.username === forgotFound.username) || (u.email === forgotFound.email))
        if (idx > -1) {
          users[idx].password = forgotNew
          localStorage.setItem('users', JSON.stringify(users))
        }
      } catch (err) {
        // ignore
      }
    }

    // update currentUser as well
    const saved = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const updated = { ...(saved || {}), password: forgotNew }
    localStorage.setItem('currentUser', JSON.stringify(updated))

    setForgotMsg('Password has been reset')
    // clear and close after a short moment
    setTimeout(() => {
      setShowForgot(false)
      setForgotIdentifier('')
      setForgotFound(null)
      setForgotNew('')
      setForgotConfirm('')
      setForgotMsg('')
    }, 1400)
  }

  // Render login form
  return (
    <div className='login-container'>
      <p>Login</p>
      <form onSubmit={handleLogin}>
        <div className='user-input'>
          <img src={person} alt="person"/>
          <input
            type='text'
            placeholder='Username or email'
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          />
        </div>
        <div className='user-input'>
          <img src={password} alt="password"/>
          <input
            type='password'
            placeholder='Password'
            value={passwordVal}
            onChange={e => setPasswordVal(e.target.value)}
          />
        </div>
        {error && <div style={{color:"red"}}>{error}</div>}
        {success && <div style={{color:"green"}}>{success}</div>}
        <button type="submit">Login</button>
        <div style={{marginTop: '0.5rem'}}>
          <button type="button" className="forgot-link" onClick={() => { setShowForgot(s => !s); setForgotMsg(''); setForgotFound(null) }} style={{background: 'transparent', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0}}>Forgot password?</button>
        </div>
      </form>

      {showForgot && (
        <div style={{marginTop: '0.75rem'}}>
          {!forgotFound ? (
            <form onSubmit={handleFindAccount} className="forgot-form">
              <div className='user-input'>
                <img src={person} alt="person"/>
                <input
                  type='text'
                  placeholder='Enter username or email'
                  value={forgotIdentifier}
                  onChange={e => setForgotIdentifier(e.target.value)}
                />
              </div>
              <div style={{display: 'flex', gap: '.5rem', marginTop: '.5rem'}}>
                <button type="submit">Find account</button>
                <button type="button" onClick={() => { setShowForgot(false); setForgotIdentifier(''); setForgotMsg('') }}>Cancel</button>
              </div>
              {forgotMsg && <div style={{marginTop: '0.5rem', color: forgotMsg.includes('found') ? 'green' : 'red'}}>{forgotMsg}</div>}
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-form">
              <div style={{marginBottom: '.25rem'}}>Resetting password for <strong>{forgotFound.username || forgotFound.email}</strong></div>
              <div className='user-input'>
                <img src={password} alt="password"/>
                <input type="password" placeholder="New password" value={forgotNew} onChange={e => setForgotNew(e.target.value)} />
              </div>
              <div className='user-input'>
                <img src={password} alt="password"/>
                <input type="password" placeholder="Confirm new password" value={forgotConfirm} onChange={e => setForgotConfirm(e.target.value)} />
              </div>
              <div style={{display: 'flex', gap: '.5rem', marginTop: '.5rem'}}>
                <button type="submit">Set new password</button>
                <button type="button" onClick={() => { setForgotFound(null); setForgotNew(''); setForgotConfirm(''); setForgotMsg('') }}>Back</button>
              </div>
              {forgotMsg && <div style={{marginTop: '0.5rem', color: forgotMsg.includes('reset') ? 'green' : 'red'}}>{forgotMsg}</div>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default Login