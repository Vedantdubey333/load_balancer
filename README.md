# Load Balancer

A simple Node.js and Express load balancer that uses consistent hashing to route traffic.

## How it works

Instead of routing requests randomly, it maps IPs and nodes to a virtual ring. When a request comes in, its IP gets hashed to a spot on the ring, and it routes to the nearest active node clockwise. This keeps things "sticky", meaning the same IP keeps going to the same server (good for sessions and caching). It also uses virtual nodes to keep the load balanced evenly.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start server:
   ```bash
   npm start
   ```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/route` | Route an IP (`{"ip": "10.0.0.1"}`) |
| GET | `/nodes` | List active nodes |
| POST | `/nodes/add` | Add a node (`{"name": "Node-D", "weight": 2}`) |
| DELETE | `/nodes/remove` | Remove a node (`{"name": "Node-A"}`) |
| GET | `/health` | Check node health |
| GET | `/metrics` | View stats |
| POST | `/simulate` | Run N test requests (`{"count": 10}`) |
| DELETE | `/metrics/reset` | Clear stats |

## Test Commands

**Route IP**
```bash
curl -X POST http://localhost:3000/route -H "Content-Type: application/json" -d '{"ip": "192.168.1.100"}'
```

**List Nodes**
```bash
curl http://localhost:3000/nodes
```

**Add Node**
```bash
curl -X POST http://localhost:3000/nodes/add -H "Content-Type: application/json" -d '{"name": "Node-D", "weight": 3}'
```

**Remove Node**
```bash
curl -X DELETE http://localhost:3000/nodes/remove -H "Content-Type: application/json" -d '{"name": "Node-A"}'
```

**Health**
```bash
curl http://localhost:3000/health
```

**Metrics**
```bash
curl http://localhost:3000/metrics
```

**Simulate Traffic**
```bash
node simulate.js 20
```

## Features

- **Health Checks**: Checks nodes periodically. If a node is down, it skips it.
- **Weights**: Give stronger servers higher weights so they handle more traffic.
- **Metrics**: Track request counts and node usage at `/metrics`.
- **Rate Limit**: Blocks IPs that spam more than 5 requests a minute.
# load_balancer
