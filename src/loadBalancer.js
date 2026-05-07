// Main Load Balancer that ties everything together

const ConsistentHashRing = require('./consistentHash');
const healthCheck = require('./healthCheck');
const metrics = require('./metrics');
const weightedRegistry = require('./weightedNodes');

class LoadBalancer {
    constructor() {
        this.ring = new ConsistentHashRing(10, 360);
        
        // Setup default nodes
        this.addNode('Node-A', 1);
        this.addNode('Node-B', 1);
        this.addNode('Node-C', 1);
        
        healthCheck.start();
    }

    addNode(node, weight = 1) {
        weightedRegistry.setNode(node, weight);
        healthCheck.addNode(node);
        this.ring.addNode(node, weightedRegistry.getNodes()[node]);
    }

    removeNode(node) {
        this.ring.removeNode(node);
        healthCheck.removeNode(node);
        weightedRegistry.removeNode(node);
    }

    route(ip) {
        // Find a node, skipping ones marked down
        const result = this.ring.getNode(ip, (nodeName) => healthCheck.isNodeUp(nodeName));
        
        if (!result) {
            throw new Error("No nodes available in the load balancer");
        }

        const timestamp = new Date().toISOString();
        const { node, ringPosition } = result;

        const paddedPosition = ringPosition.toString().padStart(3, '0');
        console.log(`[${timestamp}] IP: ${ip.padEnd(15, ' ')} | Ring Position: ${paddedPosition} | Routed to: ${node}`);

        metrics.recordRequest(ip, node);

        return {
            ip,
            node,
            ringPosition,
            timestamp
        };
    }
}

module.exports = new LoadBalancer();
