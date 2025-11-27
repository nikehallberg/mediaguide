import React, { useState } from 'react';
import MediaRating from '../shared/MediaRating';
import './RatingsDetail.css';

const RatingsDetail = ({ itemType, itemId, itemTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!itemType || !itemId) return null;

  return (
    <>
      <button 
        className="ratings-detail-trigger"
        onClick={() => setIsOpen(true)}
      >
        View Detailed Ratings
      </button>

      {isOpen && (
        <div className="ratings-modal" onClick={() => setIsOpen(false)}>
          <div className="ratings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ratings-header">
              <h2>Community Ratings</h2>
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            
            <MediaRating 
              itemType={itemType}
              itemId={itemId}
              itemTitle={itemTitle}
              showDetails={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RatingsDetail;