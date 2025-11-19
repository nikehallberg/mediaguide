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
        const url = `${API_ROOT}/api/reviews/mine`;
        console.debug("[ReviewButton] GET mine", url);
        const res = await fetch(url, { credentials: "include" });
        console.debug("[ReviewButton] GET mine status", res.status);
        if (!mounted) return;
        if (!res.ok) {
          setExistingId(null);
          setRating(3);
          setText("");
          return;
        }
        const data = await res.json().catch(() => ({ reviews: [] }));
        const list = Array.isArray(data) ? data : data.reviews || [];
        const review = list.find((r) => String(r.itemId) === String(itemKey));
        if (review) {
          setExistingId(review._id || review.id || null);
          setRating(review.rating || 3);
          setText(review.content || review.text || review.comment || "");
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
  }, [open, itemKey]);

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
      // Send both content and text for compatibility with different backend field names
      const body = {
        itemType,
        itemId: itemKey,
        itemTitle: itemTitle || itemKey,
        rating,
        content: text,
        text,
      };

      if (existingId) {
        // Update existing review (PATCH)
        const url = `${API_ROOT}/api/reviews/${existingId}`;
        console.debug("[ReviewButton] PATCH", url, body);
        const res = await fetch(url, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const resText = await res.text().catch(() => "");
        console.debug("[ReviewButton] PATCH status", res.status, resText);
        if (!res.ok) {
          let data = {};
          try {
            data = resText ? JSON.parse(resText) : {};
          } catch (parseErr) {
            console.warn("PATCH parse error", parseErr);
          }
          if (res.status === 401) {
            alert("Logga in för att uppdatera review.");
            setLoading(false);
            return;
          }
          alert(data.error || "Kunde inte uppdatera review.");
          setLoading(false);
          return;
        }
        // success
        dispatchUpdate({ id: existingId, action: "updated" });
        if (typeof onSaved === "function")
          onSaved({ id: existingId, key: itemKey, review: { rating, text } });
      } else {
        // Create new review (POST)
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
            alert("Logga in för att lämna en review.");
            setLoading(false);
            return;
          }
          alert(data.error || "Kunde inte spara din review.");
          setLoading(false);
          return;
        }
        const data = resText ? JSON.parse(resText) : {};
        const newId = data.review?._id || data._id || data.id || null;
        setExistingId(newId || true);
        dispatchUpdate({ id: newId, action: "created" });
        if (typeof onSaved === "function")
          onSaved({
            id: newId || true,
            key: itemKey,
            review: { rating, text },
          });
      }

      setOpen(false);
    } catch (err) {
      console.error("[ReviewButton] Network error saving review", err);
      alert("Nätverksfel vid sparning av review.");
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
        title={added ? "Redigera din review" : "Lägg till review"}
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
              placeholder='Skriv din recension...'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className='review-actions'>
              <button
                className='show-more-btn'
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Sparar…" : "Spara"}
              </button>
              <button className='show-more-btn btn-cancel' onClick={close}>
                Avbryt
              </button>
              {existingId && (
                <button
                  className='show-more-btn btn-delete'
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Tar bort…" : "Ta bort"}
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
