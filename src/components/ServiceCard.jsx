import React, { useState } from 'react';
import { Globe, Server, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const ServiceCard = ({ serviceKey, data, index }) => {
  const { status, description, origin, public: pub, reason } = data;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine status class
  let statusClass = 'offline';
  if (status === 'available' || status === 'online') {
    statusClass = 'available';
  } else if (status === 'issues' || status === 'degraded') {
    statusClass = 'issues';
  }

  const hasIssues = statusClass === 'issues' || statusClass === 'offline';

  const toggleExpand = () => {
    if (hasIssues) setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`service-card ${statusClass} ${hasIssues ? 'expandable' : ''}`}
      onClick={toggleExpand}
    >
      <div className="card-header">
        <div>
          <h3 className="card-title">{description}</h3>
          <p className="card-description">{serviceKey || 'No description available'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={`status-badge ${statusClass}`}>
            {status}
          </div>
          {hasIssues && (
            isExpanded ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />
          )}
        </div>
      </div>
      
      {(origin || pub) && (
        <div className="card-details">
          {origin && (
            <div className="detail-row">
              <Server size={14} />
              <span style={{ color: origin.available ? 'var(--status-green)' : 'var(--status-red)', fontWeight: '600' }}>
                {origin.available ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          )}
          {pub && pub.url && (
            <div className="detail-row">
              <Globe size={14} />
              <a href={pub.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                {pub.url.replace(/^https?:\/\//, '')}
              </a>
              <ExternalLink size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />
            </div>
          )}
        </div>
      )}

      {hasIssues && isExpanded && reason && (
        <div className="reason-dropdown fade-in-reason">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
