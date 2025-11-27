import { useState, useEffect } from 'react';

// Custom hook for fetching multiple ratings at once
export const useMediaRatings = (items = []) => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!items || items.length === 0) {
      setRatings({});
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ratings/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bulk ratings');
        }

        const data = await response.json();
        
        // Convert array to object keyed by itemType:itemId
        const ratingsObj = {};
        data.ratings.forEach(rating => {
          const key = `${rating.itemType}:${rating.itemId}`;
          ratingsObj[key] = rating;
        });
        
        setRatings(ratingsObj);
      } catch (err) {
        console.error('Error fetching bulk ratings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [JSON.stringify(items)]);

  // Helper function to get rating for specific item
  const getRating = (itemType, itemId) => {
    const key = `${itemType}:${itemId}`;
    return ratings[key] || null;
  };

  return { ratings, loading, error, getRating };
};

// Custom hook for a single rating with auto-refresh
export const useMediaRating = (itemType, itemId) => {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRating = async () => {
    if (!itemType || !itemId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ratings/${itemType}/${encodeURIComponent(itemId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }
      
      const data = await response.json();
      setRating(data);
    } catch (err) {
      console.error('Error fetching rating:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRating();
  }, [itemType, itemId]);

  // Listen for review updates
  useEffect(() => {
    const handleReviewUpdate = () => {
      fetchRating();
    };

    window.addEventListener('reviews-updated', handleReviewUpdate);
    return () => window.removeEventListener('reviews-updated', handleReviewUpdate);
  }, [itemType, itemId]);

  return { rating, loading, error, refetch: fetchRating };
};