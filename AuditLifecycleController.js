/**
 * Audit Lifecycle Controller v1.0
 * 8-step ISO 27001 audit process with nonconformity tracking
 */

class AuditLifecycleController {
  constructor(engine) {
    this.engine = engine;
    this.lifecycle_map = [
      {
        step: 1,
        name: 'Pre-Audit Planning',
        en: 'Pre-Audit Planning',
        bn: 'অডিট-পূর্ব পরিকল্পনা',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 2,
        name: 'Opening Meeting',
        en: 'Opening Meeting',
        bn: 'প্রারম্ভিক মিটিং',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 3,
        name: 'On-Site Audit',
        en: 'On-Site Audit',
        bn: 'সাইট-ভিত্তিক অডিট',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 4,
        name: 'Findings Documentation',
        en: 'Findings Documentation',
        bn: 'অনুসন্ধান নথিভুক্তকরণ',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 5,
        name: 'Closing Meeting',
        en: 'Closing Meeting',
        bn: 'সমাপনী মিটিং',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 6,
        name: 'Corrective Action Phase',
        en: 'Corrective Action Phase',
        bn: 'সংশোধনমূলক কর্ম পর্যায়',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 7,
        name: 'Re-Audit & Certification',
        en: 'Re-Audit & Certification',
        bn: 'পুনঃঅডিট ও সার্টিফিকেশন',
        state: 'PENDING',
        completionCheck: null
      },
      {
        step: 8,
        name: 'Post-Cert Surveillance',
        en: 'Post-Cert Surveillance',
        bn: 'সার্টিফিকেশন-পরবর্তী নজরদারি',
        state: 'PENDING',
        completionCheck: null
      }
    ];

    this.nonconformity_matrix = {
      MAJOR: { count: 0, resolved: 0, details: [] },
      MINOR: { count: 0, resolved: 0, details: [] }
    };

    this.active_step = 0;
  }

  /**
   * Advance lifecycle to specific step
   */
  advanceToStep(stepNumber, metadata = {}) {
    if (stepNumber < 1 || stepNumber > 8) return false;

    // Mark all previous steps as COMPLIANCE_PASSED
    for (let i = 0; i < stepNumber - 1; i++) {
      this.lifecycle_map[i].state = 'COMPLIANCE_PASSED';
      this.lifecycle_map[i].completionCheck = metadata.timestamp || Date.now();
    }

    // Set current step to ACTIVE
    this.lifecycle_map[stepNumber - 1].state = 'ACTIVE';
    this.active_step = stepNumber;

    // Emit state change
    this.engine._emit('LIFECYCLE_ADVANCED', {
      step: stepNumber,
      name: this.lifecycle_map[stepNumber - 1].name,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Record nonconformity finding
   */
  recordNonconformity(type, details) {
    if (!['MAJOR', 'MINOR'].includes(type)) return false;

    const ncEntry = {
      id: `NC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      details,
      recorded_step: this.active_step,
      recorded_at: Date.now(),
      resolved: false,
      resolution_evidence: null
    };

    this.nonconformity_matrix[type].count++;
    this.nonconformity_matrix[type].details.push(ncEntry);

    this.engine._emit('NONCONFORMITY_RECORDED', ncEntry);
    return ncEntry.id;
  }

  /**
   * Resolve nonconformity with evidence
   */
  resolveNonconformity(ncId, evidence) {
    for (let type of ['MAJOR', 'MINOR']) {
      const nc = this.nonconformity_matrix[type].details.find(n => n.id === ncId);
      if (nc) {
        nc.resolved = true;
        nc.resolution_evidence = evidence;
        this.nonconformity_matrix[type].resolved++;
        this.engine._emit('NONCONFORMITY_RESOLVED', { ncId, type });
        return true;
      }
    }
    return false;
  }

  /**
   * Get lifecycle summary
   */
  getLifecycleSummary() {
    return {
      current_step: this.active_step,
      steps: this.lifecycle_map.map(s => ({
        step: s.step,
        name: s.name,
        state: s.state,
        completed_at: s.completionCheck
      })),
      progress_percentage: Math.round((this.active_step / 8) * 100),
      nonconformities: {
        major_total: this.nonconformity_matrix.MAJOR.count,
        major_resolved: this.nonconformity_matrix.MAJOR.resolved,
        minor_total: this.nonconformity_matrix.MINOR.count,
        minor_resolved: this.nonconformity_matrix.MINOR.resolved,
        overall_resolution_rate: this._calculateResolutionRate()
      }
    };
  }

  /**
   * Calculate resolution rate
   */
  _calculateResolutionRate() {
    const total = this.nonconformity_matrix.MAJOR.count + this.nonconformity_matrix.MINOR.count;
    if (total === 0) return 0;
    const resolved = this.nonconformity_matrix.MAJOR.resolved + this.nonconformity_matrix.MINOR.resolved;
    return Math.round((resolved / total) * 100);
  }

  /**
   * Render lifecycle UI
   */
  renderLifecycleUI(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = this.lifecycle_map.map((step, idx) => `
      <div class="timeline-item" data-step="${step.step}" data-state="${step.state}">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h3>${step.step}. ${step.name}</h3>
          <p class="timeline-state">Status: <span class="state-badge ${step.state}">${step.state}</span></p>
          ${step.completionCheck ? `<p class="timeline-completion">✓ Completed</p>` : ''}
        </div>
      </div>
    `).join('');

    // Apply dynamic state styling via CSS variables
    document.documentElement.style.setProperty('--active-step', this.active_step);
  }

  /**
   * Get all nonconformities
   */
  getAllNonconformities() {
    return {
      major: this.nonconformity_matrix.MAJOR.details,
      minor: this.nonconformity_matrix.MINOR.details
    };
  }

  /**
   * Get nonconformity by ID
   */
  getNonconformityById(ncId) {
    for (let type of ['MAJOR', 'MINOR']) {
      const nc = this.nonconformity_matrix[type].details.find(n => n.id === ncId);
      if (nc) return nc;
    }
    return null;
  }

  /**
   * Reset lifecycle
   */
  reset() {
    this.lifecycle_map.forEach(step => {
      step.state = 'PENDING';
      step.completionCheck = null;
    });
    this.nonconformity_matrix = {
      MAJOR: { count: 0, resolved: 0, details: [] },
      MINOR: { count: 0, resolved: 0, details: [] }
    };
    this.active_step = 0;
    this.engine._emit('LIFECYCLE_RESET', {});
  }
}
