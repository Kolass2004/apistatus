import React, { useState } from 'react';
import { Globe, Server, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Terminal } from 'lucide-react';

const ServiceCard = ({ serviceKey, data }) => {
  const { status, description, origin, public: pub, reason, service, running } = data || {};
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
    if (hasIssues && reason) setIsExpanded(!isExpanded);
  };

  const hasDetails = Boolean(origin || (pub && pub.url) || service);

  return (
    <div 
      className={`service-card ${statusClass} ${hasIssues && reason ? 'expandable' : ''}`}
      onClick={toggleExpand}
    >
      <div className="card-header">
        <div>
          <h3 className="card-title">{description || serviceKey}</h3>
          <p className="card-description">{serviceKey || 'No service identifier'}</p>
        </div>
        <div className="card-status-wrapper">
          <div className={`status-badge ${statusClass}`}>
            <span className="status-dot"></span>
            {status}
          </div>
          {hasIssues && reason && (
            isExpanded ? <ChevronUp size={16} className="expand-chevron" /> : <ChevronDown size={16} className="expand-chevron" />
          )}
        </div>
      </div>
      
      {hasDetails && (
        <div className="card-details">
          {service && (
            <div className="detail-row">
              <Terminal size={14} className="detail-icon" />
              <span className="detail-mono">{service}</span>
              <span className={`pill-badge ${running ? 'pill-green' : 'pill-red'}`}>
                {running ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
          )}

          {origin && (
            <div className="detail-row">
              <Server size={14} className="detail-icon" />
              <span className="detail-mono">{origin.address}</span>
              <span className={`pill-badge ${origin.available ? 'pill-green' : 'pill-red'}`}>
                {origin.available ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          )}

          {pub && pub.url && (
            <div className="detail-row">
              <Globe size={14} className="detail-icon" />
              <a 
                href={pub.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={e => e.stopPropagation()}
                className="detail-link"
              >
                <span>{pub.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                <ExternalLink size={12} className="link-icon" />
              </a>
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
