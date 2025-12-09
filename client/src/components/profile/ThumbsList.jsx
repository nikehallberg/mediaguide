import React, { useState, useEffect } from 'react';
import './ThumbsList.css';

const ThumbsList = ({ isOpen, onClose }) => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchVotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/thumbs/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch votes');
        }
        
        const data = await response.json();
        setVotes(data.votes || []);
      } catch (err) {
        console.error('Error fetching votes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [isOpen]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupVotesByType = (votes) => {
    const grouped = {};
    votes.forEach(vote => {
      if (!grouped[vote.itemType]) {
        grouped[vote.itemType] = [];
      }
      grouped[vote.itemType].push(vote);
    });
    return grouped;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content thumbs-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>My Voting History</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <p>Loading your votes...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && votes.length === 0 && (
            <div className="empty-state">
              <p>You haven't cast any votes yet.</p>
              <p>Start voting on movies, shows, songs, and books to see them here!</p>
            </div>
          )}
          
          {!loading && !error && votes.length > 0 && (
            <div className="votes-container">
              <div className="votes-summary">
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-number">{votes.filter(v => v.voteType === 'up').length}</span>
                    <span className="stat-label">👍 Thumbs Up</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{votes.filter(v => v.voteType === 'down').length}</span>
                    <span className="stat-label">👎 Thumbs Down</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{votes.length}</span>
                    <span className="stat-label">Total Votes</span>
                  </div>
                </div>
              </div>
              
              <div className="votes-by-type">
                {Object.entries(groupVotesByType(votes)).map(([itemType, typeVotes]) => (
                  <div key={itemType} className="votes-section">
                    <h3 className="section-title">
                      {itemType.charAt(0).toUpperCase() + itemType.slice(1)}s 
                      <span className="section-count">({typeVotes.length})</span>
                    </h3>
                    
                    <div className="votes-list">
                      {typeVotes.map((vote) => (
                        <div key={vote._id} className={`vote-item ${vote.voteType}`}>
                          <div className="vote-icon">
                            {vote.voteType === 'up' ? '👍' : '👎'}
                          </div>
                          <div className="vote-details">
                            <div className="vote-title">{vote.itemTitle}</div>
                            <div className="vote-meta">
                              <span className="vote-type">{vote.itemType}</span>
                              <span className="vote-date">{formatDate(vote.dateCreated)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbsList;