## Deployment Methods

| Method | Impact of Failed Deployment | Deploy Time | Zero Downtime | No DNS Change | Rollback Process | Code Deployed To |
|--------|------------------------------|-------------|---------------|---------------|------------------|------------------|
| **All at once** | Downtime | Fast | No | Yes | Manual redeploy | Existing instances |
| **Rolling** | Single batch out of service; successful batches run new version | Moderate | Yes | Yes | Manual redeploy | Existing instances |
| **Rolling with additional batch** | Minimal if first batch fails; otherwise similar to Rolling | Slower | Yes | Yes | Manual redeploy | New and existing instances |
| **Immutable** | Minimal | Slowest | Yes | Yes | Terminate new instances | New instances |
| **Traffic splitting** | Percentage of client traffic to new version temporarily impacted | Slowest | Yes | Yes | Reroute traffic and terminate new instances | New instances |
| **Blue/green** | Minimal | Slowest | Yes | No | Swap URL | New instances |





https://tutorialsdojo.com/aws-elastic-beanstalk/?src=udemy

