// Basic in-memory rate limiter

class RateLimiter {
    constructor(limit = 5, windowMs = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.requests = new Map(); // IP -> list of timestamps
    }

    isAllowed(ip) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        if (!this.requests.has(ip)) {
            this.requests.set(ip, []);
        }

        let timestamps = this.requests.get(ip);
        timestamps = timestamps.filter(ts => ts > windowStart);
        
        if (timestamps.length >= this.limit) {
            this.requests.set(ip, timestamps);
            return false;
        }

        timestamps.push(now);
        this.requests.set(ip, timestamps);
        return true;
    }

    // Express middleware
    middleware() {
        return (req, res, next) => {
            const ip = req.body.ip || req.ip;
            if (!ip) {
                return res.status(400).json({ success: false, error: "IP address is required" });
            }

            if (!this.isAllowed(ip)) {
                console.log(`[RATE LIMIT] Blocked IP: ${ip}`);
                return res.status(429).json({ 
                    success: false, 
                    error: "Too many requests", 
                    retryAfter: "60s" 
                });
            }
            next();
        };
    }
}

module.exports = new RateLimiter();
