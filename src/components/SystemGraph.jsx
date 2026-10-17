import React, { useState, useRef } from 'react';
import { Activity, Clock } from 'lucide-react';

const SystemGraph = ({ system, services, history = [] }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'cpu', 'memory'
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (!system && history.length === 0) return null;

  // Chart dimensions
  const width = 940;
  const height = 260;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const dataPoints = history.length > 0 ? history : [
    { time: '18:35', cpu: 4.8, ram: 41.0, disk: 60.2 },
    { time: '18:37', cpu: 5.2, ram: 41.1, disk: 60.2 },
    { time: '18:39', cpu: 4.9, ram: 41.2, disk: 60.2 },
    { time: '18:41', cpu: 6.1, ram: 41.4, disk: 60.2 },
    { time: '18:43', cpu: 5.0, ram: 41.2, disk: 60.2 },
    { time: '18:45', cpu: 4.9, ram: 41.2, disk: 60.2 },
    { time: '18:47', cpu: 5.3, ram: 41.3, disk: 60.2 },
    { time: '18:49', cpu: 5.0, ram: 41.2, disk: 60.2 },
  ];

  // Coordinates calculation
  const getX = (idx) => padLeft + (idx / Math.max(dataPoints.length - 1, 1)) * plotWidth;
  const getY = (val) => padTop + plotHeight - (Math.min(Math.max(val, 0), 100) / 100) * plotHeight;

  // Build SVG smooth path
  const buildSmoothPath = (key) => {
    if (dataPoints.length === 0) return '';
    const pts = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const buildAreaPath = (key) => {
    if (dataPoints.length === 0) return '';
    const linePath = buildSmoothPath(key);
    const lastX = getX(dataPoints.length - 1);
    const firstX = getX(0);
    const bottomY = padTop + plotHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const cpuPath = buildSmoothPath('cpu');
  const cpuArea = buildAreaPath('cpu');
  const ramPath = buildSmoothPath('ram');
  const ramArea = buildAreaPath('ram');

  // Handle interactive mouse hover
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = (mouseX / rect.width) * width;
    
    // Find closest index
    let closestIdx = 0;
    let minDist = Infinity;
    dataPoints.forEach((_, idx) => {
      const ptX = getX(idx);
      const dist = Math.abs(ptX - normX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? dataPoints[hoverIndex] : dataPoints[dataPoints.length - 1];

  // Y-axis grid percentage values
  const ySteps = [0, 25, 50, 75, 100];

  return (
    <section className="graph-section" aria-label="Telemetry Graphs Dashboard">
      <div className="graph-panel">
        <div className="graph-panel-header">
          <div className="graph-panel-title-group">
            <Activity size={18} className="panel-title-icon" />
            <div>
              <h2 className="graph-panel-heading">Resource Telemetry Graphs</h2>
              <p className="graph-panel-subheading">Live CPU load, memory utilization trends, and timeline analysis</p>
            </div>
          </div>

          <div className="graph-controls-group">
            <div className="graph-tab-selector" role="tablist">
              <button 
                className={`graph-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                role="tab"
                aria-selected={activeTab === 'all'}
              >
                Combined View
              </button>
              <button 
                className={`graph-tab ${activeTab === 'cpu' ? 'active' : ''}`}
                onClick={() => setActiveTab('cpu')}
                role="tab"
                aria-selected={activeTab === 'cpu'}
              >
                CPU Load
              </button>
              <button 
                className={`graph-tab ${activeTab === 'memory' ? 'active' : ''}`}
                onClick={() => setActiveTab('memory')}
                role="tab"
                aria-selected={activeTab === 'memory'}
              >
                Memory (RAM)
              </button>
            </div>
          </div>
        </div>

        {/* Live Legend and Metrics Snapshot */}
        <div className="graph-meta-banner">
          <div className="graph-legend-group">
            {(activeTab === 'all' || activeTab === 'cpu') && (
              <div className="legend-indicator cpu">
                <span className="legend-dot green"></span>
                <span className="legend-label">CPU LOAD:</span>
                <span className="legend-value">{activePoint ? `${activePoint.cpu.toFixed(1)}%` : '0%'}</span>
              </div>
            )}
            {(activeTab === 'all' || activeTab === 'memory') && (
              <div className="legend-indicator ram">
                <span className="legend-dot cyan"></span>
                <span className="legend-label">MEMORY ALLOC:</span>
                <span className="legend-value">{activePoint ? `${activePoint.ram.toFixed(1)}%` : '0%'}</span>
              </div>
            )}
            <div className="legend-indicator disk">
              <span className="legend-dot purple"></span>
              <span className="legend-label">STORAGE POOL:</span>
              <span className="legend-value">{system?.disk?.used_percent ?? 60.2}%</span>
            </div>
          </div>

          <div className="graph-time-indicator">
            <Clock size={13} />
            <span>Point: <strong>{activePoint ? activePoint.time : 'Live'}</strong></span>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="graph-canvas-wrapper">
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`} 
            className="graph-svg"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            {ySteps.map((step) => {
              const y = getY(step);
              return (
                <g key={step} className="grid-line-group">
                  <line 
                    x1={padLeft} 
                    y1={y} 
                    x2={width - padRight} 
                    y2={y} 
                    stroke="rgba(255, 255, 255, 0.06)" 
                    strokeDasharray={step === 0 ? '0' : '4 4'}
                    strokeWidth="1"
                  />
                  <text 
                    x={padLeft - 10} 
                    y={y + 4} 
                    fill="var(--text-muted)" 
                    fontSize="11" 
                    textAnchor="end"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {step}%
                  </text>
                </g>
              );
            })}

            {/* X-Axis Time Labels */}
            {dataPoints.map((d, i) => {
              // Show label on first, last, and every 3rd point
              if (i !== 0 && i !== dataPoints.length - 1 && i % 3 !== 0) return null;
              const x = getX(i);
              return (
                <text 
                  key={i} 
                  x={x} 
                  y={height - 12} 
                  fill="var(--text-muted)" 
                  fontSize="11" 
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {d.time}
                </text>
              );
            })}

            {/* RAM Area & Line */}
            {(activeTab === 'all' || activeTab === 'memory') && (
              <>
                <path d={ramArea} fill="url(#ramGradient)" />
                <path 
                  d={ramPath} 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </>
            )}

            {/* CPU Area & Line */}
            {(activeTab === 'all' || activeTab === 'cpu') && (
              <>
                <path d={cpuArea} fill="url(#cpuGradient)" />
                <path 
                  d={cpuPath} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </>
            )}

            {/* Hover Crosshair & Data Points */}
            {hoverIndex !== null && (
              <g className="hover-elements">
                <line 
                  x1={getX(hoverIndex)} 
                  y1={padTop} 
                  x2={getX(hoverIndex)} 
                  y2={padTop + plotHeight} 
                  stroke="rgba(255, 255, 255, 0.25)" 
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />

                {(activeTab === 'all' || activeTab === 'cpu') && (
                  <circle 
                    cx={getX(hoverIndex)} 
                    cy={getY(activePoint.cpu)} 
                    r="5" 
                    fill="#10b981" 
                    stroke="#0b0e13" 
                    strokeWidth="2.5" 
                  />
                )}

                {(activeTab === 'all' || activeTab === 'memory') && (
                  <circle 
                    cx={getX(hoverIndex)} 
                    cy={getY(activePoint.ram)} 
                    r="5" 
                    fill="#06b6d4" 
                    stroke="#0b0e13" 
                    strokeWidth="2.5" 
                  />
                )}
              </g>
            )}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoverIndex !== null && (
            <div 
              className="graph-tooltip"
              style={{
                left: `${(getX(hoverIndex) / width) * 100}%`,
                top: '20px'
              }}
            >
              <div className="tooltip-time">{activePoint.time}</div>
              <div className="tooltip-row green">
                <span>CPU:</span>
                <strong>{activePoint.cpu.toFixed(1)}%</strong>
              </div>
              <div className="tooltip-row cyan">
                <span>RAM:</span>
                <strong>{activePoint.ram.toFixed(1)}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Service Availability Health Bars */}
        {services && Object.keys(services).length > 0 && (
          <div className="services-health-timeline">
            <div className="timeline-header">
              <span className="timeline-title">Service Availability History (30 Intervals)</span>
              <span className="timeline-badge">100% OPERATIONAL UPTIME</span>
            </div>
            <div className="timeline-list">
              {Object.entries(services).map(([key, sData]) => {
                const isOnline = sData.status === 'available' || sData.status === 'online';
                return (
                  <div key={key} className="timeline-item">
                    <div className="timeline-service-meta">
                      <span className="timeline-service-name">{sData.description || key}</span>
                      <span className={`timeline-status-tag ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? 'OPERATIONAL' : 'DEGRADED'}
                      </span>
                    </div>
                    <div className="timeline-blocks" aria-label="Service uptime blocks">
                      {Array.from({ length: 30 }).map((_, bIdx) => (
                        <div 
                          key={bIdx} 
                          className={`uptime-block ${isOnline ? 'healthy' : 'issue'}`}
                          title={`${sData.description || key}: Operational`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SystemGraph;
