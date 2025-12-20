# Amazon MemoryDB for Redis

Redis-compatible, durable, in-memory database service designed for ultra-fast performance with data durability.

## MemoryDB vs ElastiCache Redis

| Feature | ElastiCache Redis | MemoryDB for Redis |
|---------|-------------------|-------------------|
| **Primary Purpose** | Cache with some durability | Durable database |
| **API** | Redis-compatible | Redis-compatible |
| **Durability** | Optional | Built-in with Multi-AZ transaction logs |
| **Use Case** | Caching layer | Primary database |

## Performance & Durability

- **Ultra-fast performance** - 160+ million requests per second
- **In-memory storage** with Multi-AZ transaction log
- **Multi-AZ durability** - Transaction logs across availability zones
- **Fast recovery** from failures

## Scalability

Scales seamlessly from **tens of gigabytes** to **hundreds of terabytes** of storage.

## Use Cases

- Web and mobile applications
- Online gaming
- Media streaming
- Microservices requiring Redis-compatible in-memory database with durability

## Key Takeaways

- MemoryDB is a **durable database**, not just a cache like ElastiCache Redis
- Combines **in-memory speed** with **Multi-AZ durability**
- Ideal when you need Redis-compatible API with guaranteed data persistence