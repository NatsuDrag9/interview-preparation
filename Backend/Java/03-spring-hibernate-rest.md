# 03 --- Spring + Hibernate + REST Interview Theory

> **Goal:** understand the mechanics behind the Spring Boot stack rather
> than memorising annotations.

------------------------------------------------------------------------

# 1. The Spring mental model

The central idea is:

``` text
Your classes
    ↓
Spring IoC container
    ↓
creates objects
    ↓
injects dependencies
    ↓
applies lifecycle callbacks / proxies
    ↓
application runs
```

Spring is fundamentally an **object construction + wiring + lifecycle +
proxy framework**.

------------------------------------------------------------------------

# 2. Dependency Injection

Without DI:

``` java
class UserService {
    private final UserRepository repo =
        new UserRepository();
}
```

The class chooses its dependency.

With DI:

``` java
class UserService {

    private final UserRepository repo;

    UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

Now someone else supplies the dependency.

Spring's container becomes that "someone else."

Benefits:

-   loose coupling
-   easier testing
-   explicit dependencies
-   easier implementation replacement

------------------------------------------------------------------------

# 3. Constructor injection

Preferred:

``` java
@Service
class UserService {

    private final UserRepository repo;

    UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

Why?

-   dependencies are explicit
-   fields can be `final`
-   object cannot exist without required dependencies
-   easy unit testing
-   no reflection-based field injection

If a class has too many constructor dependencies, consider that a design
signal rather than switching to field injection.

------------------------------------------------------------------------

# 4. Component stereotypes

``` text
@Component
├── @Service
├── @Repository
├── @Controller
└── @RestController
```

The stereotypes communicate intent.

### `@Component`

Generic Spring-managed bean.

### `@Service`

Business/service layer.

### `@Repository`

Data-access component; also participates in Spring's persistence
exception translation.

### `@Controller`

MVC controller.

### `@RestController`

Conceptually:

``` text
@Controller
+
@ResponseBody
```

so return values become response bodies.

------------------------------------------------------------------------

# 5. Bean lifecycle

Simplified:

``` text
instantiate
   ↓
dependency injection
   ↓
Aware callbacks
   ↓
BeanPostProcessor (before init)
   ↓
@PostConstruct
   ↓
afterPropertiesSet()
   ↓
custom init
   ↓
BeanPostProcessor (after init)
   ↓
READY
```

Shutdown:

``` text
@PreDestroy
   ↓
destroy()
   ↓
custom destroy
```

You do not need to memorise every lifecycle interface initially.

Know the important hooks:

-   constructor
-   dependency injection
-   `@PostConstruct`
-   `BeanPostProcessor`
-   `@PreDestroy`

------------------------------------------------------------------------

# 6. Singleton in Spring

Important distinction:

> Spring singleton ≠ "one object in the whole JVM."

It means:

> **one instance per Spring container/application context.**

Default scope:

``` java
@Scope("singleton")
```

Most services should be stateless singletons.

Avoid mutable request-specific state in singleton beans.

------------------------------------------------------------------------

# 7. Prototype trap

Suppose:

``` text
SingletonService
      ↓
PrototypeBean
```

The singleton is created once.

Therefore the prototype dependency injected into it is normally obtained
once.

It does **not** magically create a new prototype every method call.

For fresh instances use:

-   `ObjectProvider`
-   `ObjectFactory`
-   `Provider`
-   `@Lookup`

------------------------------------------------------------------------

# 8. ApplicationContext vs BeanFactory

``` text
BeanFactory
    ↓
basic IoC container

ApplicationContext
    ↓
BeanFactory +
events
i18n
resources
environment
application infrastructure
```

In normal Spring Boot applications:

> **ApplicationContext is what you work with.**

------------------------------------------------------------------------

# 9. `@Configuration` + `@Bean`

Use:

``` java
@Configuration
class AppConfig {

    @Bean
    Client client() {
        return new Client(...);
    }
}
```

when you need explicit construction/wiring.

Especially useful for third-party classes you cannot annotate.

Use:

``` java
@Component
```

when the class itself is yours and should be discovered by component
scanning.

------------------------------------------------------------------------

# 10. Spring Boot

Spring Boot mainly provides:

``` text
convention
+
auto-configuration
+
starters
+
embedded infrastructure
+
production tooling
```

It does not replace Spring.

------------------------------------------------------------------------

# 11. `@SpringBootApplication`

Conceptually:

``` text
@SpringBootApplication
=
@Configuration
+
@EnableAutoConfiguration
+
@ComponentScan
```

This is one of the highest-ROI Spring interview questions.

------------------------------------------------------------------------

# 12. Auto-configuration

The mental model:

``` text
classpath
+
properties
+
existing beans
      ↓
conditions
      ↓
reasonable default beans
```

For example, if the JPA dependencies exist and the application has
suitable configuration, Spring Boot can automatically configure much of
the JPA infrastructure.

Conditional annotations are central:

``` java
@ConditionalOnClass
@ConditionalOnBean
@ConditionalOnMissingBean
@ConditionalOnProperty
```

The important principle:

> **Boot provides defaults, but backs off when you provide your own
> configuration.**

------------------------------------------------------------------------

# 13. Starters

A starter is mainly dependency aggregation.

For example:

``` text
spring-boot-starter-web
        ↓
Spring MVC
Jackson
Tomcat
validation
etc.
```

The starter gives you the dependencies; auto-configuration wires the
appropriate infrastructure.

------------------------------------------------------------------------

# 14. AOP

AOP handles cross-cutting concerns:

-   transactions
-   security
-   caching
-   async execution
-   logging
-   metrics

Spring AOP is primarily **proxy-based**.

Conceptually:

``` text
caller
  ↓
proxy
  ↓
advice
  ↓
real object
```

------------------------------------------------------------------------

# 15. The self-invocation trap

This:

``` java
this.someTransactionalMethod();
```

happens inside the real object.

It bypasses the Spring proxy.

Therefore proxy-based advice such as:

``` java
@Transactional
@Async
```

may not run.

Mental model:

``` text
external call
→ proxy
→ advice
→ target

internal this.call()
→ target directly
```

This single mental model explains many Spring interview traps.

------------------------------------------------------------------------

# 16. `@Transactional`

Conceptually:

``` text
caller
  ↓
transaction proxy
  ↓
begin/join transaction
  ↓
method
  ↓
commit / rollback
```

Default rollback:

``` text
RuntimeException → rollback
Error            → rollback
checked exception → no rollback by default
```

For a checked exception:

``` java
@Transactional(
    rollbackFor = PaymentException.class
)
```

------------------------------------------------------------------------

# 17. Transaction propagation

Most important:

### REQUIRED

Default.

``` text
existing transaction?
    yes → join it
    no  → create one
```

### REQUIRES_NEW

``` text
existing transaction
      ↓ suspend
new transaction
```

Useful when an operation must commit independently.

Do not memorise all propagation modes until the basic two are solid.

------------------------------------------------------------------------

# 18. Isolation

The classic levels:

``` text
READ_UNCOMMITTED
READ_COMMITTED
REPEATABLE_READ
SERIALIZABLE
```

The trade-off is essentially:

``` text
more isolation
→ stronger consistency
→ potentially less concurrency
```

Know the anomalies:

``` text
dirty read
non-repeatable read
phantom read
```

------------------------------------------------------------------------

# 19. Spring Security mental model

A request roughly flows through:

``` text
HTTP request
   ↓
SecurityFilterChain
   ↓
authentication
   ↓
SecurityContext
   ↓
authorization
   ↓
controller
```

Separate:

``` text
Authentication
= Who are you?

Authorization
= Are you allowed to do this?
```

------------------------------------------------------------------------

# 20. Passwords

Never store plain passwords.

Use a password hashing algorithm such as:

``` text
BCrypt
Argon2
PBKDF2
```

A password hash is intentionally expensive to compute.

Verification is:

``` text
submitted password
        ↓
encoder.matches(...)
        ↓
stored hash
```

Do not compare password hashes as if they were simple deterministic
hashes; modern password encoders include salts.

------------------------------------------------------------------------

# 21. JWT / stateless API

For a stateless JWT API:

``` java
sessionCreationPolicy(STATELESS)
```

means Spring Security does not use an HTTP session as the authentication
store.

Conceptually:

``` text
request
  ↓
Authorization: Bearer <JWT>
  ↓
validate token
  ↓
build Authentication
  ↓
SecurityContext
  ↓
authorization
```

The server does not need a session containing the user's authentication
state.

------------------------------------------------------------------------

# 22. CSRF

CSRF is primarily a browser/session/cookie concern.

For a truly stateless API where credentials are supplied through an
`Authorization` header rather than automatically attached cookies, CSRF
protection is generally not needed in the same way.

Do not blindly say:

> "Disable CSRF in every Spring application."

Context matters.

------------------------------------------------------------------------

# 23. JPA mental model

Think:

``` text
Java object
    ↕
EntityManager / persistence context
    ↕
SQL
    ↕
database
```

JPA is the specification.

Hibernate is a common implementation.

Spring Data JPA sits above JPA and gives repository abstractions.

``` text
Spring Data JPA
      ↓
JPA
      ↓
Hibernate
      ↓
JDBC
      ↓
Database
```

------------------------------------------------------------------------

# 24. Persistence Context

The persistence context acts like a first-level identity map.

Within a persistence context, the same database row is represented by
the same managed entity instance.

It also tracks changes.

Example:

``` java
user.setName("Alice");
```

You may not immediately issue SQL yourself.

Hibernate can detect the change through **dirty checking** and flush it
later.

------------------------------------------------------------------------

# 25. Entity lifecycle

Simplified:

``` text
new/transient
    ↓ persist
managed
    ↓ detach
detached
    ↓ remove
removed
```

A managed entity is tracked by the persistence context.

------------------------------------------------------------------------

# 26. Flush vs commit

These are not the same.

### Flush

Synchronizes pending changes from the persistence context to the DB.

### Commit

Finalizes the database transaction.

Think:

``` text
entity changes
    ↓
flush
    ↓
SQL sent
    ↓
commit
    ↓
transaction finalized
```

A flush does not necessarily mean the transaction is committed.

------------------------------------------------------------------------

# 27. LAZY vs EAGER

### LAZY

Load association when needed.

### EAGER

Load association immediately according to the provider's strategy.

For collections, prefer:

``` text
LAZY
```

and explicitly fetch what a query needs.

Why?

Because EAGER relationships can produce unexpected SQL and N+1 queries.

------------------------------------------------------------------------

# 28. N+1 problem

Example:

``` text
query all orders
     ↓
1000 orders
     ↓
query items for order 1
query items for order 2
...
query items for order 1000
```

Total:

``` text
1 + 1000 = 1001 queries
```

Common solutions:

-   `JOIN FETCH`
-   `@EntityGraph`
-   carefully designed DTO projections
-   batch fetching where appropriate

The key idea:

> **Fix the query shape, not merely the connection pool.**

------------------------------------------------------------------------

# 29. Cascade vs orphanRemoval

Cascade:

``` text
operation on parent
        ↓
propagates to child
```

`CascadeType.ALL` includes:

``` text
PERSIST
MERGE
REMOVE
REFRESH
DETACH
```

Use cascade when the child is part of the parent's lifecycle.

Example:

``` text
Order
 └── OrderItem
```

Be careful with:

``` java
CascadeType.REMOVE
```

when the child has an independent lifecycle.

`orphanRemoval = true` is related but distinct:

> removing the child from the parent's collection can delete that child.

------------------------------------------------------------------------

# 30. Optimistic vs pessimistic locking

### Optimistic

Use:

``` java
@Version
private Long version;
```

Two transactions can read concurrently.

If another transaction updates first:

``` text
version mismatch
→ OptimisticLockException
```

Best when conflicts are relatively rare.

### Pessimistic

Use a database lock such as:

``` text
SELECT ... FOR UPDATE
```

Best for short-lived, high-contention updates where waiting is
preferable to retries.

Examples:

-   inventory
-   account balance
-   very hot rows

------------------------------------------------------------------------

# 31. Spring Data repositories

Common abstraction:

``` java
interface UserRepository
        extends JpaRepository<User, Long> {
}
```

Spring Data generates much of the implementation.

Useful features include:

-   derived queries
-   pagination
-   sorting
-   projections
-   specifications

------------------------------------------------------------------------

# 32. Projections

If you only need:

``` text
name
email
```

do not necessarily load a huge entity containing:

``` text
name
email
address
orders
audit
preferences
...
```

A projection can request only required fields.

This reduces:

-   DB IO
-   object creation
-   heap usage

------------------------------------------------------------------------

# 33. Specifications

For optional search filters:

``` text
name?
status?
region?
date range?
```

building giant JPQL strings becomes messy.

Specifications let you compose predicates:

``` text
hasName
  AND hasStatus
  AND createdBetween
```

They are useful for dynamic search APIs.

------------------------------------------------------------------------

# 34. REST fundamentals

Think in resources:

``` text
/orders
/orders/123
```

rather than action URLs such as:

``` text
/getOrder
/createOrder
```

Typical HTTP semantics:

``` text
GET    → retrieve
POST   → create / command-like operation
PUT    → replace
PATCH  → partial update
DELETE → remove
```

------------------------------------------------------------------------

# 35. Idempotency

An operation is idempotent when repeating it has the same intended
effect as performing it once.

Typical:

``` text
GET    → idempotent
PUT    → idempotent
DELETE → generally idempotent
POST   → not inherently idempotent
```

For payment/order APIs, explicit idempotency keys can make retry-safe
operations possible.

------------------------------------------------------------------------

# 36. HTTP status codes

Know the families:

``` text
2xx → success
3xx → redirection
4xx → client/request problem
5xx → server-side problem
```

High ROI:

``` text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
```

Important distinction:

``` text
401 → authentication missing/invalid
403 → authenticated but not allowed
```

------------------------------------------------------------------------

# 37. Global exception handling

Instead of:

``` java
try/catch
```

in every controller:

``` java
@RestControllerAdvice
class GlobalExceptionHandler {
    ...
}
```

This gives one place to map domain exceptions to HTTP responses.

Spring 6 also provides `ProblemDetail` for standardized error responses.

------------------------------------------------------------------------

# 38. Validation

DTO:

``` java
class CreateUserRequest {

    @NotBlank
    String name;

    @Email
    String email;
}
```

Controller:

``` java
@PostMapping
ResponseEntity<?> create(
    @Valid @RequestBody CreateUserRequest request
) {
    ...
}
```

Validation failures should become structured client errors rather than
leaking stack traces.

------------------------------------------------------------------------

# 39. Pagination

Never return an unbounded database result set for a production endpoint.

Typical:

``` text
?page=0&size=20
```

For very large datasets, cursor/keyset pagination can outperform large
`OFFSET` values.

Mental model:

``` text
small/simple → offset pagination
huge/rapidly changing → cursor/keyset pagination
```

------------------------------------------------------------------------

# 40. API versioning

Common strategies:

``` text
/v1/orders
/v2/orders
```

or header/media-type based versioning.

Whatever strategy you choose:

> **Version the contract, communicate deprecation, measure usage, then
> remove.**

Do not silently break existing consumers.

------------------------------------------------------------------------

# 41. OpenAPI / Swagger

OpenAPI describes:

-   endpoints
-   parameters
-   request bodies
-   responses
-   schemas
-   authentication

For modern Spring Boot applications, generated API documentation is
usually preferable to maintaining a large hand-written specification
that can drift from code.

------------------------------------------------------------------------

# 42. Production thinking

For a Spring service, know the basic observability stack:

``` text
logs
+
metrics
+
traces
+
health checks
+
profiles/config
+
JFR/GC diagnostics
```

Spring Boot Actuator provides endpoints for production diagnostics.

Do not expose sensitive actuator endpoints publicly without security.

------------------------------------------------------------------------

# 43. High-ROI Spring checklist

### Spring Core

-   DI
-   constructor injection
-   stereotypes
-   bean lifecycle
-   singleton/prototype
-   ApplicationContext
-   `@Configuration` + `@Bean`
-   AOP/proxies

### Spring Boot

-   `@SpringBootApplication`
-   auto-configuration
-   starters
-   configuration properties
-   profiles
-   Actuator

### Transactions

-   `@Transactional`
-   rollback rules
-   propagation
-   isolation
-   self-invocation trap

### Security

-   authentication vs authorization
-   SecurityFilterChain
-   password hashing
-   JWT/stateless APIs
-   CSRF context

### JPA/Hibernate

-   persistence context
-   entity lifecycle
-   dirty checking
-   flush vs commit
-   LAZY/EAGER
-   N+1
-   cascade/orphan removal
-   optimistic/pessimistic locking
-   projections

### REST

-   resource-oriented URLs
-   HTTP semantics
-   status codes
-   validation
-   exception handling
-   pagination
-   idempotency
-   API versioning
-   OpenAPI

------------------------------------------------------------------------

# 44. How to study this file

For every topic ask yourself:

### 1. What problem does it solve?

Example:

``` text
@Transactional
→ keeps a group of DB operations atomic
```

### 2. How does it work?

``` text
Spring proxy
→ transaction starts
→ method executes
→ commit/rollback
```

### 3. What is the trap?

``` text
self-invocation bypasses proxy
```

### 4. When would I choose something else?

``` text
REQUIRED vs REQUIRES_NEW
LAZY vs explicit JOIN FETCH
optimistic vs pessimistic locking
offset vs keyset pagination
```

If you can answer those four questions, you are much closer to
interview-ready than if you memorise 100 annotation definitions.
