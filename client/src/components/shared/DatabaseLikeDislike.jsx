import { useRef, useEffect, useState } from "react";
import { authFetch } from "../../services/authService";

export const LikeDislike = ({ id, itemType = "movie", itemTitle, onVote }) => {
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [counts, setCounts] = useState({ thumbsUp: 0, thumbsDown: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authFetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Load initial data
  useEffect(() => {
    if (!id || !itemType) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load vote counts (public)
        const countsResponse = await fetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}`);
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          setCounts({
            thumbsUp: countsData.thumbsUp,
            thumbsDown: countsData.thumbsDown
          });
        }

        // Load user's vote (if authenticated)
        if (isAuthenticated) {
          const userResponse = await authFetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}/user`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserVote(userData.userVote);
          } else if (userResponse.status === 401) {
            // Token expired, user is no longer authenticated
            setIsAuthenticated(false);
            setUserVote(null);
          }
        }
      } catch (error) {
        console.error('Error loading thumbs data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, itemType, isAuthenticated]);

  const changeVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    try {
      const response = await authFetch('/api/thumbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType,
          itemId: id,
          itemTitle: itemTitle || id,
          voteType
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, user is no longer authenticated
          setIsAuthenticated(false);
          setUserVote(null);
          alert('Your session has expired. Please log in again.');
          return;
        }
        throw new Error('Failed to vote');
      }

      const result = await response.json();
      
      // Update local state based on server response
      setUserVote(result.currentVote);
      
      // Refresh counts from server
      const countsResponse = await fetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}`);
      if (countsResponse.ok) {
        const countsData = await countsResponse.json();
        setCounts({
          thumbsUp: countsData.thumbsUp,
          thumbsDown: countsData.thumbsDown
        });
      }

      // Notify parent component if needed
      if (typeof onVote === "function") {
        onVote(id, result.currentVote, { 
          thumbsUp: countsData.thumbsUp, 
          thumbsDown: countsData.thumbsDown 
        });
      }

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to record vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote('up'); }}
        className={`thumb-btn like-btn ${userVote === 'up' ? "selected" : ""}`}
        aria-pressed={userVote === 'up'}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? "Login required to vote" : ""}
      >
        <span aria-hidden>👍</span>
        <span className="count"> {counts.thumbsUp}</span>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote('down'); }}
        className={`thumb-btn dislike-btn ${userVote === 'down' ? "selected" : ""}`}
        aria-pressed={userVote === 'down'}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? "Login required to vote" : ""}
      >
        <span aria-hidden>👎</span>
        <span className="count"> {counts.thumbsDown}</span>
      </button>
      {!isAuthenticated && (
        <span style={{ fontSize: '0.8rem', color: '#666', alignSelf: 'center' }}>
          Login to vote
        </span>
      )}
    </div>
  );
};

// Keep the old component as LikeDislikeLocal for backward compatibility
export const LikeDislikeLocal = ({ id, onVote }) => {
  // ... (your existing localStorage-based implementation)
  // This can be used for components that don't need database persistence
};