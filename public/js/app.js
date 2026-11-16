// WeighingMS Application Logic
const { State } = require('./state.js');
const { API } = require('./api.js');

class WeighingMSApp {
  constructor() {
    this.state = new State();
    this.api = new API();
    this.isRunning = false;
    this.weightInterval = null;
    this.updateInterval = null;
  }

  async init() {
    await this.api.loadInitialData();
    this.attachEventListeners();
    this.startLiveWeightSimulation();
    this.startUIUpdates();
  }

  attachEventListeners() {
    // Batch selection
    document.querySelectorAll('.q tbody tr').forEach(row => {
      row.addEventListener('click', () => {
        const batchId = row.dataset.batchId;
        this.selectBatch(batchId);
      });
    });

    // Component selection in recipe list
    document.querySelectorAll('.comps .comp').forEach(comp => {
      comp.addEventListener('click', () => {
        const compId = comp.dataset.compId;
        this.selectComponent(compId);
      });
    });

    // Scale tare button
    document.getElementById('tare-btn')?.addEventListener('click', () => {
      this.performTare();
    });

    // Weight confirmation
    document.getElementById('btn-ok')?.addEventListener('click', () => {
      this.confirmWeight();
    });

    // Supervisor override
    document.getElementById('btn-override')?.addEventListener('click', () => {
      this.authorizeOverride();
    });

    // Simulation controls
    document.getElementById('sim-ok')?.addEventListener('click', () => {
      this.simulateDispense();n    });

    document.getElementById('sim-over')?.addEventListener('click', () => {
      this.simulateOvershoot();
    });

    document.getElementById('sim-reset')?.addEventListener('click', () => {
      this.resetSimulation();
    });
  }

  async selectBatch(batchId) {
    try {
      const batch = await this.api.getBatch(batchId);
      const recipe = await this.api.getRecipe(batchId);
      this.state.setCurrentBatch(batch);
      this.state.setRecipe(recipe);
      this.updateUIForBatchSelection();
      this.updateComponentList();
      this.showView('weigh');
    } catch (error) {
      console.error('Failed to select batch:', error);
      this.showNotification('Error selecting batch', 'error');
    }
  }

  selectComponent(compId) {
    const component = this.state.getCurrentComponent(compId);
    if (!component) return;

    // Update active component
    this.state.setActiveComponent(compId);
    this.updateComponentList();
    this.updateWeightDisplay();
    this.updateProgressBar();
  }

  updateUIForBatchSelection() {
    const batch = this.state.getCurrentBatch();
    if (!batch) return;

    // Update breadcrumb
    document.querySelector('.crumb b').textContent = batch.batch_id;
    document.querySelector('.crumb span:last-child b').textContent = batch.shade_desc;

    // Update operator info
    document.querySelector('.op-chip b').textContent = 'R. Karim'; // Simulated
    document.querySelector('.op-chip span').textContent = 'Shift A';

    // Update scale info for each component
    this.state.getCurrentRecipe().components.forEach(comp => {
      const scaleType = comp.scale_type;
      const scaleBadge = document.querySelector(`.comp[data-comp-id="${comp.component_id}"] .scale-info`);
      if (scaleBadge) {
        scaleBadge.textContent = scaleType === 'PRECISION' ? '3 kg precision' : '32 kg floor';
      }
    });
  }

  updateComponentList() {
    const compsContainer = document.querySelector('.comps');
    compsContainer.innerHTML = '';

    this.state.getCurrentRecipe().components.forEach(comp => {
      const compElement = document.createElement('li');
      compElement.className = 'comp';
      compElement.dataset.compId = comp.component_id;
      if (comp.component_id === this.state.getActiveComponent()?.component_id) {
        compElement.dataset.state = 'active';
      } else if (comp.state === 'done') {
        compElement.dataset.state = 'done';
      } else {
        compElement.dataset.state = 'pending';
      }

      const color = comp.color || '#ccc';
      const lot = comp.lot || 'N/A';
      const container = comp.container || 'N/A';
      const tare = comp.tare || 0;

      compElement.innerHTML = `
        <div class="comp-left">
          <div class="color" style="background: ${color}"></div>
          <div class="name">${comp.name}</div>
          <div class="code">${comp.code}</div>
        </div>
        <div class="comp-right">
          <div class="qty">${comp.target_qty} ${comp.unit}</div>
          <div class="sub">LOT ${lot} · C-12 · TARE ${tare} g</div>
          <div class="scale-info">${comp.scale_type === 'PRECISION' ? '3 kg precision' : '32 kg floor'}</div>
        Dale dev«002>
        <div class="st">${comp.state === 'active' ? '▶ Weighing' : comp.state === 'done' ? '✓ Done' : '○ Pending'}</div>
        Dale dev«002>
      </div>
    `;

      compsContainer.appendChild(compElement);
    });

    // Update done count
    const doneCount = this.state.getCurrentRecipe().components.filter(c => c.state === 'done').length;
    document.querySelector('#rail-done').textContent = `${doneCount}`;

    // Update remaining components count
    document.querySelector('.rail-head .m').textContent = `${doneCount} of ${this.state.getCurrentRecipe().components.length} components weighed`;
  }

  updateWeightDisplay() {
    const component = this.state.getActiveComponent();
    if (!component) return;

    // Update component name
    document.querySelector('#w-name').textContent = component.name;

    // Update target weight
    document.querySelector('#w-target').textContent = component.target_qty;

    // Update unit
    const unit = component.unit;
    document.querySelector('#u3').textContent = unit;

    // Update scale badge
    const scaleBadge = document.queryە3.
      scale-badge .v').textContent = component.scale_type === 'PRECISION'
        ? '3 kg precision' : '32 kg floor';

    // Get current weight from API
    this.api.getWeight(component.scale_type)
      .then(weight => {
        this.updateWeightDisplayForComponent(component, weight);
      });
  }

  updateWeightDisplayForComponent(component, weight) {
    const cell = document.querySelector('#cell-live');
    const weightSpan = document.querySelector('#w-now');
    const unitSpan = document.querySelector('#u1');
    const bar = document.querySelector('#bar');
    const fill = document.querySelector('#fill');
    const targetLine = document.querySelector('#tline');
    const toleranceSpan = document.querySelector('#cap-band');
    const statusSpan = document.querySelector('#status');

    // Update weight display
    weightSpan.textContent = weight.toFixed(1);
    unitSpan.textContent = component.unit === 'g' ? 'g' : 'kg';

    // Determine zone based on weight
    const zone = this.calculateWeightZone(weight, component);

    // Update cell class
    cell.dataset.zone = zone;

    // Update progress bar
    const max = component.max || (component.unit === 'g' ? 2000 : 32000);
    const pct = Math.min(100, (weight / max) * 100);
    fill.style.width = `${pct}%`;

    // Calculate tolerance band positions
    const lo = ((component.target_qty - component.tol) / max) * 100;
    const hi = ((component.target_qty + component.tol) / max) * 100;
    targetLine.style.left = `${lo}%`;
    targetLine.style.right = `${100 - hi}%`;

    // Update tolerance display
    toleranceSpan.textContent = `TOLERANCE ±${component.tol} ${component.unit} (${(component.target_qty - component.tol).toFixed(1)} – ${(component.target_qty + component.tol).toFixed(1)} ${component.unit})`;

    // Update status
    const statusText = this.getStatusText(zone);
    statusSpan.textContent = statusText;
    statusSpan.className = `status-line ${zone}`;

    // Update component state if weight is within tolerance
    if (zone === 'ok' && component.state !== 'done') {
      component.state = 'done';
      this.updateComponentList();
      this.checkAllComponentsDone();
    }
  }

  calculateWeightZone(weight, component) {
    if (weight < (component.target_qty - component.tol)) {
      return 'under';
    } else if (weight > (component.target_qty + component.tol)) {
      return 'over';
    } else {
      return 'ok';
    }
  }

  getStatusText(zone) {
    switch (zone) {
      case 'under': return 'BELOW TOLERANCE';
      case 'ok': return 'WITHIN TOLERANCE';
      case 'over': return 'OVER TOLERANCE';
      default: return 'UNKNOWN';
    }
  }

  updateProgressBar() {
    const doneCount = this.state.getCurrentRecipe().components.filter(c => c.state === 'done').length;
    const totalCount = this.state.getCurrentRecipe().components.length;
    const pct = (doneCount / totalCount) * 100;

    document.querySelector('#rail-done').textContent = `${doneCount}`;
    document.querySelector('.rail-head .m').textContent = `${doneCount} of ${totalCount} components weighed`;
  }

  startLiveWeightSimulation() {
    // Poll weight API every 500ms for live simulation
    setInterval(() => {
      const activeComponent = this.state.getActiveComponent();
      if (activeComponent) {
        this.api.getWeight(activeComponent.scale_type)
          .then(weight => {
            this.updateWeightDisplayForComponent(activeComponent, weight);
          });
      }
    }, 500);
  }

  startUIUpdates() {
    // Update time display
    setInterval(() => {
      const now = new Date();
      document.querySelector('.op-chip span').textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }, 60000);
  }

  showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.querySelector(`#${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update segment buttons
    document.querySelectorAll('.seg button').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
    });

    const activeButton = document.querySelector(`.seg button[data-view="${viewName}"]`);
    if (activeButton) {
      activeButton.setAttribute('aria-pressed', 'true');
    }
  }

  async performTare() {
    const component = this.state.getActiveComponent();
    if (!component) return;

    try {
      await this.api.tareScale(component.scale_type);
      this.showNotification('Scale tared successfully', 'success');
    } catch (error) {
      console.error('Failed to tare scale:', error);
      this.showNotification('Failed to tare scale', 'error');
    }
  }

  async confirmWeight() {
    const component = this.state.getActiveComponent();
    if (!component || component.state !== 'active') return;

    const weight = document.querySelector('#w-now').textContent;
    const zone = this.calculateWeightZone(parseFloat(weight), component);

    if (zone !== 'ok') {
      this.showNotification('Cannot confirm weight outside tolerance', 'error');
      return;
    }

    // Record the confirmed weighing
    const record = {
      component_id: component.component_id,
      batch_id: this.state.getCurrentBatch().batch_id,
      target_qty: component.target_qty,
      actual_qty: parseFloat(weight),
      scale_id: component.scale_type === 'PRECISION' ? 'scale-3kg' : 'scale-32kg',
      operator_id: 'OPERATOR-001',
      confirmed_at: new Date().toISOString(),
      lot_id: component.lot,
      container_id: component.container,
      tare_qty: component.tare
    };

    try {
      await this.api.recordWeighing(record);
      component.state = 'done';
      this.updateComponentList();
      this.updateProgressBar();
      this.showNotification('Weight confirmed and recorded', 'success');
      this.checkAllComponentsDone();
    } catch (error) {
      console.error('Failed to record weighing:', error);
      this.showNotification('Failed to record weighing', 'error');
    }
  }

  async authorizeOverride() {
    const component = this.state.getActiveComponent();
    if (!component || component.state !== 'active') return;

    const reason = prompt('Enter reason for supervisor override:');
    if (!reason) return;

    const override = {
      component_id: component.component_id,
      batch_id: this.state.getCurrentBatch().batch_id,
      authorised_by: 'SUPERVISOR-001',
      reason: reason,
      authorised_at: new Date().toISOString()
    };

    try {
      await this.api.recordOverride(override);
      // Allow confirmation despite out-of-tolerance weight
      component.state = 'done';
      this.updateComponentList();
      this.updateProgressBar();
      this.showNotification('Override authorized successfully', 'success');
      this.checkAllComponentsDone();
    } catch (error) {
      console.error('Failed to authorize override:', error);
      this.showNotification('Failed to authorize override', 'error');
    }
  }

  checkAllComponentsDone() {
    const allDone = this.state.getCurrentRecipe().components.every(c => c.state === 'done');
    if (allDone) {
      this.showNotification('All components completed! Generating ticket...', 'success');
      this.generateTicket();
    }
  }

  async generateTicket() {
    const batch = this.state.getCurrentBatch();
    const recipe = this.state.getCurrentRecipe();

    const ticketData = {
      batch_id: batch.batch_id,
      order_ref: batch.order_ref,
      machine_ref: batch.machine_ref,
      shade_code: batch.shade_code,
      date: new Date().toISOString(),
      operator: 'R. Karim',
      components: recipe.components.map(c => ({
        name: c.name,
        target: c.target_qty,
        actual: c.actual,
        lot: c.lot
      })),
      total_components: recipe.components.length
    };

    try {
      const ticket = await this.api.generateTicket(ticketData);
      this.showTicket(ticket);
      this.updateBatchStatus(batch.batch_id);
    } catch (error) {
      console.error('Failed to generate ticket:', error);
      this.showNotification('Failed to generate ticket', 'error');
    }
  }

  showTicket(ticket) {
    const ticketView = document.getElementById('v-done');
    ticketView.innerHTML = `
      <div class="ticket-content">
        <h2>Weighing Ticket - ${ticket.ticket_id}</h2>
        <div class="ticket-details">
          <div class="detail-row">
            <span class="label">Batch:</span>
            <span class="value">${ticket.data.batch_id}</span>
          </div>
          <div class="detail-row">
            <span class="label">Order:</span>
            <span class="value">${ticket.data.order_ref}</span>
          </div>
          <div class="detail-row">
            <span class="label">Machine:</span>
            <span class="value">${ticket.data.machine_ref}</span>
          </div>
          <div class="detail-row">
            <span class="label">Shade:</span>
            <span class="value">${ticket.data.shade_code}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span class="value">${new Date(ticket.data.date).toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Operator:</span>
            <span class="value">${ticket.data.operator}</span>
          </div>
        </div>
        <div class="components-summary">
          <h3>Components Weighed:</h3>
          <table class="ticket-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Lot</th>
              </tr>
            </thead>
            <tbody>
              ${ticket.data.components.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.target} ${this.state.getCurrentRecipe().components.find(comp => comp.name === c.name)?.unit || 'g'}</td>
                  <td>${c.actual} ${this.state.getCurrentRecipe().components.find(comp => comp.name === c.name)?.unit || 'g'}</td>
                  <td>${c.lot}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn primary" onclick="window.print()">Print Ticket</button>
      </div>
    `;

    this.showView('done');
  }

  updateBatchStatus(batchId) {
    const batch = this.state.getCurrentBatch();
    if (batch && batch.batch_id === batchId) {
      batch.status = 'WEIGHED';
      const batchElement = document.querySelector(`.q tr[data-batch-id="${batchId}"]`);
      if (batchElement) {
        const statusCell = batchElement.querySelector('td:last-child span');
        if (statusCell) {
          statusCell.className = 'tag now';
          statusCell.textContent = 'WEIGHING';
        }
      }
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  simulateDispense() {
    const component = this.state.getActiveComponent();
    if (!component) return;

    // Simulate gradual weight increase
    let currentWeight = 0;
    const targetWeight = component.target_qty;
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const animateWeight = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      currentWeight = targetWeight * progress;

      this.updateWeightDisplayForComponent(component, currentWeight);

      if (progress < 1) {
        requestAnimationFrame(animateWeight);
      }
    };

    animateWeight();
  }

  simulateOvershoot() {
    const component = this.state.getActiveComponent();
    if (!component) return;

    // Simulate weight that overshoots tolerance
    let currentWeight = component.tolerance_max + 10; // 10g over tolerance

    this.updateWeightDisplayForComponent(component, currentWeight);

    // Show compensation panel
    const compensationPanel = document.querySelector('.compensation-panel');
    compensationPanel.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      compensationPanel.style.display = 'none';
    }, 3000);
  }

  resetSimulation() {
    const activeComponent = this.state.getActiveComponent();
    if (activeComponent) {
      activeComponent.actual = null;
      activeComponent.state = activeComponent.state === 'done' ? 'done' : 'pending';
    }

    this.updateWeightDisplay();
    this.updateComponentList();

    this.showNotification('Simulation reset', 'info');
  }

  attachEventListeners() {
    super.attachEventListeners();

    // Additional event listeners for simulation controls
    document.getElementById('sim-ok')?.addEventListener('click', () => {
      this.simulateDispense();
    });

    document.getElementById('sim-over')?.addEventListener('click', () => {
      this.simulateOvershoot();
    });

    document.getElementById('sim-reset')?.addEventListener('click', () => {
      this.resetSimulation();
    });

    // Pin toggle
    const pinToggle = document.getElementById('pin-toggle');
    if (pinToggle) {
      pinToggle.addEventListener('change', () => {
        document.body.classList.toggle('pins', pinToggle.checked);
      });
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new WeighingMSApp();
  app.init();
});

// Initialize app with configuration
function initApp() {
  const app = new WeighingMSApp();
  return app.init();
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initApp().then(() => {
    console.log('WeighingMS application initialized successfully');
  }).catch(error => {
    console.error('Failed to initialize application:', error);
    // Show user-friendly error message
    var errorDiv = document.createElement('div');
    errorDiv.className = 'notification error';
    errorDiv.textContent = 'Failed to load application. Please refresh the page.';
    document.body.appendChild(errorDiv);
  });
});
