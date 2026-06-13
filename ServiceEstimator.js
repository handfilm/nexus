/**
 * Service Estimator v1.0
 * Productized service calculator with bundling logic
 */

class ServiceEstimator {
  constructor(engine) {
    this.engine = engine;
    this.service_portfolio = {
      gap_assessment: {
        id: 'GAP',
        name: 'Gap Assessment',
        en: 'Gap Assessment',
        bn: 'ফাঁক মূল্যায়ন',
        description_en: 'Identify security gaps against ISO 27001 standard',
        description_bn: 'ISO 27001 মান অনুযায়ী নিরাপত্তা ফাঁক চিহ্নিত করুন',
        base_price: 150000,
        max_price: 300000,
        duration_days: 7,
        scope: 'Infrastructure analysis, risk identification'
      },
      full_audit_cert: {
        id: 'FULL',
        name: 'Full Audit & Certification',
        en: 'Full Audit & Certification',
        bn: 'সম্পূর্ণ অডিট ও সার্টিফিকেশন',
        description_en: 'Complete ISO 27001 audit against all 14 clauses',
        description_bn: 'সমস্ত 14টি ক্লজের বিপরীতে সম্পূর্ণ ISO 27001 অডিট',
        base_price: 800000,
        max_price: 1500000,
        duration_days: 45,
        scope: 'All 14 clauses + 93 controls, certification'
      },
      surveillance: {
        id: 'SURV',
        name: 'Surveillance Audit',
        en: 'Surveillance Audit (2/yr)',
        bn: 'নজরদারি অডিট',
        description_en: 'Post-certification audits (2 per year)',
        description_bn: 'সার্টিফিকেশন-পরবর্তী অডিট (বছরে 2টি)',
        base_price: 300000,
        max_price: 500000,
        duration_days: 30,
        scope: 'Post-cert compliance verification'
      },
      vendor_security: {
        id: 'VEND',
        name: 'Vendor Security Audit',
        en: 'Vendor Security Audit',
        bn: 'বিক্রেতা নিরাপত্তা অডিট',
        description_en: 'Third-party security assessment',
        description_bn: 'তৃতীয় পক্ষের মূল্যায়ন',
        base_price: 250000,
        max_price: 400000,
        duration_days: 21,
        scope: 'Third-party assessment'
      },
      compliance_consulting: {
        id: 'CONS',
        name: 'Compliance Consulting',
        en: 'Compliance Consulting',
        bn: 'সম্মতি পরামর্শ',
        description_en: 'Post-audit implementation support',
        description_bn: 'অডিট-পরবর্তী সহায়তা',
        base_price: 500000,
        max_price: 1200000,
        duration_days: 60,
        scope: 'Implementation support, training'
      },
      digital_transform: {
        id: 'DIGIT',
        name: 'Digital Transformation Audit',
        en: 'Digital Transformation Audit',
        bn: 'ডিজিটাল রূপান্তর অডিট',
        description_en: 'Security assessment during digital migration',
        description_bn: 'ডিজিটাল মাইগ্রেশনের সময় নিরাপত্তা মূল্যায়ন',
        base_price: 1000000,
        max_price: 2000000,
        duration_days: 90,
        scope: 'Cloud, APIs, AI integration security'
      }
    };

    this.cart = [];
  }

  /**
   * Add service to estimation cart
   */
  addServiceToEstimate(serviceId) {
    if (!(serviceId in this.service_portfolio)) return false;
    
    const service = this.service_portfolio[serviceId];
    this.cart.push({
      service_id: serviceId,
      added_at: Date.now(),
      quantity: 1
    });

    this.engine._emit('SERVICE_ADDED_TO_ESTIMATE', { serviceId });
    return true;
  }

  /**
   * Remove service from cart
   */
  removeServiceFromEstimate(serviceId) {
    const idx = this.cart.findIndex(item => item.service_id === serviceId);
    if (idx > -1) {
      this.cart.splice(idx, 1);
      this.engine._emit('SERVICE_REMOVED_FROM_ESTIMATE', { serviceId });
      return true;
    }
    return false;
  }

  /**
   * Generate combined estimate
   */
  generateEstimate() {
    if (this.cart.length === 0) return null;

    let total_price = 0;
    let total_duration = 0;
    let scope_aggregated = [];
    let regulatory_boundaries = ['ISO 27001'];

    this.cart.forEach(item => {
      const service = this.service_portfolio[item.service_id];
      const item_price = service.base_price * item.quantity;
      total_price += item_price;
      total_duration += service.duration_days * item.quantity;
      scope_aggregated.push(service.scope);

      // Add regulatory boundaries
      if (item.service_id === 'digital_transform') {
        if (!regulatory_boundaries.includes('GDPR')) regulatory_boundaries.push('GDPR');
        if (!regulatory_boundaries.includes('SOC 2')) regulatory_boundaries.push('SOC 2');
      }
    });

    // Apply bundle discount
    let discount = 0;
    if (this.cart.length >= 5) discount = 0.10;
    else if (this.cart.length >= 3) discount = 0.05;

    const final_price = Math.round(total_price * (1 - discount));

    return {
      services_selected: this.cart.map(item => this.service_portfolio[item.service_id].name),
      price_breakdown: {
        subtotal: total_price,
        discount_percent: Math.round(discount * 100),
        discount_amount: total_price - final_price,
        final_price: final_price
      },
      timeline: {
        total_days: total_duration,
        start_date: new Date().toISOString(),
        target_completion: new Date(Date.now() + total_duration * 24 * 60 * 60 * 1000).toISOString()
      },
      scope_summary: scope_aggregated,
      regulatory_compliance: regulatory_boundaries,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Render service cards with selection UI
   */
  renderServiceCards(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = Object.entries(this.service_portfolio).map(([key, service]) => `
      <div class="service-card" data-service-id="${key}">
        <h3>${service.name}</h3>
        <p>${service.scope}</p>
        <div class="service-pricing">
          <span class="price-range">৳${service.base_price.toLocaleString()} - ৳${service.max_price.toLocaleString()}</span>
          <span class="duration">${service.duration_days} days</span>
        </div>
        <button class="btn-add-to-estimate" onclick="NEXUS_Estimator.addServiceToEstimate('${key}'); NEXUS_Estimator.renderEstimateSummary('#estimate-summary-container');">
          + Add to Estimate
        </button>
      </div>
    `).join('');
  }

  /**
   * Render estimate summary
   */
  renderEstimateSummary(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const estimate = this.generateEstimate();
    if (!estimate) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="estimate-summary">
        <h3 class="estimate-title">Combined Service Estimate</h3>
        <div class="estimate-details">
          <div class="estimate-detail">
            <div class="estimate-detail-label">Services Selected</div>
            <div class="estimate-detail-value">${estimate.services_selected.length}</div>
          </div>
          <div class="estimate-detail">
            <div class="estimate-detail-label">Total Price</div>
            <div class="estimate-detail-value">৳${estimate.price_breakdown.final_price.toLocaleString()}</div>
          </div>
          <div class="estimate-detail">
            <div class="estimate-detail-label">Timeline</div>
            <div class="estimate-detail-value">${estimate.timeline.total_days} days</div>
          </div>
          <div class="estimate-detail">
            <div class="estimate-detail-label">Discount</div>
            <div class="estimate-detail-value">${estimate.price_breakdown.discount_percent}%</div>
          </div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: rgba(74, 222, 128, 0.1); border-left: 4px solid #4ade80; border-radius: 4px;">
          <button onclick="NEXUS_Estimator.clearCart(); location.reload();" style="background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid #4ade80; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Clear Estimate</button>
        </div>
      </div>
    `;
  }

  /**
   * Get cart summary
   */
  getCartSummary() {
    return {
      items_count: this.cart.length,
      services: this.cart.map(item => this.service_portfolio[item.service_id].name),
      estimate: this.generateEstimate()
    };
  }

  /**
   * Clear cart
   */
  clearCart() {
    this.cart = [];
    this.engine._emit('ESTIMATE_CLEARED', {});
  }

  /**
   * Get service details
   */
  getServiceDetails(serviceId) {
    return this.service_portfolio[serviceId] || null;
  }

  /**
   * Get all services
   */
  getAllServices() {
    return this.service_portfolio;
  }
}
