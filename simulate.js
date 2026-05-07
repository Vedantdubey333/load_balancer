// Simple script to simulate traffic to the load balancer

const loadBalancer = require('./src/loadBalancer');
const healthCheck = require('./src/healthCheck');

// Generates a random IP address for testing
function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Left here for compatibility
function identifyNode(ip, selectedNode) {
    // Logging handled inside LoadBalancer.route() now
}

// Wrapper to use the new load balancer class
function LoadBalancer(ip) {
    const result = loadBalancer.route(ip);
    return result.node;
}

function runSimulation() {
    const count = parseInt(process.argv[2]) || 10;
    console.log(`Starting simulation with ${count} requests...\n`);
    
    // Fixed IPs to test stickiness
    const consistentIPs = ['192.168.1.42', '10.0.0.5', '172.16.0.200'];
    
    for (let i = 0; i < count; i++) {
        const ip = i < consistentIPs.length ? consistentIPs[i] : generateRandomIP();
        const node = LoadBalancer(ip);
        identifyNode(ip, node);
    }
    
    console.log(`\nRe-requesting same IPs to prove consistency...`);
    LoadBalancer(consistentIPs[0]);
    LoadBalancer(consistentIPs[1]);
    
    console.log(`\nSimulation complete.`);
    healthCheck.stop();
}

runSimulation();
