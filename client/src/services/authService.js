// authService.js
// Small client-side auth service that attempts to call a backend endpoint
// and falls back to localStorage-based authentication for development/demo use.

// Try server login first, then fallback to localStorage users when the server
// is not available (or returns an error). This keeps behavior consistent
// for local development without a running backend.

export async function login(identifier, password) {
  // Normalize identifier for local fallback search
  const id = (identifier || '').toString().trim()

  // First, attempt to call the server API. If the server is available
  // and returns success, we return its response directly.
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: id, password }),
    })

    // If server responded with non-2xx, try to parse the message and throw
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Login failed')
    }

    // Successful server login — return the parsed JSON (id/username/email)
    return await res.json()
  } catch (err) {
    // Server isn't available or returned an error — fall back to localStorage.
    // This keeps the app usable for demo or offline development.
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find(u => {
      const uname = (u.username || '').toString().toLowerCase()
      const mail = (u.email || '').toString().toLowerCase()
      return (uname === id.toLowerCase() || mail === id.toLowerCase()) && u.password === password
    })

    if (found) return found
    // If nothing matched, surface a consistent error message
    throw new Error('Invalid username/email or password')
  }
}

export async function register(username, email, password) {
  const body = { username, email, password };
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Registration failed");
    }

    return await res.json();
  } catch (err) {
    // Fallback to localStorage-based users for dev/offline scenarios
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const exists = users.find(
      (u) =>
        (u.username || "").toString().toLowerCase() === (username || "").toString().toLowerCase() ||
        (u.email || "").toString().toLowerCase() === (email || "").toString().toLowerCase()
    );
    if (exists) {
      throw new Error("User with that username or email already exists");
    }

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
  }
}
