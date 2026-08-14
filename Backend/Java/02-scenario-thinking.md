# 02 --- Scenario Thinking

The scenario pack is best treated as **decision training**, not another
700-question syllabus.

A good interview answer usually follows:

``` text
Understand the failure
      ↓
Identify the constraint
      ↓
Name the viable options
      ↓
Choose one
      ↓
Explain what you give up
      ↓
Mention when the other option wins
```

------------------------------------------------------------------------

# 1. The most important interview sentence

Avoid:

> "Always use X."

Prefer:

> "I'd choose X because the dominant constraint is Y. The trade-off is
> Z. If the workload changed to W, I'd switch to A."

That is the difference between memorisation and engineering judgement.

------------------------------------------------------------------------

# 2. Collections scenarios

## HashMap vs ConcurrentHashMap

Ask:

> **Can anything mutate the map after publication?**

### Immutable after startup

Prefer:

``` java
Map.copyOf(...)
```

and safely publish the reference.

### Concurrent writes

Use:

``` java
ConcurrentHashMap
```

Do not use `ConcurrentHashMap` simply because "threads exist."

The question is whether **shared mutation** exists.

------------------------------------------------------------------------

## ArrayList vs LinkedList

Default:

``` java
ArrayList
```

Why?

-   random access
-   cache locality
-   lower memory overhead
-   usually better real-world performance

Use `LinkedList` only when the actual access pattern benefits from
linked-node operations and you already have the node/iterator position.

------------------------------------------------------------------------

## LinkedHashMap vs TreeMap

``` text
Need insertion/access order → LinkedHashMap
Need sorted/range operations → TreeMap
```

------------------------------------------------------------------------

# 3. HashMap key bug

If:

``` java
equals()
```

is overridden but:

``` java
hashCode()
```

isn't:

``` text
put(key1)
   ↓
hash1 → bucket A

get(key2)
   ↓
hash2 → bucket B
```

Even if:

``` java
key1.equals(key2)
```

is true, the lookup may never reach the equality comparison.

**Rule:**

> Equal objects must have equal hash codes.

------------------------------------------------------------------------

# 4. Mutable key bug

Never mutate fields used by `equals/hashCode` after using an object as a
hash key.

Bad:

``` java
Map<User, String> map = new HashMap<>();

map.put(user, "active");

user.setId(99);
```

If `id` participates in hashing, the map may no longer find the entry.

------------------------------------------------------------------------

# 5. TreeMap comparator trap

If your comparator returns `0`, the sorted map treats the keys as
equivalent for ordering.

So:

``` java
Comparator.comparing(String::length)
```

makes:

``` text
"abc" and "xyz"
```

equivalent because both have length 3.

If that is not intended, add a tie-breaker:

``` java
Comparator.comparing(String::length)
    .thenComparing(Comparator.naturalOrder());
```

------------------------------------------------------------------------

# 6. String scenarios

## Config value compared with `==`

Bad:

``` java
if (configValue == "UPI")
```

This can appear to work with literals because literals are pooled.

But values loaded from:

-   YAML
-   JSON
-   DB
-   network
-   files

are not necessarily the same reference.

Use:

``` java
"UPI".equals(configValue)
```

or:

``` java
Objects.equals(configValue, "UPI")
```

------------------------------------------------------------------------

# 7. `final` does not mean immutable

This:

``` java
final List<String> items = new ArrayList<>();
```

means:

``` text
items cannot point to another List
```

It does NOT mean:

``` text
the List cannot change
```

So this is valid:

``` java
items.add("A");
```

For immutable collections:

``` java
List.of(...)
List.copyOf(...)
```

------------------------------------------------------------------------

# 8. Stream scenarios

## `peek()` is not a business-logic hook

Do not use:

``` java
peek(...)
```

to implement important state changes.

`peek()` is primarily for observing/debugging a pipeline.

Prefer transformations:

``` java
map
filter
flatMap
reduce
collect
```

and perform explicit side effects outside the pipeline when necessary.

------------------------------------------------------------------------

## Parallel streams

Parallelism is not automatically faster.

It adds:

-   splitting
-   scheduling
-   coordination
-   merging
-   ordering costs

It is particularly questionable for operations such as:

``` java
parallelStream()
    .skip(...)
    .limit(...)
```

where ordering/state can create substantial coordination.

For DB pagination, prefer DB-level pagination.

------------------------------------------------------------------------

# 9. Thread creation scenarios

Bad:

``` java
for (User user : users) {
    new Thread(() -> sendEmail(user)).start();
}
```

For 1,000 users:

``` text
1,000 tasks
→ 1,000 platform threads
→ excessive memory/resource pressure
```

Use a bounded executor:

``` java
ExecutorService pool =
    Executors.newFixedThreadPool(16);
```

For Java 21 and IO-heavy independent tasks:

``` java
Executors.newVirtualThreadPerTaskExecutor()
```

may be appropriate.

But remember:

> More threads ≠ more CPU.

------------------------------------------------------------------------

# 10. Worker pool + backpressure

A good production worker pool often has:

``` text
bounded workers
      +
bounded queue
      +
rejection policy
```

Why bounded?

Because an unbounded queue can turn overload into:

``` text
more traffic
→ more queued work
→ more memory
→ longer latency
→ more work in flight
→ crash
```

`CallerRunsPolicy` can provide natural backpressure:

``` text
pool overloaded
      ↓
caller executes task
      ↓
caller slows down
      ↓
submission rate falls
```

------------------------------------------------------------------------

# 11. SQL injection scenario

Never:

``` java
"SELECT ... WHERE city = '" + city + "'"
```

Use:

``` java
PreparedStatement
```

with:

``` sql
WHERE city = ?
```

The value is bound separately from the SQL text.

This gives:

-   injection protection
-   correct escaping
-   cleaner SQL
-   potential statement reuse/caching

------------------------------------------------------------------------

# 12. Spring transaction scenario

If:

``` java
@Transactional
void placeOrder() throws PaymentException
```

and `PaymentException` is checked:

``` text
exception
   ↓
NO automatic rollback by default
```

Default rollback rules:

``` text
RuntimeException → rollback
Error            → rollback
checked Exception → usually NO rollback
```

Fix:

``` java
@Transactional(rollbackFor = PaymentException.class)
```

------------------------------------------------------------------------

# 13. Spring proxy trap

A common scenario:

``` java
class Service {

    public void a() {
        b();
    }

    @Transactional
    public void b() {
        ...
    }
}
```

Calling:

``` java
a()
```

does not go through the Spring proxy for `b()`.

Therefore the transactional advice may not run.

Mental model:

``` text
external caller
    ↓
Spring proxy
    ↓
real bean
```

but:

``` text
real bean
   ↓
this.b()
```

bypasses the proxy.

The same conceptual trap appears with:

-   `@Transactional`
-   `@Async`
-   many AOP-based features

------------------------------------------------------------------------

# 14. EAGER JPA scenario

Suppose:

``` java
@OneToMany(fetch = FetchType.EAGER)
List<LineItem> items;
```

and loading 1,000 orders causes:

``` text
1 query for orders
+
1 query per order
=
1001 queries
```

Classic N+1.

Typical fix:

``` text
LAZY by default
+
JOIN FETCH / EntityGraph when needed
```

Do not solve N+1 by blindly increasing the DB connection pool.

The problem is usually **query shape / round trips**, not the pool.

------------------------------------------------------------------------

# 15. Inventory race scenario

Suppose:

``` text
10 stock
50 buyers
```

Do not:

``` text
SELECT available
if available > 0
    UPDATE available
```

as two independent operations without concurrency control.

Prefer an atomic DB condition:

``` sql
UPDATE inventory
SET available = available - 1
WHERE sku = ?
  AND available >= 1;
```

Then inspect affected rows.

``` text
1 row updated → reservation succeeded
0 rows updated → no stock
```

The database performs the atomic check + update.

------------------------------------------------------------------------

# 16. Idempotency scenario

Suppose payment request:

``` text
POST /payments
```

is retried.

Without idempotency:

``` text
request 1 → charge ₹100
network timeout
request 2 → charge ₹100
```

Customer gets charged twice.

Use an idempotency key:

``` text
Idempotency-Key: abc123
```

and atomically record/process that key.

Important:

> Kafka "exactly once" does not automatically make external HTTP/payment
> side effects exactly once.

External systems still need idempotency.

------------------------------------------------------------------------

# 17. Cache scenarios

## LRU

If the requirement is:

> "Remove the least recently used entry."

A simple conceptual implementation is:

``` java
LinkedHashMap
```

with access order.

For production caching:

``` text
Caffeine
```

is usually preferable to hand-rolling a sophisticated cache.

------------------------------------------------------------------------

## Cache never shrinks

If a cache has:

``` text
key → object
```

and keys continually accumulate:

``` text
memory ↑
memory ↑
memory ↑
```

GC cannot save you if the cache itself still strongly references the
objects.

This is a **retention problem**, not necessarily a GC problem.

Fix with:

-   bounded cache
-   TTL
-   eviction policy
-   correct ownership
-   weak references where appropriate

------------------------------------------------------------------------

# 18. Production debugging scenarios

When latency suddenly jumps:

``` text
Do not restart first.
```

Instead narrow the layer:

``` text
API
 ↓
JVM?
 ↓
GC?
 ↓
threads/locks?
 ↓
DB?
 ↓
network/downstream?
 ↓
OS?
```

Useful evidence:

-   metrics
-   GC logs
-   thread dumps
-   JFR
-   database query metrics
-   `EXPLAIN ANALYZE`
-   downstream latency
-   CPU / memory / load
-   allocation rate

The key interview phrase:

> **"I want to establish correlation before changing configuration."**

------------------------------------------------------------------------

# 19. Memory leak scenarios

Java has GC, but Java applications can still leak memory.

A GC leak is usually:

``` text
object is still reachable
      ↓
GC correctly keeps it
      ↓
application no longer logically needs it
```

Common causes:

-   unbounded maps
-   caches without eviction
-   static collections
-   listeners never removed
-   ThreadLocal misuse
-   long-lived objects retaining large graphs

So:

> **GC prevents unreachable-object leaks. It cannot know that a
> reachable object is logically useless.**

------------------------------------------------------------------------

# 20. Scenario answer template

When given a production problem:

### Step 1 --- State the failure

> "We have latency spikes / duplicate payments / memory growth."

### Step 2 --- Identify the invariant

> "We must never oversell stock."

### Step 3 --- Find the race/resource boundary

> "The read and update are currently separate."

### Step 4 --- Make the critical operation atomic

> "I'll use a conditional UPDATE."

### Step 5 --- State trade-offs

> "This creates contention on a hot SKU row."

### Step 6 --- Say when you'd change the design

> "For flash-sale scale, I'd shard inventory across buckets."

That structure is reusable across a huge number of scenario questions.

------------------------------------------------------------------------

# 21. What to practice

After reading this file, target scenarios involving:

1.  `HashMap` vs `ConcurrentHashMap`
2.  broken `equals/hashCode`
3.  mutable map key
4.  `TreeMap` comparator equality
5.  String `==`
6.  final reference vs immutable object
7.  `peek()` misuse
8.  parallel stream performance
9.  unbounded thread creation
10. bounded worker pool
11. SQL injection
12. checked exception + transaction rollback
13. Spring self-invocation
14. JPA N+1
15. inventory race
16. idempotency
17. cache memory leak
18. latency debugging

These give much better ROI than trying to complete all 800 scenarios.
