import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import "./Reviews.css";

const API_ROOT = import.meta.env.VITE_API_URL || "";

const ReviewButton = ({
  itemKey,
  itemType = "movie",
  itemTitle = "",
  className = "",
  onSaved,
  onRemoved,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [rating, setRating] = useState(3);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        const url = `${API_ROOT}/api/reviews/${itemType}/${encodeURIComponent(itemKey)}`;
        console.debug("[ReviewButton] GET existing review", url);
        const res = await fetch(url, { credentials: "include" });
        console.debug("[ReviewButton] GET status", res.status);
        if (!mounted) return;
        if (!res.ok) {
          setExistingId(null);
          setRating(3);
          setText("");
          return;
        }
        const data = await res.json().catch(() => ({ review: null }));
        const review = data.review;
        if (review) {
          setExistingId(review._id || review.id || null);
          setRating(review.rating || 3);
          setText(review.reviewText || review.content || review.text || "");
        } else {
          setExistingId(null);
          setRating(3);
          setText("");
        }
      } catch (err) {
        console.error("[ReviewButton] Failed to load existing review", err);
        setExistingId(null);
        setRating(3);
        setText("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, itemKey, itemType]);

  const close = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setOpen(false);
  };

  const dispatchUpdate = (detail = {}) => {
    try {
      window.dispatchEvent(new CustomEvent("reviews-updated", { detail }));
    } catch (err) {
      console.warn("Failed to dispatch reviews-updated", err);
    }
  };

  const handleSave = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setLoading(true);
    try {
      const body = {
        itemType,
        itemId: itemKey,
        itemTitle: itemTitle || itemKey,
        rating,
        reviewText: text,
      };

      // Always use POST - the backend will handle create/update
      const url = `${API_ROOT}/api/reviews`;
      console.debug("[ReviewButton] POST", url, body);
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resText = await res.text().catch(() => "");
      console.debug("[ReviewButton] POST status", res.status, resText);
      if (!res.ok) {
        let data = {};
        try {
          data = resText ? JSON.parse(resText) : {};
        } catch (parseErr) {
          console.warn("POST parse error", parseErr);
        }
        if (res.status === 401) {
          alert("Please log in to save your review.");
          setLoading(false);
          return;
        }
        alert(data.error || "Could not save your review.");
        setLoading(false);
        return;
      }
      const data = resText ? JSON.parse(resText) : {};
      const newId = data.review?._id || data._id || data.id || null;
      setExistingId(newId || true);
      dispatchUpdate({ id: newId, action: existingId ? "updated" : "created" });
      if (typeof onSaved === "function")
        onSaved({
          id: newId || true,
          key: itemKey,
          review: { rating, text },
        });

      setOpen(false);
    } catch (err) {
      console.error("[ReviewButton] Network error saving review", err);
      alert("Network error while saving review.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!existingId) {
      setOpen(false);
      return;
    }
    if (!confirm("Ta bort din review?")) return;
    setLoading(true);
    try {
      const url = `${API_ROOT}/api/reviews/${existingId}`;
      console.debug("[ReviewButton] DELETE", url);
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      const resText = await res.text().catch(() => "");
      console.debug("[ReviewButton] DELETE status", res.status, resText);
      if (!res.ok) {
        let data = {};
        try {
          data = resText ? JSON.parse(resText) : {};
        } catch (parseErr) {
          console.warn("DELETE parse error", parseErr);
        }
        alert(data.error || "Kunde inte ta bort review.");
        setLoading(false);
        return;
      }
      setExistingId(null);
      setText("");
      setRating(3);
      setOpen(false);
      dispatchUpdate({ id: existingId, action: "deleted" });
      if (typeof onRemoved === "function")
        onRemoved({ id: existingId, key: itemKey });
    } catch (err) {
      console.error("[ReviewButton] Network error deleting review", err);
      alert("Nätverksfel vid borttagning.");
    } finally {
      setLoading(false);
    }
  };

  const added = !!existingId;

  return (
    <>
      <button
        className={`watch-btn review-toggle ${
          added ? "added" : ""
        } ${className}`.trim()}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={added ? "Edit your review" : "Add review"}
        aria-pressed={added}
      >
        {added ? "★" : "✚"}
      </button>

      {open && (
        <div className='review-modal' onClick={close}>
          <div className='review-panel' onClick={(e) => e.stopPropagation()}>
            <h3>{itemTitle || itemKey}</h3>
            <div className='review-row'>
              <span>Rating:</span>
              <Rating
                name='review-rating'
                value={rating}
                precision={0.5}
                onChange={(_, val) => setRating(val || 0)}
              />
            </div>
            <textarea
              className='review-text'
              placeholder='Write your review...'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className='review-actions'>
              <button
                className='show-more-btn'
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button className='show-more-btn btn-cancel' onClick={close}>
                Cancel
              </button>
              {existingId && (
                <button
                  className='show-more-btn btn-delete'
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewButton;
