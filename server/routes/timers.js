const express = require('express');
const Timer = require('../models/Timer');
const router = express.Router();

// Example: Shopify shop identifier (replace this with session check!)
function getShop(req) {
  // For demo, shop could come from header. In production use Shopify session.
  return req.header('x-shop') || 'demo-shop.myshopify.com';
}

// Create Timer
router.post('/', async (req, res) => {
  try {
    const shop = getShop(req);
    const data = { ...req.body, shop };
    const timer = await Timer.create(data);
    res.status(201).json(timer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List Timers for shop
router.get('/', async (req, res) => {
  const shop = getShop(req);
  const timers = await Timer.find({ shop }).sort({ createdAt: -1 });
  res.json(timers);
});

// Get single timer
router.get('/:id', async (req, res) => {
  const shop = getShop(req);
  const timer = await Timer.findOne({ _id: req.params.id, shop });
  if (!timer) return res.status(404).json({ error: 'Not found' });
  res.json(timer);
});

// Update timer
router.put('/:id', async (req, res) => {
  const shop = getShop(req);
  const timer = await Timer.findOneAndUpdate(
    { _id: req.params.id, shop },
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );
  if (!timer) return res.status(404).json({ error: 'Not found' });
  res.json(timer);
});

// Delete timer
router.delete('/:id', async (req, res) => {
  const shop = getShop(req);
  await Timer.deleteOne({ _id: req.params.id, shop });
  res.status(204).end();
});

module.exports = router;
