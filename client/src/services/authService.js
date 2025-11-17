// authService.js
// Small client-side auth service that attempts to call a backend endpoint
// and falls back to localStorage-based authentication for development/demo use.

// Try server login first, then fallback to localStorage users when the server
// is not available (or returns an error). This keeps behavior consistent
// for local development without a running backend.

const API = "http://localhost:4000/api/auth";

export const register = async (username, email, password) => {
  const body = { username, email, password };
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
  } catch (err) {
    // fallback to localStorage for development/offline
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find(
      (u) =>
        (u.username || "").toString().toLowerCase() === (username || "").toString().toLowerCase() ||
        (u.email || "").toString().toLowerCase() === (email || "").toString().toLowerCase()
    );
    if (exists) throw new Error("User with that username or email already exists");

    const newUser = { username, email, password, dateJoined: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
  }
};

export const login = async (username, password) => {
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  } catch (err) {
    // localStorage fallback
    const id = (username || "").toString().toLowerCase();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find(
      (u) => ((u.username || "").toLowerCase() === id || (u.email || "").toLowerCase() === id) && u.password === password
    );
    if (found) {
      // Add dateJoined if it doesn't exist (for backward compatibility)
      if (!found.dateJoined) {
        found.dateJoined = new Date().toISOString();
      }
      return found;
    }
    throw new Error("Invalid username/email or password");
  }
};

export const logout = async () => {
  try {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
  } catch (err) {
    // no-op for local fallback
    return;
  }
};

export const getMe = async () => {
  try {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    return await res.json();
  } catch (err) {
    // fallback: return the currentUser from localStorage if present
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    return user;
  }
};
