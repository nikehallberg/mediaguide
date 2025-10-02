import { NavLink } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../assets/logo.png";
import { useState, useRef, useEffect } from "react";
import Login from "../login/Login";
import Register from "../register/Register";

const Navbar = ({ user, onLogout, onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close burger menu when clicking outside or resizing
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 900 && menuOpen) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogin(false);
        setShowRegister(false);
      }
    }
    if (showLogin || showRegister) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogin, showRegister]);

  return (
    <nav>
      <div className="navbar-header">
        <NavLink to="/">
          <img className="logo" src={Logo} alt="" />
        </NavLink>
        <div className={`burger-menu${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen((open) => !open)}>
          <div className={`bar${menuOpen ? " open" : ""}`}></div>
          <div className={`bar${menuOpen ? " open" : ""}`}></div>
          <div className={`bar${menuOpen ? " open" : ""}`}></div>
          {/* Nav links inside burger menu for mobile */}
          <ul className={menuOpen ? "nav-open" : ""}>
            <li>
              <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/books" onClick={() => setMenuOpen(false)}>Books</NavLink>
            </li>
            <li>
              <NavLink to="/movies" onClick={() => setMenuOpen(false)}>Movies</NavLink>
            </li>
            <li>
              <NavLink to="/shows" onClick={() => setMenuOpen(false)}>Shows</NavLink>
            </li>
            <li>
              <NavLink to="/songs" onClick={() => setMenuOpen(false)}>Songs</NavLink>
            </li>
          </ul>
        </div>
        <div className="auth-links" style={{ position: "relative" }}>
          {user ? (
            <>
              <span className="auth-link" style={{ cursor: "default" }}>Hello, {user}</span>
              <button className="auth-link" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="auth-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setShowLogin((v) => !v);
                  setShowRegister(false);
                  setMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                className="auth-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setShowRegister((v) => !v);
                  setShowLogin(false);
                  setMenuOpen(false);
                }}
              >
                Register
              </button>
              {(showLogin || showRegister) && (
                <div ref={dropdownRef} className="login-dropdown">
                  {showLogin && (
                    <Login onLogin={(username) => { onLogin(username); setShowLogin(false); }} />
                  )}
                  {showRegister && (
                    <Register />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Desktop nav links */}
      <ul className="desktop-nav">
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/books">Books</NavLink>
        </li>
        <li>
          <NavLink to="/movies">Movies</NavLink>
        </li>
        <li>
          <NavLink to="/shows">Shows</NavLink>
        </li>
        <li>
          <NavLink to="/songs">Songs</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;