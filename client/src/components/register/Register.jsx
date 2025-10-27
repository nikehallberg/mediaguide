import "./Register.css";
import person from "../../assets/person.png";
import email from "../../assets/email.png";
import password from "../../assets/password.png";
import { useState } from "react";
import { register } from "../../services/authService";

const Register = () => {
  const [username, setUsername] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await register(username, emailVal, passwordVal);
      setSuccess("Registration successful! You can now log in.");
      setUsername("");
      setEmailVal("");
      setPasswordVal("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <p>Register</p>
      <form onSubmit={handleRegister}>
        <div className="user-input">
          <img src={person} alt="person" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="user-input">
          <img src={email} alt="email" />
          <input
            type="email"
            placeholder="Email"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
          />
        </div>
        <div className="user-input">
          <img src={password} alt="password" />
          <input
            type="password"
            placeholder="Password"
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        {success && <div style={{ color: "green" }}>{success}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;