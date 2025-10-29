import "./Login.css";
import person from "../../assets/person.png";
import password from "../../assets/password.png";
import { useState } from "react";
import { login } from "../../services/authService";
 
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
 
    try {
      const user = await login(username, passwordVal);
      setSuccess("Login successful!");
      if (onLogin) onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  };
 
  return (
    <div className='login-container'>
      <p>Login</p>
      <form onSubmit={handleLogin}>
        <div className='user-input'>
          <img src={person} alt='person' />
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className='user-input'>
          <img src={password} alt='password' />
          <input
            type='password'
            placeholder='Password'
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}
        <button type='submit'>Login</button>
      </form>
    </div>
  );
};
 
export default Login;