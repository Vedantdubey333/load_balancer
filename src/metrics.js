// Tracks stats like total requests and routing distribution

class MetricsTracker {
    constructor() {
        this.reset();
    }

    reset() {
        this.totalRequests = 0;
        this.requestsPerNode = {};
        this.uniqueIPs = new Set();
        this.requestHistory = []; // array of timestamps
    }

    recordRequest(ip, node) {
        this.totalRequests++;
        this.uniqueIPs.add(ip);
        
        if (!this.requestsPerNode[node]) {
            this.requestsPerNode[node] = 0;
        }
        this.requestsPerNode[node]++;
        
        this.requestHistory.push(Date.now());
        this.cleanupOldHistory();
    }

    // Drop timestamps older than 60s
    cleanupOldHistory() {
        const sixtySecondsAgo = Date.now() - 60000;
        let startIndex = 0;
        while (startIndex < this.requestHistory.length && this.requestHistory[startIndex] < sixtySecondsAgo) {
            startIndex++;
        }
        if (startIndex > 0) {
            this.requestHistory = this.requestHistory.slice(startIndex);
        }
    }

    getMetrics() {
        this.cleanupOldHistory();
        
        const nodeNames = Object.keys(this.requestsPerNode);
        const nodeCount = nodeNames.length;
        const avgRequestsPerNode = nodeCount === 0 ? 0 : this.totalRequests / nodeCount;
        
        let mostUsedNode = null;
        let maxReqs = -1;
        for (const [node, count] of Object.entries(this.requestsPerNode)) {
            if (count > maxReqs) {
                maxReqs = count;
                mostUsedNode = node;
            }
        }

        return {
            totalRequests: this.totalRequests,
            requestsPerNode: this.requestsPerNode,
            averageRequestsPerNode: Number(avgRequestsPerNode.toFixed(2)),
            mostUsedNode: mostUsedNode,
            uniqueIPsSeen: this.uniqueIPs.size,
            requestsLast60Seconds: this.requestHistory.length
        };
    }
}

module.exports = new MetricsTracker();
