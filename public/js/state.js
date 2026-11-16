// State management for WeighingMS
class State {
  constructor() {
    this.currentBatch = null;
    this.currentRecipe = null;
    this.activeComponent = null;
  }

  setCurrentBatch(batch) {
    this.currentBatch = batch;
  }

  setRecipe(recipe) {
    this.currentRecipe = recipe;
    // Initialize component states based on prototype data
    if (this.currentRecipe && this.currentRecipe.components) {
      this.currentRecipe.components.forEach(comp => {
        comp.state = comp.actual !== null ? 'done' : 'pending';
        if (!comp.actual && comp.sequence === 1) {
          comp.state = 'active';
        }
        if (comp.actual && comp.actual > comp.tolerance_max) {
          comp.state = 'over';
        } else if (comp.actual && comp.actual < comp.tolerance_min) {
          comp.state = 'under';
        }
      });
    }
  }

  setActiveComponent(componentId) {
    if (this.currentRecipe) {
      const component = this.currentRecipe.components.find(c => c.component_id === componentId);
      if (component) {
        this.activeComponent = component;
      }
    }
  }

  getCurrentBatch() {
    return this.currentBatch;
  }

  getCurrentRecipe() {
    return this.currentRecipe;
  }

  getActiveComponent() {
    return this.activeComponent;
  }
}