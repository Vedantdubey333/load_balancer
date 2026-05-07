// Main server file. Sets up Express and routes.

const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', apiRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Load Balancer API running on port ${PORT}`);
    console.log(`========================================`);
    console.log(`Consistent Hashing initialized with nodes: Node-A, Node-B, Node-C`);
});
