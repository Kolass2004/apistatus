import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import ServiceCard from './components/ServiceCard';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      // Wait a tiny bit to show loading state if manual refresh
      if (data) await new Promise(r => setTimeout(r, 400)); 
      
      const response = await fetch('https://apistatus.rexonspace.in/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="container">
        <div className="loader-container">
          <RefreshCw className="spinner" size={32} />
          <p>Fetching system status...</p>
        </div>
      </div>
    );
  }

  // Calculate global status based on individual services
  let globalStatus = 'All Systems Operational';
  let globalStatusClass = 'available';
  
  if (data && data.services) {
    const services = Object.values(data.services);
    const offlineCount = services.filter(s => s.status !== 'available').length;
    
    if (offlineCount === services.length && services.length > 0) {
      globalStatus = 'Major Outage';
      globalStatusClass = 'offline';
    } else if (offlineCount > 0) {
      globalStatus = 'Partial Outage';
      globalStatusClass = 'issues';
    } else if (data.status !== 'available') {
      globalStatus = 'System Issues Detected';
      globalStatusClass = 'issues';
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-titles">
          <h1 >System Status</h1>
        </div>
        <div className="header-controls">
          {data && (
            <div className={`global-status ${globalStatusClass}`}>
              {globalStatus}
            </div>
          )}
          <button 
            onClick={fetchData} 
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '0 0.85rem',
              borderRadius: '0',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Refresh status"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <RefreshCw size={18} className={loading ? 'spinner' : ''} />
          </button>
        </div>
      </header>

      {error ? (
        <div className="error-container">
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h3>Unable to fetch status</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{error}</p>
          <button 
            onClick={fetchData}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '0',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {data && data.services && Object.entries(data.services).map(([key, serviceData], index) => (
            <ServiceCard 
              key={key} 
              serviceKey={key} 
              data={serviceData} 
              index={index} 
            />
          ))}
        </div>
      )}

      <footer className="footer">
        <div className="footer-left">
          <Clock size={14} />
          <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
        </div>
        <div className="footer-right">
        Uvite technologies |  Property of Kolass Rexon J
        </div>
      </footer>
    </div>
  );
}

export default App;
