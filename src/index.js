const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
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
        uom: "g",
        tolerance_pct: 1.0,
        tolerance_min: 1237.5,
        tolerance_max: 1262.5,
        scale_type: "PRECISION",
        is_compensable: true,
        color: "#1f4fa8",
        lot: "2026-0341",
        container: "C-09",
        tare: 214,
        max: 1600
      },
      {
        component_id: "COMP-02",
        sequence: 2,
        dyestuff_id: "DYE-002",
        code: "R-RB",
        name: "Remazol Red RB",
        target_qty: 850.0,
        uom: "g",
        tolerance_pct: 1.0,
        tolerance_min: 841.5,
        tolerance_max: 858.5,
        scale_type: "PRECISION",
        is_compensable: true,
        color: "#b8253a",
        lot: "2026-0298",
        container: "C-11",
        tare: 214,
        max: 520
      },
      {
        component_id: "COMP-03",
        sequence: 3,
        dyestuff_id: "DYE-003",
        code: "Y-RGB",
        name: "Remazol Yellow RGB",
        target_qty: 94.0,
        uom: "g",
        tolerance_pct: 0.5,
        tolerance_min: 93.5,
        tolerance_max: 94.5,
        scale_type: "PRECISION",
        is_compensable: true,
        color: "#d9a520",
        lot: "2026-0387",
        container: "C-12",
        tare: 214,
        max: 125
      },
      {
        component_id: "COMP-04",
        sequence: 4,
        dyestuff_id: "DYE-004",
        code: "NA2SO4",
        name: "Sodium Sulphate",
        target_qty: 24000.0,
        uom: "g",
        tolerance_pct: 0.5,
        tolerance_min: 23880.0,
        tolerance_max: 24120.0,
        scale_type: "FLOOR",
        is_compensable: false,
        color: "#c9d2dc",
        lot: "2026-0112",
        container: "D-03",
        tare: 1850,
        max: 32
      },
      {
        component_id: "COMP-05",
        sequence: 5,
        dyestuff_id: "DYE-005",
        code: "NA2CO3",
        name: "Soda Ash",
        target_qty: 9600.0,
        uom: "g",
        tolerance_pct: 0.5,
        tolerance_min: 9552.0,
        tolerance_max: 9648.0,
        scale_type: "FLOOR",
        is_compensable: false,
        color: "#e4eaf0",
        lot: "2026-0155",
        container: "D-05",
        tare: 1850,
        max: 14
      }
    ]
  }
};

const consumptions = {};

// Mock live weight simulation
let precisionWeight = 0;
let floorWeight = 0;

// Live weight simulation intervals
setInterval(() => {
  precisionWeight += 2;
  if (precisionWeight > 1250) precisionWeight = 0;
}, 1000);

setInterval(() => {
  floorWeight += 5;
  if (floorWeight > 24000) floorWeight = 0;
}, 2000);

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
  res.json([
    { scale_id: "scale-3kg", class: "PRECISION", capacity: 3.0, resolution: 0.001, unit: "kg", status: "OK" },
    { scale_id: "scale-32kg", class: "FLOOR", capacity: 32.0, resolution: 0.01, unit: "kg", status: "OK" }
  ]);
});

// Live weight endpoint with simulation
app.get('/api/scales/:scaleId/weight', (req, res) => {
  const { scaleId } = req.params;
  let weight = 0;

  if (scaleId === 'scale-3kg') {
    weight = precisionWeight;
  } else if (scaleId === 'scale-32kg') {
    weight = floorWeight;
  }

  res.json({
    scale_id: scaleId,
    weight: parseFloat(weight.toFixed(3)),
    unit: 'g',
    stable: true,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/scales/:scaleId/tare', (req, res) => {
  if (req.params.scaleId === 'scale-3kg') {
    precisionWeight = 0;
  } else if (req.params.scaleId === 'scale-32kg') {
    floorWeight = 0;
  }
  res.json({ success: true, message: `Scale ${req.params.scaleId} tared` });
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
