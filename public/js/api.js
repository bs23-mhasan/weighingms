// API client for WeighingMS
const API_BASE_URL = 'http://localhost:3000';

class API {
  async getBatches() {
    const response = await fetch(`${API_BASE_URL}/api/batches`);
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return response.json();
  }

  async getBatch(batchId) {
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch batch');
    }
    return response.json();
  }

  async getRecipe(batchId) {
    const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/recipe`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    return response.json();
  }

  async getWeight(scaleType) {
    const scaleId = scaleType === 'PRECISION' ? 'scale-3kg' : 'scale-32kg';
    const response = await fetch(`${API_BASE_URL}/api/scales/${scaleId}/weight`);
    if (!response.ok) {
      throw new Error('Failed to fetch weight');
    }
    return response.json();
  }

  async tareScale(scaleType) {
    const scaleId = scaleType === 'PRECISION' ? 'scale-3kg' : 'scale-32kg';
    const response = await fetch(`${API_BASE_URL}/api/scales/${scaleId}/tare`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to tare scale');
    }
    return response.json();
  }

  async recordWeighing(record) {
    // Simulate successful record creation
    console.log('Recording weighing:', record);
    return { success: true, record_id: 'REC-' + Math.floor(Math.random() * 100000) };
  }

  async recordOverride(override) {
    // Simulate successful override recording
    console.log('Recording override:', override);
    return { success: true, override_id: 'OVR-' + Math.floor(Math.random() * 100000) };
  }

  async generateTicket(ticketData) {
    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });
    if (!response.ok) {
      throw new Error('Failed to generate ticket');
    }
    return response.json();
  }

  async loadInitialData() {
    // Load initial data for the application
    const batches = await this.getBatches();
    // Set default batch to first released batch
    const releasedBatches = batches.filter(b => b.status === 'RELEASED');
    if (releasedBatches.length > 0) {
      await this.getRecipe(releasedBatches[0].batch_id);
    }
  }
}