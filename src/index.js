// Server setup for WeighingMS Dummy APIs
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files if needed
app.use(express.static(path.join(__dirname, '../public')));

// Mock Data Store
const batches = [
  {
    batch_id: "B-24187",
    order_ref: "SO-9931",
    machine_ref: "JET-04",
    shade_desc: "Teal 4C",
    fabric_weight_kg: 150.0,
    shade_code: "TEAL-4C",
    status: "RELEASED",
    released_at: "2026-11-16T08:00:00Z",
    component_count: 5
  },
  {
    batch_id: "B-24188",
    order_ref: "SO-9932",
    machine_ref: "JET-05",
    shade_desc: "Navy Blue",
    fabric_weight_kg: 200.0,
    shade_code: "NAVY-02",
    status: "RELEASED",
    released_at: "2026-11-16T08:30:00Z",
    component_count: 4
  },
  {
    batch_id: "B-24190",
    order_ref: "SO-9935",
    machine_ref: "BEAM-01",
    shade_desc: "Direct Red",
    fabric_weight_kg: 120.0,
    shade_code: "RED-09",
    status: "RELEASED",
    released_at: "2026-11-16T09:00:00Z",
    component_count: 3
  },
  {
    batch_id: "B-24191",
    order_ref: "SO-9938",
    machine_ref: "JET-01",
    shade_desc: "Bright Yellow",
    fabric_weight_kg: 100.0,
    shade_code: "YEL-03",
    status: "QUEUED",
    released_at: "2026-11-16T10:00:00Z",
    component_count: 4
  }
];

const recipes = {
  "B-24187": {
    recipe_id: "REC-TEAL-4C",
    batch_id: "B-24187",
    shade_code: "TEAL-4C",
    version: "1.0",
    components: [
      {
        component_id: "COMP-01",
        sequence: 1,
        dyestuff_id: "DYE-001",
        code: "RB-RSPL",
        name: "Remazol Brill. Blue RSPL",
        target_qty: 1.250,
        uom: "kg",
        tolerance_pct: 1.0,
        tolerance_min: 1.2375,
        tolerance_max: 1.2625,
        scale_type: "PRECISION",
        is_compensable: true
      },
      {
        component_id: "COMP-02",
        sequence: 2,
        dyestuff_id: "DYE-002",
        code: "R-RB",
        name: "Remazol Red RB",
        target_qty: 0.850,
        uom: "kg",
        tolerance_pct: 1.0,
        tolerance_min: 0.8415,
        tolerance_max: 0.8585,
        scale_type: "PRECISION",
        is_compensable: true
      },
      {
        component_id: "COMP-03",
        sequence: 3,
        dyestuff_id: "DYE-003",
        code: "Y-RGB",
        name: "Remazol Yellow RGB",
        target_qty: 0.094,
        uom: "kg",
        tolerance_pct: 0.5,
        tolerance_min: 0.0935,
        tolerance_max: 0.0945,
        scale_type: "PRECISION",
        is_compensable: true
      },
      {
        component_id: "COMP-04",
        sequence: 4,
        dyestuff_id: "DYE-004",
        code: "NA2SO4",
        name: "Sodium Sulphate",
        target_qty: 32.000,
        uom: "kg",
        tolerance_pct: 2.0,
        tolerance_min: 31.360,
        tolerance_max: 32.640,
        scale_type: "FLOOR",
        is_compensable: false
      },
      {
        component_id: "COMP-05",
        sequence: 5,
        dyestuff_id: "DYE-005",
        code: "NA2CO3",
        name: "Soda Ash",
        target_qty: 5.000,
        uom: "kg",
        tolerance_pct: 2.0,
        tolerance_min: 4.900,
        tolerance_max: 5.100,
        scale_type: "FLOOR",
        is_compensable: false
      }
    ]
  }
};

const consumptions = {};
const scales = {
  "scale-3kg": { scale_id: "scale-3kg", class: "PRECISION", capacity: 3.0, resolution: 0.001, unit: "kg", status: "OK", current_weight: 0.0 },
  "scale-32kg": { scale_id: "scale-32kg", class: "FLOOR", capacity: 32.0, resolution: 0.01, unit: "kg", status: "OK", current_weight: 0.0 }
};

// --- API Endpoints ---

// 1. OrgaTEX Batches API
app.get('/api/batches', (req, res) => {
  const statusFilter = req.query.status;
  if (statusFilter) {
    const filtered = batches.filter(b => b.status.toLowerCase() === statusFilter.toLowerCase());
    return res.json(filtered);
  }
  res.json(batches);
});

app.get('/api/batches/:batchId', (req, res) => {
  const batch = batches.find(b => b.batch_id === req.params.batchId);
  if (!batch) return res.status(404).json({ error: "Batch not found" });
  res.json(batch);
});

app.get('/api/batches/:batchId/recipe', (req, res) => {
  const recipe = recipes[req.params.batchId];
  if (!recipe) return res.status(404).json({ error: "Recipe not found for batch" });
  res.json(recipe);
});

app.post('/api/batches/:batchId/consumption', (req, res) => {
  const { batchId } = req.params;
  const batch = batches.find(b => b.batch_id === batchId);
  if (!batch) return res.status(404).json({ error: "Batch not found" });

  consumptions[batchId] = {
    batch_id: batchId,
    consumed_at: new Date().toISOString(),
    records: req.body.records || []
  };

  batch.status = "WEIGHED";
  res.json({ success: true, message: "Consumption recorded successfully in OrgaTEX", batch_id: batchId });
});

// 2. Scale API
app.get('/api/scales', (req, res) => {
  res.json(Object.values(scales));
});

app.get('/api/scales/:scaleId/weight', (req, res) => {
  const { scaleId } = req.params;
  const scale = scales[scaleId];
  if (!scale) return res.status(404).json({ error: "Scale not found" });

  // Return current weight with a stability flag
  res.json({
    scale_id: scaleId,
    weight: scale.current_weight,
    unit: scale.unit,
    stable: true,
    timestamp: new Date().toISOString()
  });
});

app.use('/', require('./routes/web'));

app.post('/api/scales/:scaleId/weight', (req, res) => {
  const { scaleId } = req.params;
  const { weight } = req.body;
  if (!scales[scaleId]) return res.status(404).json({ error: "Scale not found" });
  scales[scaleId].current_weight = parseFloat(weight) || 0;
  res.json({ success: true, scale_id: scaleId, current_weight: scales[scaleId].current_weight });
});

app.post('/api/scales/:scaleId/tare', (req, res) => {
  const { scaleId } = req.params;
  if (!scales[scaleId]) return res.status(404).json({ error: "Scale not found" });
  scales[scaleId].current_weight = 0;
  res.json({ success: true, message: "Scale tared", scale_id: scaleId });
});

// 3. Printer / Ticket API
app.post('/api/tickets', (req, res) => {
  const ticketData = req.body;
  res.json({
    success: true,
    ticket_id: "TKT-" + Math.floor(Math.random() * 100000),
    printed_at: new Date().toISOString(),
    data: ticketData
  });
});

app.listen(PORT, () => {
  console.log(`WeighingMS Dummy API server running on http://localhost:${PORT}`);
});
