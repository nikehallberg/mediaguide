import React, { useEffect, useState } from "react";
import "./../reviews/Reviews.css"; // reuse modal styles
import "./../shared/MediaShared.css";

/**
 * WatchlistPanel
 * Props:
 * - onClose(): called when panel should close
 * - open (bool): whether panel is visible
 * - onRemoved({ id, key }) optional: callback after successful removal
 *
 * Behavior:
 * - GET /api/watchlist (credentials include) to load items
 * - DELETE /api/watchlist/:id to remove
 */
const WatchlistPanel = ({ open, onClose, onRemoved }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/watchlist", { credentials: "include" });
      if (!res.ok) {
        // not logged in or other error
        const data = await res.json().catch(() => ({}));
        setItems([]);
        setError(data.error || "Kunde inte ladda din watchlist.");
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const list = data.items || data || [];
      setItems(list);
    } catch (err) {
      console.error("Failed to load watchlist", err);
      setError("Nätverksfel vid inläsning av watchlist.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleRemove = async (item) => {
    const id = item._id || item.id;
    if (!id) {
      // fallback: nothing to delete on server
      setItems((prev) =>
        prev.filter(
          (it) =>
            (it.itemId || it.itemTitle || it.title) !==
            (item.itemId || item.itemTitle || item.title)
        )
      );
      if (typeof onRemoved === "function")
        onRemoved({
          id: null,
          key: item.itemId || item.itemTitle || item.title,
        });
      return;
    }
    if (!confirm("Ta bort detta från din watchlist?")) return;
    try {
      const res = await fetch(`/api/watchlist/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Kunde inte ta bort från watchlist.");
        return;
      }
      setItems((prev) => prev.filter((it) => (it._id || it.id) !== id));
      if (typeof onRemoved === "function")
        onRemoved({ id, key: item.itemId || item.itemTitle || item.title });
    } catch (err) {
      console.error("Network error removing watchlist item", err);
      alert("Nätverksfel vid borttagning.");
    }
  };

  if (!open) return null;

  return (
    <div className='review-modal' onClick={onClose}>
      <div className='review-panel' onClick={(e) => e.stopPropagation()}>
        <h3>Din Watchlist</h3>

        {loading && <div className='review-loading'>Laddar watchlist…</div>}
        {!loading && error && <div className='review-empty'>{error}</div>}

        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className='review-empty'>Din watchlist är tom.</div>
            ) : (
              <div className='watchlist-list'>
                {items.map((it) => {
                  const key = it.itemId || it.itemTitle || it.title || "Okänt";
                  const id = it._id || it.id || null;
                  return (
                    <div className='watchlist-item' key={id || key}>
                      <div className='watchlist-item-title'>
                        {it.itemTitle || it.title || it.itemId || key}
                      </div>
                      <div className='watchlist-item-meta'>
                        <small>{it.createdAt || ""}</small>
                        <button
                          className='show-more-btn btn-remove'
                          onClick={() => handleRemove(it)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className='review-actions' style={{ marginTop: 12 }}>
          <button className='show-more-btn' onClick={onClose}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPanel;
