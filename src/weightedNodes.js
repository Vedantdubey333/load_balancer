// Keeps track of node weights

class WeightedNodesRegistry {
    constructor() {
        this.nodes = {}; // { 'Node-A': 1, 'Node-B': 3 }
    }

    setNode(node, weight = 1) {
        // Keep weight between 1 and 5
        const safeWeight = Math.max(1, Math.min(5, parseInt(weight) || 1));
        this.nodes[node] = safeWeight;
    }

    removeNode(node) {
        delete this.nodes[node];
    }

    getNodes() {
        return this.nodes;
    }

    getNodesWithStats() {
        let totalWeight = 0;
        for (const w of Object.values(this.nodes)) {
            totalWeight += w;
        }

        const stats = {};
        for (const [node, weight] of Object.entries(this.nodes)) {
            const share = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
            stats[node] = {
                weight: weight,
                approximateTrafficShare: `${share.toFixed(2)}%`
            };
        }
        return stats;
    }
}

module.exports = new WeightedNodesRegistry();
