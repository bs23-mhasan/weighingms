const express = require('express');
const router = express.Router();

// Live weight simulation endpoints
let precisionWeight = 0;
let floorWeight = 0;

// Helper to simulate gradual weight increase
setInterval(() => {
  if (precisionWeight < 1250) {
    precisionWeight += 3;
    if (precisionWeight > 1250) precisionWeight = 1250;
  }
}, 1000);

setInterval(() => {
  if (floorWeight < 24000) {
    floorWeight += 8;
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
    unit: 'g',
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
  res.json({ success: true, message: `Scale ${req.params.scaleId} tared` });
});

module.exports = router;