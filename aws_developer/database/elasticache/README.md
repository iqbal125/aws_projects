# ElastiCache

Fully managed in-memory caching service supporting Redis and Memcached. Improves application performance by retrieving data from fast, managed, in-memory caches instead of slower disk-based databases.

https://tutorialsdojo.com/amazon-elasticache/

https://aws.amazon.com/elasticache/redis-vs-memcached/

## Caching Strategies

### When to Use Caching

**Is caching safe?**
- Generally yes, but data may be out of date (eventual consistency)
- Not suitable for every dataset

**Is caching effective?**
- ✅ Data changes slowly with few frequently accessed keys
- ❌ Data changes rapidly or requires entire key space

**Is data structured correctly?**
- Ideal: Key-value pairs or aggregated results
- Structure data appropriately for your queries

### Lazy Loading (Cache-Aside)

Application checks cache first. On cache miss, retrieves from database and populates cache for future requests.

**Pros:**
- Only caches requested data (efficient)
- System tolerates cache failures (just slower)

**Cons:**
- Cache miss = 3 network calls (read cache, read DB, write cache)
- Stale data possible if DB updates aren't reflected in cache

**Example:**
```python
def get_user(user_id):
    record = cache.get(user_id)
    if record is None:
        record = db.query("SELECT * FROM users WHERE id = %s", user_id)
        cache.set(user_id, record)
    return record
```

### Write Through

Updates cache whenever database is updated, ensuring cache is never stale.

**Pros:**
- Cache always has fresh data

**Cons:**
- Write penalty (2 calls per write: DB + cache)
- Missing data until first write
- Often combined with Lazy Loading

**Example:**
```python
def save_user(user_id, user_data):
    record = db.query_update("UPDATE users SET data = %s WHERE id = %s", user_data, user_id)
    cache.set(user_id, record)
    return record
```

### Cache Evictions and TTL

**Eviction Policies:**
- Explicit deletion or automatic when cache is full
- **LRU (Least Recently Used)** - Evicts least accessed items

**Time-to-Live (TTL):**
- Sets expiration time for cached items
- Range: seconds to days
- Scale cache size if too many evictions occur

### Best Practices

- **Use Lazy Loading** as foundation for read performance
- **Add Write Through** to reduce staleness
- **Set TTL** for time-sensitive data (leaderboards, comments, activity streams)
- **Cache appropriate data** - user profiles, blogs (not pricing, bank balances)
- Combine strategies as needed

### Key Takeaways

- Caching may lead to eventual consistency and stale data
- **Lazy Loading** - Caches on-demand, optimizes reads
- **Write Through** - Updates cache on writes, prevents staleness
- **TTL & Eviction** - Manage cache size and freshness


