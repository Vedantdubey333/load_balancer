// Simulates node health tracking

class HealthCheck {
    constructor() {
        this.statuses = {};
        this.interval = null;
    }

    addNode(node) {
        if (!this.statuses[node]) {
            this.statuses[node] = {
                status: 'healthy',
                lastChecked: Date.now(),
                uptime: 100
            };
        }
    }

    removeNode(node) {
        delete this.statuses[node];
    }

    isNodeUp(node) {
        return this.statuses[node] && this.statuses[node].status !== 'down';
    }

    getHealth() {
        return this.statuses;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            this.simulateHealthCheck();
        }, 30000); // Check every 30s
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // Fakes a health check by randomly altering node status
    simulateHealthCheck() {
        const now = Date.now();
        for (const node in this.statuses) {
            const data = this.statuses[node];
            data.lastChecked = now;

            const rand = Math.random();
            if (rand < 0.05) {
                data.status = 'down';
                data.uptime = Math.max(0, data.uptime - 1);
            } else if (rand < 0.10) {
                data.status = 'degraded';
            } else {
                data.status = 'healthy';
                data.uptime = Math.min(100, data.uptime + 0.1);
            }
        }
    }
}

module.exports = new HealthCheck();
