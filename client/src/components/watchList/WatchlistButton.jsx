import React, { useEffect, useState } from "react";

/**
 * WatchlistButton
 * Props:
 * - itemKey (string) REQUIRED: unique key to identify this item (e.g. movie.title or external id)
 * - itemType (string) optional: "movie" | "book" | "song" | "show"
 * - itemTitle (string) optional: nice title to send to backend
 * - initialId (string|null) optional: the watchlist item _id if already present
 * - className (string) optional: extra classNames (button already uses .watch-btn)
 * - onAdd({ id, key }) optional: called after successful add
 * - onRemove({ id, key }) optional: called after successful remove
 *
 * The component handles POST /api/watchlist and DELETE /api/watchlist/:id.
 */
const WatchlistButton = ({
  itemKey,
  itemType = "movie",
  itemTitle = "",
  initialId = null,
  className = "",
  onAdd,
  onRemove,
}) => {
  const [id, setId] = useState(initialId || null);
  const [loading, setLoading] = useState(false);

  // sync prop changes
  useEffect(() => {
    setId(initialId || null);
  }, [initialId]);

  const handleClick = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (loading) return;
    setLoading(true);

    if (id) {
      // remove
      try {
        const res = await fetch(`/api/watchlist/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Could not remove from watchlist");
          return;
        }
        setId(null);
        if (typeof onRemove === "function") onRemove({ id, key: itemKey });
      } catch (err) {
        console.error("Network error removing watchlist item", err);
        alert("Network error while removing item");
      } finally {
        setLoading(false);
      }
    } else {
      // add
      try {
        const body = {
          itemType,
          itemId: itemKey,
          itemTitle: itemTitle || itemKey,
        };
        const res = await fetch("/api/watchlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (res.status === 401) {
            alert("Please log in to add items to your watchlist.");
            return;
          }
          alert(data.error || "Could not add to watchlist");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const newId =
          data._id ||
          data.id ||
          (data.item && (data.item._id || data.item.id)) ||
          null;
        setId(newId || true);
        if (typeof onAdd === "function")
          onAdd({ id: newId || true, key: itemKey });
      } catch (err) {
        console.error("Network error adding watchlist item", err);
        alert("Network error while adding item");
      } finally {
        setLoading(false);
      }
    }
  };

  const added = !!id;
  const btnClass = `watch-btn ${added ? "added" : ""} ${className}`.trim();

  return (
    <button
      className={btnClass}
      onClick={handleClick}
      aria-pressed={added}
      title={added ? "Remove from watchlist" : "Add to watchlist"}
      disabled={loading}
    >
      {loading ? "…" : added ? "✓" : "+"}
    </button>
  );
};

export default WatchlistButton;
