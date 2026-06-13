/**
 * Status Terminal UI v1.0
 * Mission-critical status display with silent error handling
 */

class StatusTerminalUI {
  constructor(engine, containerSelector) {
    this.engine = engine;
    this.container = document.querySelector(containerSelector);
    this.messageQueue = [];
    this.displayBuffer = [];
    this.MAX_MESSAGES = 10;

    // Subscribe to all state changes
    this.engine.subscribe('SESSION_ESTABLISHED', (data) => {
      this._logMessage('SECURE_NODE_SYNCED', 'success', 'INFO');
    });

    this.engine.subscribe('TELEMETRY_COMMITTED', (data) => {
      this._logMessage('DATA_INTEGRITY://VERIFIED', 'success', 'INFO');
    });

    this.engine.subscribe('ERROR_QUEUED', (data) => {
      this._logMessage(`ERROR: ${data.code}`, 'error', data.severity);
    });

    this.engine.subscribe('LIFECYCLE_ADVANCED', (data) => {
      this._logMessage(`LIFECYCLE: Step ${data.step} ACTIVE`, 'info', 'INFO');
    });

    this.engine.subscribe('NONCONFORMITY_RECORDED', (data) => {
      this._logMessage(`NC_RECORDED: ${data.type} | ID: ${data.id}`, 'warn', 'WARN');
    });

    this.engine.subscribe('SERVICE_ADDED_TO_ESTIMATE', (data) => {
      this._logMessage(`SERVICE_ESTIMATE: ${data.serviceId} added to cart`, 'info', 'INFO');
    });
  }

  /**
   * Log message to terminal
   */
  _logMessage(message, type = 'info', severity = 'INFO') {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      severity,
      id: `msg-${Date.now()}`
    };

    this.messageQueue.push(entry);
    if (this.messageQueue.length > this.MAX_MESSAGES) {
      this.messageQueue.shift();
    }

    this._render();
  }

  /**
   * Render terminal UI
   */
  _render() {
    if (!this.container) return;

    const statusColor = {
      success: '#4ade80',
      error: '#f87171',
      info: '#60a5fa',
      warn: '#fbbf24'
    };

    const getState = () => {
      const state = this.engine.getState();
      return {
        sync: state.sync_status,
        integrity: state.data_integrity,
        encryption: state.client_meta.encryption_standard
      };
    };

    const state = getState();

    const terminalHTML = `
      <div class="status-terminal">
        <div class="terminal-header">
          <span class="terminal-title">STATUS://NEXUS_CORE_ENGINE</span>
          <span class="encryption-badge">🔒 ${state.encryption}</span>
        </div>
        <div class="terminal-logs">
          ${this.messageQueue.map(msg => `
            <div class="terminal-line" data-type="${msg.type}">
              <span class="timestamp">[${msg.timestamp}]</span>
              <span class="severity" style="color: ${statusColor[msg.type]}">${msg.severity}</span>
              <span class="message">${msg.message}</span>
            </div>
          `).join('')}
        </div>
        <div class="terminal-status">
          Sync Status: <strong>${state.sync}</strong> | 
          Data Integrity: <strong>${state.integrity}</strong>
        </div>
      </div>
    `;

    this.container.innerHTML = terminalHTML;
  }

  /**
   * Handle silent error with fallback
   */
  handleSilentError(errorCode, fallback) {
    this.engine._queueError(errorCode, fallback.message, 'WARN');
    this._logMessage(`FALLBACK_ACTIVATED: ${errorCode}`, 'warn', 'WARN');
    
    // Execute fallback logic without blocking
    setTimeout(() => {
      try {
        fallback.execute();
      } catch (err) {
        console.error('Fallback execution error:', err);
      }
    }, 0);
  }

  /**
   * Get message history
   */
  getMessageHistory() {
    return [...this.messageQueue];
  }

  /**
   * Clear message history
   */
  clearHistory() {
    this.messageQueue = [];
    this._render();
  }

  /**
   * Export log as JSON
   */
  exportLogs() {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      messages: this.messageQueue,
      engine_state: this.engine.getState()
    }, null, 2);
  }

  /**
   * Pause/Resume rendering
   */
  pauseRendering() {
    this._renderPaused = true;
  }

  resumeRendering() {
    this._renderPaused = false;
    this._render();
  }
}
