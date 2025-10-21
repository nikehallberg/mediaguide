import { NavLink } from "react-router-dom";
import "./Navbar.css";
import Logo from "../../assets/logo.png";
import Logo3 from "../../assets/logo3.png";
import { useState, useRef, useEffect } from "react";
import Login from "../login/Login";
import Register from "../register/Register";

const Navbar = ({ user, onLogout, onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark-theme");
        setIsDark(true);
      } else if (stored === "light") {
        document.documentElement.classList.remove("dark-theme");
        setIsDark(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark-theme");
        setIsDark(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

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
          <img className="logo" src={isDark ? Logo3 : Logo} alt="Media Guide logo" />
        </NavLink>
        {/* Theme toggle button */}
        <button
          className="theme-toggle"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
          onClick={() => {
            const newDark = document.documentElement.classList.toggle("dark-theme");
            setIsDark(newDark);
            try { localStorage.setItem("theme", newDark ? "dark" : "light"); } catch(e) {}
          }}
        >
          {/* show sun for light mode, moon for dark mode */}
          {isDark ? (
            <svg className="theme-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="theme-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 4.5V2m0 20v-2.5M4.5 12H2m20 0h-2.5M5.6 5.6L4 4m16 16l-1.6-1.6M18.4 5.6L20 4M4 20l1.6-1.6M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
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
            <li>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
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
        <li>
          <NavLink to="/profile">Profile</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;