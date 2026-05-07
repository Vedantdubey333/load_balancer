// Consistent hashing core logic

// Basic FNV-1a hash to convert strings into 32-bit integers
function hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
}

class ConsistentHashRing {
    constructor(replicas = 10, ringSize = 360) {
        this.replicas = replicas;
        this.ringSize = ringSize;
        this.ring = []; // { position, node } array sorted by position
        this.nodes = new Set();
    }

    addNode(node, weight = 1) {
        if (this.nodes.has(node)) return;
        this.nodes.add(node);

        // Create multiple virtual nodes for better distribution
        const virtualNodesCount = this.replicas * weight;
        for (let i = 0; i < virtualNodesCount; i++) {
            const virtualNodeName = `${node}-vn-${i}`;
            const position = hashString(virtualNodeName) % this.ringSize;
            
            this.ring.push({ position, node });
        }
        
        // Keep it sorted so we can search clockwise later
        this.ring.sort((a, b) => a.position - b.position);
    }

    removeNode(node) {
        if (!this.nodes.has(node)) return;
        this.nodes.delete(node);
        this.ring = this.ring.filter(vn => vn.node !== node);
    }

    getNode(ip, isNodeHealthy = () => true) {
        if (this.ring.length === 0) return null;

        const position = hashString(ip) % this.ringSize;
        let startIndex = -1;

        // Find the first node on the ring after our hashed IP
        for (let i = 0; i < this.ring.length; i++) {
            if (this.ring[i].position >= position) {
                startIndex = i;
                break;
            }
        }
        
        if (startIndex === -1) startIndex = 0; // Wrap around to the start

        // Walk clockwise to find a node that's actually up
        for (let i = 0; i < this.ring.length; i++) {
            const currentIndex = (startIndex + i) % this.ring.length;
            const candidateNode = this.ring[currentIndex].node;
            
            if (isNodeHealthy(candidateNode)) {
                return { node: candidateNode, ringPosition: position };
            }
        }

        // If everything is down, just return the originally mapped node
        return { node: this.ring[startIndex].node, ringPosition: position };
    }
}

module.exports = ConsistentHashRing;
