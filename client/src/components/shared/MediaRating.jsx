import React, { useEffect, useState } from 'react';
import './MediaRating.css';

const MediaRating = ({ itemType, itemId, itemTitle, showDetails = false }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemType || !itemId) return;
    
    console.log('[MediaRating] Fetching rating for:', itemType, itemId);
    
    const fetchRating = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = `/api/ratings/${itemType}/${encodeURIComponent(itemId)}`;
        console.log('[MediaRating] Fetching from URL:', url);
        
        const response = await fetch(url);
        
        console.log('[MediaRating] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ratings: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[MediaRating] Received data:', data);
        setRatingData(data);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [itemType, itemId]);

  // Listen for review updates to refresh ratings
  useEffect(() => {
    const handleReviewUpdate = (event) => {
      // Refresh ratings when reviews are updated
      if (!itemType || !itemId) return;
      
      const fetchRating = async () => {
        try {
          const response = await fetch(`/api/ratings/${itemType}/${encodeURIComponent(itemId)}`);
          if (response.ok) {
            const data = await response.json();
            setRatingData(data);
          }
        } catch (err) {
          console.error('Error refreshing ratings:', err);
        }
      };

      fetchRating();
    };

    window.addEventListener('reviews-updated', handleReviewUpdate);
    return () => window.removeEventListener('reviews-updated', handleReviewUpdate);
  }, [itemType, itemId]);

  const renderStars = (rating, count) => {
    if (!rating) return <span className="no-rating">No ratings yet</span>;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-display">
        <div className="stars">
          {'★'.repeat(fullStars)}
          {hasHalfStar && '½'}
          {'☆'.repeat(emptyStars)}
        </div>
        <span className="rating-text">
          {rating.toFixed(1)} ({count} rating{count !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  const renderDistribution = (distribution, total) => {
    if (!distribution || total === 0) return null;

    return (
      <div className="rating-distribution">
        <h4>Rating Distribution:</h4>
        {distribution.map((count, index) => {
          const stars = 5 - index;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={stars} className="distribution-bar">
              <span className="star-label">{stars}★</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="count-label">{count}</span>
            </div>
          );
        }).reverse()}
      </div>
    );
  };

  if (loading) {
    return <div className="rating-loading">Loading ratings...</div>;
  }

  if (error) {
    return <div className="rating-error">Unable to load ratings</div>;
  }

  if (!ratingData) {
    return null;
  }

  return (
    <div className="media-rating">
      {showDetails && itemTitle && (
        <h3 className="rating-title">{itemTitle}</h3>
      )}
      
      <div className="rating-summary">
        <div className="median-rating">
          <label>Community Rating:</label>
          {renderStars(ratingData.median, ratingData.count)}
        </div>
        
        {ratingData.average !== ratingData.median && ratingData.count > 1 && (
          <div className="average-rating">
            <label>Average:</label>
            <span className="rating-value">{ratingData.average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {showDetails && ratingData.distribution && (
        renderDistribution(ratingData.distribution, ratingData.count)
      )}
    </div>
  );
};

export default MediaRating;