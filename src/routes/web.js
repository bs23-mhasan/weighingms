const express = require('express');
const router = express.Router();

// Live weight simulation endpoint
let precisionWeight = 0;
let floorWeight = 0;

// Helper to simulate gradual weight increase
setInterval(() => {
  if (precisionWeight < 32) {
    precisionWeight += 0.1;
    if (precisionWeight > 1.5) precisionWeight = 1.5;
  }
}, 1000);

setInterval(() => {
  if (floorWeight < 1) {
    floorWeight += 0.2;
  }
}, 2000);

// Scale weight endpoint with live simulation
router.get('/scales/:scaleId/weight', (req, res) => {
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
    unit: 'kg',
    stable: true,
    timestamp: new Date().toISOString()
  });
});

router.post('/scales/:scaleId/tare', (req, res) => {
  if (req.params.scaleId === 'scale-3kg') {
    precisionWeight = 0;
  } else if (req.params.scaleId === 'scale-32kg') {
    floorWeight = 0;
  }
  res.json({ success: true, message: `Scale ${req.params.scaleId} tared`, current_weight: (req.params.scaleId === 'scale-3kg' ? precisionWeight : floorWeight) });
});

module.exports = router;