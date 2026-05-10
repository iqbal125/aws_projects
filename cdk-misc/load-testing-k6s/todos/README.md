# k6 Load Tests - Todo API

Performance testing suite for the Todo API using [k6](https://k6.io/).

## 📁 Project Structure

```
todos/
├── tests/
│   ├── smoke.test.js     # Quick sanity check (1 VU, 10s)
│   ├── load.test.js      # Normal traffic simulation
│   ├── stress.test.js    # Find breaking points
│   └── soak.test.js      # Extended duration testing
├── lib/
│   ├── httpClient.js     # HTTP request helpers
│   ├── checks.js         # Reusable assertions
│   └── auth.js           # Authentication utilities
├── config/
│   ├── base.js           # Default config from env
│   ├── staging.js        # Staging environment config
│   └── prod.js           # Production config
├── .env                  # Local environment variables (gitignored)
├── .env.example          # Example env file (commit this)
├── k6.config.js          # Environment loader
└── package.json          # npm scripts
```

## 🚀 Quick Start

### 1. Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```bash
choco install k6
```

**Docker:**
```bash
docker run -i grafana/k6 run - <script.js
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env with your API URL
```

### 3. Run tests

```bash
# Source env and run
source .env && k6 run tests/smoke.test.js

# Or use npm scripts
npm run smoke
npm run load
npm run stress
```

## 🧪 Test Types

| Test | Purpose | VUs | Duration |
|------|---------|-----|----------|
| **Smoke** | Sanity check | 1 | 10s |
| **Load** | Normal traffic | 10 | 2m |
| **Stress** | Breaking point | 20-100 | 3m |
| **Soak** | Memory leaks | 20 | 30m+ |

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | API base URL | `http://localhost:3000` |
| `API_KEY` | Bearer token | (empty) |
| `VUS` | Virtual users | `10` |
| `DURATION` | Test duration | `30s` |

### Override inline

```bash
BASE_URL=https://staging.api.com VUS=50 k6 run tests/load.test.js
```

## 📊 Output Options

```bash
# JSON output
k6 run --out json=results/output.json tests/load.test.js

# Summary export
k6 run --summary-export=results/summary.json tests/load.test.js

# InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 tests/load.test.js
```

## ✅ Thresholds

Tests will fail CI if these thresholds are exceeded:

- **p(95) response time**: < 500ms
- **Error rate**: < 1%

## 🔧 Useful Commands

```bash
# Dry run (validate script)
k6 run --dry-run tests/smoke.test.js

# Custom VUs and duration
k6 run --vus 50 --duration 2m tests/load.test.js

# Pause on failures
k6 run --throw-on-abort tests/load.test.js
```

## 🚢 CI/CD

### GitHub Actions

```yaml
name: k6 Load Test

on: [push]

jobs:
  k6:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/smoke.test.js
        env:
          BASE_URL: ${{ secrets.API_URL }}
```
