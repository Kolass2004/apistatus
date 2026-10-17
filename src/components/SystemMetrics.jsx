import React from 'react';
import { Cpu, HardDrive, Layers, Zap, Clock, Thermometer, RotateCcw, Battery, BatteryCharging } from 'lucide-react';

const SystemMetrics = ({ system, lastCheckedAt, cacheAgeSeconds }) => {
  if (!system) return null;

  const { uptime, cpu_usage, ram, disk, temperature, battery, power } = system;

  // CPU calculation
  const cpuPercent = parseFloat(cpu_usage) || 0;
  const cpuStatusClass = cpuPercent >= 85 ? 'danger' : cpuPercent >= 65 ? 'warning' : 'normal';

  // RAM calculation
  let ramPercent = 0;
  if (ram?.used_bytes && ram?.total_bytes) {
    ramPercent = parseFloat(((ram.used_bytes / ram.total_bytes) * 100).toFixed(1));
  } else if (ram?.used && ram?.total) {
    const usedNum = parseFloat(ram.used) || 0;
    const totalNum = parseFloat(ram.total) || 1;
    ramPercent = parseFloat(((usedNum / totalNum) * 100).toFixed(1));
  }
  const ramStatusClass = ramPercent >= 90 ? 'danger' : ramPercent >= 75 ? 'warning' : 'normal';

  // Disk calculation
  const diskPercent = disk?.used_percent !== undefined 
    ? parseFloat(disk.used_percent) 
    : (disk?.used_bytes && disk?.total_bytes 
        ? parseFloat(((disk.used_bytes / disk.total_bytes) * 100).toFixed(1)) 
        : 0);
  const diskStatusClass = diskPercent >= 90 ? 'danger' : diskPercent >= 75 ? 'warning' : 'normal';

  // Battery & Power calculation
  const batteryPercent = battery?.percent ?? null;
  const isAcOnline = power?.ac_online ?? true;
  const isCharging = battery?.status?.toLowerCase().includes('charging') && !battery?.status?.toLowerCase().includes('not');

  // Format last checked timestamp if available
  const formattedCheckedTime = lastCheckedAt 
    ? new Date(lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <section className="telemetry-section" aria-label="System Telemetry">
      <div className="section-header">
        <div className="section-title-group">
      
          <h2 className="section-heading">Host Telemetry</h2>
          <span className="section-subtag">Server Health</span>
        </div>

        <div className="telemetry-vitals">
          {uptime && (
            <div className="vital-item" title="Server Uptime">
              <Clock size={13} className="vital-icon" />
              <span className="vital-label">Uptime:</span>
              <span className="vital-value">{uptime}</span>
            </div>
          )}

          {temperature !== null && temperature !== undefined && (
            <div className="vital-item" title="Thermal Status">
              <Thermometer size={13} className="vital-icon" />
              <span className="vital-label">Temp:</span>
              <span className="vital-value">
                {typeof temperature === 'number' ? `${temperature}°C` : temperature}
              </span>
            </div>
          )}

          {cacheAgeSeconds !== undefined && cacheAgeSeconds !== null && (
            <div className="vital-item" title="API Cache Freshness">
              <RotateCcw size={13} className="vital-icon" />
              <span className="vital-label">Cache:</span>
              <span className="vital-value">{Math.round(cacheAgeSeconds)}s ago</span>
            </div>
          )}

          {formattedCheckedTime && (
            <div className="vital-item" title="Server Polled Time">
              <span className="vital-label">Polled:</span>
              <span className="vital-value">{formattedCheckedTime}</span>
            </div>
          )}
        </div>
      </div>

      <div className="telemetry-grid">
        {/* CPU Utilization Card */}
        <div className={`metric-card ${cpuStatusClass}`}>
          <div className="metric-header">
            <div className="metric-title-group">
              <Cpu size={16} className="metric-icon" />
              <span className="metric-name">CPU Load</span>
            </div>
            <span className={`metric-badge ${cpuStatusClass}`}>
              {cpuPercent >= 85 ? 'HIGH' : cpuPercent >= 65 ? 'MODERATE' : 'OPTIMAL'}
            </span>
          </div>

          <div className="metric-body">
            <div className="metric-primary-val">
              {cpu_usage || `${cpuPercent}%`}
            </div>
            <div className="metric-progress-track" role="progressbar" aria-valuenow={cpuPercent} aria-valuemin="0" aria-valuemax="100">
              <div 
                className={`metric-progress-bar ${cpuStatusClass}`} 
                style={{ width: `${Math.min(Math.max(cpuPercent, 2), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-footer">
            <span className="metric-subtext">Host Processor Active</span>
            <span className="metric-subval">{cpuPercent}% utilized</span>
          </div>
        </div>

        {/* Memory / RAM Card */}
        <div className={`metric-card ${ramStatusClass}`}>
          <div className="metric-header">
            <div className="metric-title-group">
              <Layers size={16} className="metric-icon" />
              <span className="metric-name">Memory (RAM)</span>
            </div>
            <span className={`metric-badge ${ramStatusClass}`}>
              {ramStatusClass === 'danger' ? 'CRITICAL' : ramStatusClass === 'warning' ? 'ELEVATED' : 'STABLE'}
            </span>
          </div>

          <div className="metric-body">
            <div className="metric-primary-val">
              {ram?.used || '0G'} <span className="metric-total-val">/ {ram?.total || '0G'}</span>
            </div>
            <div className="metric-progress-track" role="progressbar" aria-valuenow={ramPercent} aria-valuemin="0" aria-valuemax="100">
              <div 
                className={`metric-progress-bar ${ramStatusClass}`} 
                style={{ width: `${Math.min(Math.max(ramPercent, 2), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-footer">
            <span className="metric-subtext">System Memory</span>
            <span className="metric-subval">{ramPercent}% allocated</span>
          </div>
        </div>

        {/* Disk Storage Card */}
        <div className={`metric-card ${diskStatusClass}`}>
          <div className="metric-header">
            <div className="metric-title-group">
              <HardDrive size={16} className="metric-icon" />
              <span className="metric-name">Disk Storage</span>
            </div>
            <span className={`metric-badge ${diskStatusClass}`}>
              {diskStatusClass === 'danger' ? 'LOW SPACE' : diskStatusClass === 'warning' ? 'WARNING' : 'HEALTHY'}
            </span>
          </div>

          <div className="metric-body">
            <div className="metric-primary-val">
              {disk?.used || '0G'} <span className="metric-total-val">/ {disk?.total || '0G'}</span>
            </div>
            <div className="metric-progress-track" role="progressbar" aria-valuenow={diskPercent} aria-valuemin="0" aria-valuemax="100">
              <div 
                className={`metric-progress-bar ${diskStatusClass}`} 
                style={{ width: `${Math.min(Math.max(diskPercent, 2), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-footer">
            <span className="metric-subtext">Root Volume</span>
            <span className="metric-subval">{diskPercent}% used</span>
          </div>
        </div>

        {/* Power & Battery Card */}
        <div className="metric-card normal">
          <div className="metric-header">
            <div className="metric-title-group">
              {isAcOnline ? (
                <Zap size={16} className="metric-icon" />
              ) : isCharging ? (
                <BatteryCharging size={16} className="metric-icon" />
              ) : (
                <Battery size={16} className="metric-icon" />
              )}
              <span className="metric-name">Power & Battery</span>
            </div>
            <span className={`metric-badge ${isAcOnline ? 'normal' : batteryPercent < 20 ? 'danger' : 'warning'}`}>
              {isAcOnline ? 'AC ONLINE' : 'ON BATTERY'}
            </span>
          </div>

          <div className="metric-body">
            <div className="metric-primary-val">
              {batteryPercent !== null ? `${batteryPercent}%` : (isAcOnline ? 'AC Connected' : 'Running')}
              {batteryPercent !== null && (
                <span className="metric-total-val"> {isAcOnline ? '(Wall Power)' : '(Battery)'}</span>
              )}
            </div>
            <div className="metric-progress-track" role="progressbar" aria-valuenow={batteryPercent || 100} aria-valuemin="0" aria-valuemax="100">
              <div 
                className={`metric-progress-bar ${batteryPercent && batteryPercent <= 20 && !isAcOnline ? 'danger' : 'normal'}`} 
                style={{ width: `${Math.min(Math.max(batteryPercent ?? 100, 2), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-footer">
            <span className="metric-subtext" title={power?.source || ''}>
              {power?.source || 'Direct Wall Power'}
            </span>
            <span className="metric-subval">
              {battery?.status || (isAcOnline ? 'Continuous' : 'Discharging')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemMetrics;
