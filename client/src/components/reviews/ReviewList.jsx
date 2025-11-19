import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import "./Reviews.css";

const API_ROOT = import.meta.env.VITE_API_URL || "";

const ReviewList = ({ onDeleted }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_ROOT}/api/reviews/all`;
      console.debug("[ReviewList] GET", url);
      const res = await fetch(url, { credentials: "include" });
      console.debug("[ReviewList] status", res.status);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn("[ReviewList] non-ok response:", res.status, text);
        setReviews([]);
        setError(
          res.status === 401
            ? "Logga in för att se dina reviews."
            : "Kunde inte ladda dina reviews."
        );
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data.reviews || [];
      setReviews(list);
    } catch (err) {
      console.error("[ReviewList] Failed to load reviews", err);
      setError("Nätverksfel vid inläsning av reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteLocal = (id) => {
    setReviews((prev) => prev.filter((r) => (r._id || r.id) !== id));
    if (typeof onDeleted === "function") onDeleted(id);
  };

  const handleRemove = async (review) => {
    if (!confirm("Ta bort denna review?")) return;
    const id = review._id || review.id;
    if (!id) {
      handleDeleteLocal(null);
      return;
    }
    try {
      const url = `${API_ROOT}/api/reviews/${id}`;
      console.debug("[ReviewList] DELETE", url);
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      console.debug("[ReviewList] DELETE status", res.status);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let body = {};
        try {
          body = JSON.parse(text || "{}");
        } catch (parseErr) {
          console.warn("[ReviewList] DELETE parse error", parseErr);
        }
        alert(body.error || "Kunde inte ta bort review.");
        return;
      }
      handleDeleteLocal(id);
    } catch (err) {
      console.error("[ReviewList] Network error removing review", err);
      alert("Nätverksfel vid borttagning.");
    }
  };

  if (loading)
    return <div className='review-loading'>Laddar dina reviews…</div>;
  if (error) return <div className='review-empty'>{error}</div>;
  if (!reviews.length)
    return <div className='review-empty'>Du har inga reviews ännu.</div>;

  return (
    <div className='review-list'>
      {reviews.map((r, idx) => {
        const id = r._id || r.id;
        const key = id || r.itemId || `${r.itemTitle || "unknown"}-${idx}`;
        return (
          <div className='review-item' key={key}>
            <div className='review-item-top'>
              <div className='review-title'>
                {r.itemTitle || r.itemId || "Okänt"}
              </div>
              <div className='review-rating'>
                <Rating
                  name={`read-${id}`}
                  value={r.rating || 0}
                  precision={0.5}
                  readOnly
                />
              </div>
            </div>
            <div className='review-text-block'>
              {r.content || r.text || r.comment || ""}
            </div>
            <div className='review-meta'>
              <small>{r.updatedAt || r.createdAt || ""}</small>
              <button
                className='show-more-btn btn-remove'
                onClick={() => handleRemove(r)}
              >
                Ta bort
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
