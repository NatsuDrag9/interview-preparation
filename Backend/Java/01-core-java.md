# 01 --- Core Java Interview Theory

> **Goal:** understand the concepts well enough to solve 10--20
> interview questions without memorising 800 answers.

------------------------------------------------------------------------

# 1. Exception Handling

## 1.1 The hierarchy

Think of Java's throwable hierarchy as:

``` text
Throwable
├── Error
│   ├── OutOfMemoryError
│   └── StackOverflowError
│
└── Exception
    ├── RuntimeException
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   └── ArithmeticException
    │
    └── checked exceptions
        ├── IOException
        └── SQLException
```

The important distinction is **checked vs unchecked**.

### Checked exception

The compiler forces you to either:

``` java
try {
    readFile();
} catch (IOException e) {
    ...
}
```

or:

``` java
void load() throws IOException {
    ...
}
```

Use checked exceptions when the caller can reasonably be expected to
recover.

### Unchecked exception

`RuntimeException` and its subclasses do not need to appear in `throws`.

Typical examples:

``` java
NullPointerException
IllegalArgumentException
IllegalStateException
```

For application code, **unchecked exceptions are normally the default**.
Make an exception checked when forcing the caller to handle/recover is
actually useful.

------------------------------------------------------------------------

## 1.2 `throw` vs `throws`

``` java
throw new IllegalArgumentException("age < 0");
```

**throws the object now.**

``` java
void read() throws IOException
```

**declares that the method may propagate the exception.**

Mental shortcut:

``` text
throw  → action
throws → method contract
```

------------------------------------------------------------------------

## 1.3 Catch order

More specific exceptions must come first:

``` java
try {
    ...
} catch (FileNotFoundException e) {
    ...
} catch (IOException e) {
    ...
}
```

This is invalid:

``` java
catch (IOException e) { ... }
catch (FileNotFoundException e) { ... } // unreachable
```

because `FileNotFoundException` is already covered.

------------------------------------------------------------------------

## 1.4 Exception propagation

If a method does not catch an exception, it moves up the call stack:

``` text
repository
   ↓
service
   ↓
controller
   ↓
top-level handler
```

Do not catch an exception merely to make it disappear.

A good rule:

> **Catch where you can do something meaningful with the error.**

Otherwise propagate it.

------------------------------------------------------------------------

## 1.5 Exception wrapping

Suppose JDBC gives you:

``` java
SQLException
```

but your service does not want to expose JDBC details.

Wrap it:

``` java
throw new UserLoadException("Failed to load user " + id, e);
```

The second argument is crucial.

Without:

``` java
, e
```

you lose the original cause.

Think:

``` text
ServiceException
      ↓ caused by
SQLException
      ↓ caused by
...
```

Use `getCause()` to walk the chain.

------------------------------------------------------------------------

## 1.6 `finally`

`finally` is normally used for cleanup that must happen whether the
operation succeeds or fails.

``` java
try {
    ...
} catch (...) {
    ...
} finally {
    cleanup();
}
```

Important interview trap:

``` java
try {
    return 10;
} finally {
    return 20;
}
```

Returns:

``` text
20
```

A `return` in `finally` can also swallow an exception.

**Never use `return` from `finally` in normal application code.**

------------------------------------------------------------------------

## 1.7 Try-with-resources

Prefer:

``` java
try (BufferedReader reader = new BufferedReader(...)) {
    ...
}
```

over manual `finally` cleanup.

Anything implementing `AutoCloseable` can participate.

Multiple resources:

``` java
try (
    Connection c = ...;
    PreparedStatement ps = ...;
    ResultSet rs = ...
) {
    ...
}
```

They close in **reverse declaration order**.

``` text
rs → ps → connection
```

### Suppressed exceptions

Suppose the body throws `A` and closing the resource throws `B`.

Java keeps:

``` text
Primary exception: A
Suppressed exception: B
```

Retrieve them with:

``` java
e.getSuppressed()
```

This is one reason try-with-resources is safer than hand-written
cleanup.

------------------------------------------------------------------------

## 1.8 Custom exceptions

A normal domain exception:

``` java
public final class OrderNotFoundException
        extends RuntimeException {

    public OrderNotFoundException(long id) {
        super("Order not found: " + id);
    }
}
```

Add domain fields when callers genuinely need structured information.

------------------------------------------------------------------------

## Exception interview checklist

Know these cold:

-   checked vs unchecked
-   `throw` vs `throws`
-   exception hierarchy
-   catch ordering
-   propagation
-   wrapping + cause
-   `finally`
-   try-with-resources
-   suppressed exceptions
-   custom exceptions
-   multi-catch
-   precise rethrow

------------------------------------------------------------------------

# 2. Collections Framework

## 2.1 The mental model

Do not memorise 20 classes independently.

Start with the interfaces:

``` text
Iterable
   ↓
Collection
├── List
├── Set
└── Queue
     ↓
    Deque

Map is separate.
```

Why is `Map` separate?

Because a `Collection` contains individual elements:

``` java
List<User>
```

while a map contains key/value associations:

``` java
Map<UserId, User>
```

A `Map` provides collection-like views:

``` java
keySet()
values()
entrySet()
```

but it is not itself a `Collection`.

------------------------------------------------------------------------

# 3. Choosing a collection

The highest-value decision table:

  Need                               Default choice
  ---------------------------------- -----------------------------------
  General list                       `ArrayList`
  General set                        `HashSet`
  General map                        `HashMap`
  Stack/queue                        `ArrayDeque`
  Preserve insertion order           `LinkedHashMap` / `LinkedHashSet`
  Sorted keys/elements               `TreeMap` / `TreeSet`
  Concurrent map                     `ConcurrentHashMap`
  Blocking producer/consumer queue   `BlockingQueue`
  Small immutable collection         `List.of`, `Set.of`, `Map.of`

### Why `ArrayList` by default?

It provides:

-   O(1) random access
-   excellent cache locality
-   low per-element overhead

Appending is amortized O(1).

### Why not `LinkedList`?

It has O(1) insertion/removal **once you already have the node**, but
finding the position is O(n), and its node allocation hurts locality.

So:

> **"LinkedList is better for insertion" is incomplete and often
> misleading.**

------------------------------------------------------------------------

# 4. HashMap mental model

A `HashMap` conceptually does:

``` text
key
 ↓
hash
 ↓
bucket
 ↓
compare keys
 ↓
value
```

The critical contract:

> If `a.equals(b)` is true, `a.hashCode()` must equal `b.hashCode()`.

The reverse is NOT required.

Two unequal objects may have the same hash code.

------------------------------------------------------------------------

## 4.1 Why equals + hashCode matter

Suppose:

``` java
class OrderId {
    String value;

    @Override
    public boolean equals(Object o) {
        ...
    }
}
```

but you forget `hashCode()`.

Then:

``` java
map.put(new OrderId("42"), order);

map.get(new OrderId("42"));
```

may fail.

Why?

``` text
put:
  hash(key1) → bucket A

get:
  hash(key2) → bucket B
```

The map may never even reach `equals()`.

**If you override `equals`, override `hashCode`.**

------------------------------------------------------------------------

# 5. HashSet

A `HashSet` is essentially built around a map-like hashing mechanism.

The important consequence:

``` text
uniqueness depends on equals + hashCode
```

So mutable keys/elements are dangerous.

If a field used by `hashCode()` changes after insertion:

``` text
insert → bucket based on old hash
mutate → new hash
lookup/remove → search using new hash
```

The object can become effectively "lost" inside the set/map.

------------------------------------------------------------------------

# 6. LinkedHashMap vs TreeMap

### LinkedHashMap

Maintains predictable insertion order.

``` text
hashing + linked ordering
```

Use when:

> "I need fast lookup AND insertion/access order."

It can implement an LRU cache using access order.

### TreeMap

Maintains sorted order.

``` text
balanced tree
O(log n)
```

Useful for:

-   sorted keys
-   range queries
-   `floorKey`
-   `ceilingKey`
-   `subMap`

------------------------------------------------------------------------

## 6.1 TreeMap's subtle equality rule

A sorted map uses the comparator/natural ordering to decide where keys
belong.

If:

``` java
Comparator.comparing(String::length)
```

then:

``` text
"abc" → length 3
"xyz" → length 3
```

Comparator returns `0`.

TreeMap can therefore treat them as the same key.

This is why a comparator used in sorted collections should normally be
**consistent with equals**.

------------------------------------------------------------------------

# 7. ConcurrentHashMap

Do not say:

> "HashMap isn't thread-safe, therefore always use ConcurrentHashMap."

Instead ask:

> **Does the map actually have concurrent mutation?**

If the map becomes immutable after construction:

``` java
Map.copyOf(...)
```

may be simpler.

If multiple threads can update it:

``` java
ConcurrentHashMap
```

is the normal choice.

It provides thread-safe concurrent access without putting one global
lock around the entire map.

------------------------------------------------------------------------

# 8. Fail-fast vs weakly consistent iteration

A normal collection iterator may detect structural modification:

``` java
for (String s : list) {
    list.remove(s); // dangerous
}
```

This can result in:

``` text
ConcurrentModificationException
```

The iterator is **fail-fast**, not a concurrency mechanism.

For concurrent collections, iteration semantics are different.

For example, `ConcurrentHashMap` iterators are generally **weakly
consistent**:

-   they don't necessarily represent a frozen snapshot
-   they can reflect some concurrent updates
-   they do not throw `ConcurrentModificationException` merely because
    another thread modifies the map

------------------------------------------------------------------------

# 9. Queue vs Deque

A queue:

``` text
producer → [ A B C ] → consumer
             ↑
           FIFO
```

A deque supports both ends:

``` text
addFirst()
addLast()
removeFirst()
removeLast()
```

`ArrayDeque` is the default choice for stack/queue behaviour.

Prefer it over legacy `Stack` in modern Java.

------------------------------------------------------------------------

# 10. Immutable collections

These are genuinely immutable:

``` java
List.of("A", "B");
Set.of("A", "B");
Map.of("A", 1);
```

An unmodifiable view is different:

``` java
Collections.unmodifiableList(list)
```

The wrapper prevents mutation **through the wrapper**, but the original
list can still change.

A defensive immutable copy:

``` java
List.copyOf(list)
```

is usually the safer boundary.

------------------------------------------------------------------------

# 11. Generics: the minimum theory

Generics primarily provide **compile-time type safety**.

``` java
List<String> names;
```

does not mean the JVM carries `String` type information for every list
operation at runtime.

Java uses **type erasure** for most generic type information.

That is why:

``` java
List<String>
List<Integer>
```

have the same raw runtime class.

Avoid raw types:

``` java
List list;
```

because they remove compile-time safety and can produce heap-pollution
bugs.

------------------------------------------------------------------------

# 12. Wildcards

Think in terms of **PECS**:

> **Producer Extends, Consumer Super**

If you only read values:

``` java
List<? extends Number>
```

The list produces `Number` values for you.

If you want to add values:

``` java
List<? super Integer>
```

The list can consume `Integer`.

Classic example:

``` java
void copy(
    List<? extends Number> source,
    List<? super Number> destination
)
```

------------------------------------------------------------------------

# 13. Strings

## 13.1 String is immutable

``` java
String s = "hello";
s.concat(" world");
```

does not modify `s`.

It creates another String.

Immutability gives Java several benefits:

-   safe sharing
-   thread safety
-   String Pool
-   stable hash codes
-   security/integrity

------------------------------------------------------------------------

## 13.2 `==` vs `equals`

``` java
==       → reference identity
equals() → content equality
```

Therefore:

``` java
"hello".equals(input)
```

is normally the right comparison.

For nullable values:

``` java
Objects.equals(a, b)
```

------------------------------------------------------------------------

# 14. String Pool

String literals are pooled:

``` java
String a = "hello";
String b = "hello";
```

Both can refer to the same pooled object:

``` text
a ─┐
   ├──→ "hello" in String Pool
b ─┘
```

But:

``` java
String c = new String("hello");
```

creates a separate object.

Thus:

``` java
a == b       // true
a == c       // false
a.equals(c)  // true
```

`intern()` asks for the canonical pooled representation.

Do not use `intern()` as a routine replacement for `equals()`.

------------------------------------------------------------------------

# 15. StringBuilder vs StringBuffer

``` text
String        → immutable
StringBuilder → mutable, not synchronized
StringBuffer  → mutable, synchronized
```

Use:

``` java
StringBuilder
```

by default for repeated string construction.

Classic trap:

``` java
String s = "";

for (...) {
    s = s + value;
}
```

Repeated concatenation can create many intermediate strings.

Prefer:

``` java
StringBuilder sb = new StringBuilder();

for (...) {
    sb.append(value);
}

String result = sb.toString();
```

------------------------------------------------------------------------

# 16. Regex mental model

Java regex has two main objects:

``` text
Pattern
   ↓
Matcher
   ↓
input
```

`Pattern` is the compiled regex.

`Matcher` applies it to a particular input.

Example:

``` java
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher("abc 123 xyz 45");

while (m.find()) {
    System.out.println(m.group());
}
```

Output:

``` text
123
45
```

Know:

-   character classes: `[abc]`, `[^abc]`
-   quantifiers: `*`, `+`, `?`, `{n,m}`
-   groups: `( ... )`
-   non-capturing groups: `(?:...)`
-   anchors: `^`, `$`
-   lookahead/lookbehind
-   backreferences
-   `find()` vs `matches()`

### `find()` vs `matches()`

``` java
m.find()
```

searches for a matching region.

``` java
m.matches()
```

requires the **entire input** to match.

------------------------------------------------------------------------

# 17. JVM + Memory Mental Model

Do not start JVM interviews by memorising flags.

Start with:

``` text
Java process
│
├── Heap
│    ├── objects
│    └── GC manages object memory
│
├── Threads
│    └── stacks
│
├── Metaspace
│    └── class metadata
│
└── Native memory
     └── JVM/runtime/native allocations
```

The exact implementation is more complicated, but this model is enough
for most first-pass questions.

------------------------------------------------------------------------

# 18. Garbage Collection

The simplest definition:

> **GC finds objects that are no longer reachable and reclaims their
> memory.**

Example:

``` java
Movie movie = new Movie();
movie = null;
```

The object may now be unreachable.

GC is not:

> "destroy every object that goes out of scope immediately."

It is a reachability problem.

------------------------------------------------------------------------

## 18.1 Young vs Old

A useful mental model:

``` text
new objects
    ↓
Young generation
    ↓ survive collections
Old generation
```

Most short-lived objects die young.

This makes generational collection efficient.

------------------------------------------------------------------------

# 19. G1

G1 divides the heap into regions.

Regions dynamically act as:

``` text
Eden
Survivor
Old
Humongous
```

G1 tries to collect regions containing lots of garbage first.

That is the origin of:

> Garbage First

G1 still has stop-the-world phases.

Its pause target is a **goal**, not a guarantee.

------------------------------------------------------------------------

# 20. ZGC / Shenandoah

These focus on very low pause times.

The key distinction:

``` text
G1
→ balanced general-purpose collector

ZGC / Shenandoah
→ prioritize extremely low pause times
```

Do not get lost in colored pointers, barriers and evacuation algorithms
until the basic model is solid.

------------------------------------------------------------------------

# 21. Diagnosing GC problems

When latency spikes correlate with GC:

``` text
1. Confirm GC is actually the cause.
2. Check GC logs / JFR.
3. Look at young vs old/full collections.
4. Check allocation rate.
5. Check heap occupancy after GC.
6. Look for steadily growing live data.
7. Only then tune.
```

A useful diagnostic distinction:

``` text
heap after GC keeps growing
        ↓
possible leak / retained objects

many short young GCs
        ↓
possibly high allocation rate

long/full GCs
        ↓
old-gen pressure / collector falling behind
```

**Never tune GC blindly. Measure first.**

------------------------------------------------------------------------

# 22. Concurrency: the minimum mental model

A race condition happens when correctness depends on timing between
threads.

Example:

``` java
count++;
```

is not one indivisible operation.

Conceptually:

``` text
read count
add 1
write count
```

Two threads can interleave these operations.

------------------------------------------------------------------------

## 22.1 `synchronized`

Provides mutual exclusion around a monitor.

``` java
synchronized void increment() {
    count++;
}
```

Only one thread at a time can execute the protected critical section for
the same monitor.

It also provides memory-visibility guarantees.

------------------------------------------------------------------------

## 22.2 `volatile`

`volatile` mainly gives:

-   visibility
-   ordering guarantees around volatile accesses

It does **not** make compound operations atomic.

So:

``` java
volatile int count;
count++;
```

is still not a safe counter.

------------------------------------------------------------------------

## 22.3 Atomic classes

``` java
AtomicInteger
AtomicLong
AtomicReference
```

use atomic operations such as CAS.

Conceptually:

``` text
expected value
      ↓
compare
      ↓
if unchanged → update atomically
```

Useful for lock-free/simple shared-state operations.

------------------------------------------------------------------------

# 23. ExecutorService

Do not create one OS/platform thread per task by default.

Instead:

``` text
tasks
 ↓
ExecutorService
 ↓
bounded worker pool
```

A bounded pool controls concurrency and resource usage.

For Java 21 IO-heavy workloads, virtual threads can be appropriate:

``` java
Executors.newVirtualThreadPerTaskExecutor()
```

But virtual threads do not make CPU-bound work magically faster.

------------------------------------------------------------------------

# 24. Java 8+ Functional Programming

Know the basic function types:

``` text
Predicate<T>   → T → boolean
Function<T,R>  → T → R
Consumer<T>    → T → void
Supplier<T>    → () → T
UnaryOperator<T> → T → T
BinaryOperator<T> → (T,T) → T
```

------------------------------------------------------------------------

## 24.1 Stream mental model

A stream is a **pipeline**, not a collection.

``` text
source
  ↓
intermediate operations
  ↓
terminal operation
```

Example:

``` java
users.stream()
    .filter(User::active)
    .map(User::getName)
    .toList();
```

Intermediate operations are lazy.

The terminal operation triggers evaluation.

------------------------------------------------------------------------

## 24.2 `map` vs `filter`

``` java
filter
```

keeps/removes elements.

``` java
map
```

transforms elements.

Think:

``` text
filter: N → ≤N
map:    N → N
```

------------------------------------------------------------------------

## 24.3 Avoid side effects in streams

Bad:

``` java
List<String> result = new ArrayList<>();

users.stream()
    .filter(...)
    .forEach(u -> result.add(u.getName()));
```

Prefer:

``` java
List<String> result = users.stream()
    .filter(...)
    .map(User::getName)
    .toList();
```

A stream pipeline is easiest to reason about when it describes **data
transformation**, not external mutation.

------------------------------------------------------------------------

# 25. High-ROI Java interview checklist

Before moving on, you should be able to explain these without notes:

### Exceptions

-   checked vs unchecked
-   `throw` vs `throws`
-   try-with-resources
-   suppressed exceptions
-   cause chaining
-   `finally`

### Collections

-   ArrayList vs LinkedList
-   HashMap internals
-   equals/hashCode
-   HashSet
-   LinkedHashMap vs TreeMap
-   ConcurrentHashMap
-   Queue/Deque
-   immutable collections
-   fail-fast iteration
-   generics + PECS

### Strings

-   immutability
-   pool
-   `==` vs `equals`
-   `intern`
-   StringBuilder vs StringBuffer
-   concatenation performance
-   regex Pattern/Matcher

### JVM

-   heap vs stack vs metaspace
-   reachability
-   young/old generations
-   G1
-   ZGC
-   GC diagnosis

### Concurrency

-   race condition
-   synchronized
-   volatile
-   atomics
-   executor pools
-   virtual threads

### Functional Java

-   functional interfaces
-   lambda
-   stream pipeline
-   map/filter/reduce
-   Optional
-   side effects

------------------------------------------------------------------------

# 26. The rule for studying this file

Do **not** reread the whole thing every time.

Use:

``` text
First pass
→ understand all mental models

Problem solving
→ identify the weak topic

Revision
→ reread only that section

Second problem set
→ verify that the concept stuck
```

The goal is not to memorise Java.

The goal is to build enough **mental compression** that an interview
question maps to a concept you already understand.
