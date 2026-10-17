import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, Clock, Server } from 'lucide-react';
import ServiceCard from './components/ServiceCard';
import SystemMetrics from './components/SystemMetrics';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = useCallback(async (isManual = false) => {
    try {
      setLoading(true);
      // Brief debounce for smooth visual feedback on manual refresh
      if (isManual) await new Promise(r => setTimeout(r, 350)); 
      
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
  }, []);

  useEffect(() => {
    fetchData();
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="container">
        <div className="loader-container">
          <RefreshCw className="spinner" size={32} />
          <p className="loader-text">CONNECTING TO REXONSPACE MONITOR...</p>
        </div>
      </div>
    );
  }

  // Calculate global status based on individual services
  let globalStatus = 'All Systems Operational';
  let globalStatusClass = 'available';
  let availableCount = 0;
  let totalServices = 0;
  
  if (data && data.services) {
    const services = Object.values(data.services);
    totalServices = services.length;
    availableCount = services.filter(s => s.status === 'available' || s.status === 'online').length;
    const offlineCount = services.filter(s => s.status !== 'available' && s.status !== 'online').length;
    
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
       
          <h1>System Status</h1>
          <p className="header-tagline">Real-time infrastructure health, host telemetry, and service availability</p>
        </div>

        <div className="header-controls">
          {data && (
            <div className={`global-status ${globalStatusClass}`}>
              <span className="status-pulse-dot"></span>
              <span>{globalStatus}</span>
            </div>
          )}
          <button 
            onClick={() => fetchData(true)} 
            disabled={loading}
            className="refresh-btn"
            title="Refresh status data"
            aria-label="Refresh status"
          >
            <RefreshCw size={17} className={loading ? 'spinner' : ''} />
          </button>
        </div>
      </header>

      {error ? (
        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h2>System Telemetry Unavailable</h2>
          <p>
            Unable to connect to the status daemon at apistatus.rexonspace.in ({error}). Services may be undergoing scheduled maintenance or temporary network isolation.
          </p>
          <button onClick={fetchData} className="action-button">
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {data?.system && (
            <SystemMetrics 
              system={data.system} 
              lastCheckedAt={data.last_checked_at}
              cacheAgeSeconds={data.cache_age_seconds}
            />
          )}

          <section className="services-section" aria-label="Monitored Services">
            <div className="section-header">
              <div className="section-title-group">
                <Server size={16} className="section-title-icon" />
                <h2 className="section-heading">Monitored Services</h2>
                <span className="section-subtag">Network & Endpoints</span>
              </div>
              <div className="services-count-badge">
                <span className="count-available">{availableCount}</span>
                <span className="count-divider">/</span>
                <span className="count-total">{totalServices} AVAILABLE</span>
              </div>
            </div>

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
          </section>
        </>
      )}

      <footer className="footer">
        <div className="footer-left">
          <Clock size={14} />
          <span>Client updated: {lastRefreshed.toLocaleTimeString()}</span>
          {data?.last_checked_at && (
            <span className="server-timestamp">
              • Server poll: {new Date(data.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
        <div className="footer-right">
          Uvite technologies | Property of Kolass Rexon J
        </div>
      </footer>
    </div>
  );
}

export default App;
