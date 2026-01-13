// authService.js
// Small client-side auth service that attempts to call a backend endpoint
// and falls back to localStorage-based authentication for development/demo use.

// Try server login first, then fallback to localStorage users when the server
// is not available (or returns an error). This keeps behavior consistent
// for local development without a running backend.

const API = "http://localhost:4000/api/auth";

// Activity tracking for 30-minute timeout
const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

// Update last activity timestamp
const updateActivity = () => {
  localStorage.setItem('lastActivity', Date.now().toString());
};

// Check if session has expired (30 minutes of inactivity)
const isSessionExpired = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) return true;
  
  const timeSinceActivity = Date.now() - parseInt(lastActivity);
  return timeSinceActivity > THIRTY_MINUTES;
};

// Helper function to handle logout on token expiration
const handleTokenExpiration = async () => {
  // Clear all local auth data
  localStorage.removeItem('lastActivity');
  localStorage.removeItem('currentUser');
  
  // Try to logout from server as well
  try {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
  } catch (err) {
    // Ignore server errors during cleanup
  }
  
  // Dispatch expiration event to notify the app
  window.dispatchEvent(new CustomEvent('auth-expired'));
};

// Universal helper to check for 401 responses and handle token expiration
export const checkAuthResponse = async (response) => {
  if (response && response.status === 401) {
    await handleTokenExpiration();
    return true; // Indicates token was expired
  }
  return false; // Token is still valid
};

// Enhanced fetch wrapper that automatically handles auth failures
export const authFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options
    });
    
    // Check if token expired and handle automatically
    await checkAuthResponse(response);
    
    return response;
  } catch (error) {
    // Re-throw network errors
    throw error;
  }
};

// Set up activity listeners to track user interaction
const setupActivityTracking = () => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const activityHandler = () => {
    updateActivity();
  };
  
  // Add event listeners for user activity
  events.forEach(event => {
    document.addEventListener(event, activityHandler, true);
  });
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, activityHandler, true);
    });
  };
};

// Initialize activity tracking when module loads
if (typeof window !== 'undefined') {
  setupActivityTracking();
  updateActivity(); // Set initial activity timestamp
}

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
    
    // Update activity on successful registration
    updateActivity();
    
    // Dispatch custom event to notify components that user registered/logged in
    window.dispatchEvent(new CustomEvent('auth-register', { detail: data }));
    
    // Refresh the page after successful registration
    setTimeout(() => {
      window.location.reload();
    }, 100); // Small delay to allow event handlers to process
    
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
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
    // Update activity on successful registration
    updateActivity();
    
    // Dispatch custom event for localStorage registration
    window.dispatchEvent(new CustomEvent('auth-register', { detail: newUser }));
    
    // Refresh the page after successful registration
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
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
    
    // Update activity on successful login
    updateActivity();
    
    // Dispatch custom event to notify components that user logged in
    window.dispatchEvent(new CustomEvent('auth-login', { detail: data }));
    
    // Refresh the page after successful login
    setTimeout(() => {
      window.location.reload();
    }, 100); // Small delay to allow event handlers to process
    
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
      
      // Store current user in localStorage for persistence
      localStorage.setItem("currentUser", JSON.stringify(found));
      
      // Update activity on successful login
      updateActivity();
      
      // Dispatch custom event for localStorage login
      window.dispatchEvent(new CustomEvent('auth-login', { detail: found }));
      
      // Refresh the page after successful login
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return found;
    }
    throw new Error("Invalid username/email or password");
  }
};

export const logout = async () => {
  try {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    
    // Clear activity tracking and current user
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('currentUser');
    
    // Dispatch custom event to notify components that user logged out
    window.dispatchEvent(new CustomEvent('auth-logout'));
    
    // Refresh the page after logout
    setTimeout(() => {
      window.location.reload();
    }, 100); // Small delay to allow event handlers to process
    
  } catch (err) {
    // Clear activity tracking and current user for local fallback
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('currentUser');
    
    // Dispatch logout event even for local fallback
    window.dispatchEvent(new CustomEvent('auth-logout'));
    
    // Refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
};

export const getMe = async () => {
  // Check if session has expired due to inactivity
  if (isSessionExpired()) {
    // Clear expired session data
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('currentUser');
    
    // Try to logout from server as well
    try {
      await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    } catch (err) {
      // Ignore server errors during cleanup
    }
    
    // Dispatch expiration event
    window.dispatchEvent(new CustomEvent('auth-expired'));
    
    return { user: null };
  }
  
  // Update activity since user is actively using the app
  updateActivity();
  
  try {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    
    // Check if server returned 401 (token expired/invalid)
    if (res.status === 401) {
      // Clear all auth data
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('currentUser');
      
      // Try to logout from server as well
      try {
        await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
      } catch (err) {
        // Ignore server errors during cleanup
      }
      
      // Dispatch expiration event
      window.dispatchEvent(new CustomEvent('auth-expired'));
      
      return { user: null };
    }
    
    const data = await res.json();
    
    // If server says no user but we have localStorage data, respect server
    if (!data.user) {
      localStorage.removeItem('currentUser');
      
      // Dispatch logout event if we had a user before
      const hadUser = localStorage.getItem('currentUser');
      if (hadUser) {
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
    }
    
    return data;
  } catch (err) {
    // Network error or other issues
    console.warn('Auth check failed:', err.message);
    
    // fallback: return the currentUser from localStorage if present and not expired
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    return { user };
  }
};
