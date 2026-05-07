// Express routes for the load balancer

const express = require('express');
const router = express.Router();
const loadBalancer = require('../src/loadBalancer');
const weightedRegistry = require('../src/weightedNodes');
const healthCheck = require('../src/healthCheck');
const metrics = require('../src/metrics');
const rateLimiter = require('../src/rateLimiter');

// Route an IP using consistent hashing
router.post('/route', rateLimiter.middleware(), (req, res) => {
    try {
        const ip = req.body.ip;
        if (!ip || typeof ip !== 'string') {
            return res.status(400).json({ success: false, error: "IP address is required in body as a string" });
        }
        
        const result = loadBalancer.route(ip);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// List nodes and weights
router.get('/nodes', (req, res) => {
    res.json({ success: true, data: weightedRegistry.getNodesWithStats() });
});

// Add a node
router.post('/nodes/add', (req, res) => {
    const { name, weight } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: "Node 'name' string is required" });
    }
    
    loadBalancer.addNode(name, weight || 1);
    res.json({ success: true, data: { message: `Node ${name} added successfully` } });
});

// Remove a node
router.delete('/nodes/remove', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, error: "Node 'name' string is required" });
    }
    
    loadBalancer.removeNode(name);
    res.json({ success: true, data: { message: `Node ${name} removed successfully` } });
});

// Get health stats
router.get('/health', (req, res) => {
    res.json({ success: true, data: healthCheck.getHealth() });
});

// Get metrics
router.get('/metrics', (req, res) => {
    res.json({ success: true, data: metrics.getMetrics() });
});

// Reset metrics
router.delete('/metrics/reset', (req, res) => {
    metrics.reset();
    res.json({ success: true, data: { message: "Metrics reset successfully" } });
});

// Run a quick traffic simulation
router.post('/simulate', (req, res) => {
    const count = parseInt(req.body.count) || 10;
    const results = [];
    
    try {
        for (let i = 0; i < count; i++) {
            const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            const result = loadBalancer.route(ip);
            results.push(result);
        }
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
