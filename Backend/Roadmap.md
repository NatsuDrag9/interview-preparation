## Roadmap

### Table of Contents

_Focus Legend (Pragmatic Fullstack Prep):_

- **`[MANDATORY - Core]`** — Focus 100% of your energy here first. Covers 80% of coding and basic architecture interviews.
- **`[RECOMMENDED - Fullstack Glue]`** — Learn these second. Essential for connecting frontend/backend cleanly and building real-world projects.
- _Other topics_ — Theoretical/Advanced. Good for System Design rounds, but learn them at a high level without getting bogged down.

1. [Roadmap and Backend Introduction](#roadmap-and-backend-introduction)
2. [A high-level understanding](./Chapters/High_Level_Understanding.md)
3. [HTTP protocol](./Chapters/HTTP_Protocol.md) **`[MANDATORY - Core]`**
4. [Routing](./Chapters/Routing.md)
5. [Serialisation and deserialisation](./Chapters/Serialization_and_Deserialization.md)
6. [Authentication and Authorisation](./Chapters/Authentication_And_Authorization.md) **`[MANDATORY - Core]`**
7. [Validation and transformation](./Chapters/Validations_And_Transformations.md) **`[MANDATORY - Core]`**
8. [Middlewares](./Chapters/Backend_Layers.md) **`[RECOMMENDED - Fullstack Glue]`**
9. Request context
10. [Handlers, Controllers and Services](./Chapters/Backend_Layers.md) **`[MANDATORY - Core]`**
11. CRUD deepdive **`[MANDATORY - Core]`**
12. [RESTful Architecture and Best Practices](./Chapters/Rest_API_Design.md) **`[MANDATORY - Core]`**
13. [Databases](/Backend/Chapters/Databases.md) **`[MANDATORY - Core]`**
14. Business logic layer (BLL)
15. [Caching](./Chapters/Caching.md) **`[RECOMMENDED - Fullstack Glue]`**
16. Transactional emails
17. [Task queuing and scheduling](./Chapters/Task_Queues_And_Background_Jobs.md)
18. [Elastic Search](./Chapters/Elastic_Search.md)
19. Error handling **`[MANDATORY - Core]`**
20. [Config Management](./Chapters/Config_Management.md) **`[RECOMMENDED - Fullstack Glue]`**
21. [Logging, Monitoring and Observability](./Chapters/Logging_Monitoring_Observability.md)
22. Graceful shutdown
23. [Security](./Chapters/Security.md)
24. [Scaling and Performance](./Chapters/Scaling_And_Performance.md)
25. [Concurrency and Parallelism](./Chapters/Concurrency_And_Parallelism.md)
26. Object storage and large files
27. Real-time backend systems
28. Testing and Code Quality **`[RECOMMENDED - Fullstack Glue]`**
29. 12 factor app
30. OpenAPI standards
31. Webhooks
32. DevOps for backend engineers

### Roadmap And Backend Introduction

This file contains the entire story of backend development answering two primary questions - _the what
and why of each topic_

The main idea is to provide a strong foundation on backend development so that the reader can

- build robust, scalable and maintainable backend systems
- face backend interviews with confidence

#### Components of Backend

- Repository Layer - contains database to store data
- Service Layer - contains business logic. Calls a few repository methods and communicates with client via apis, webhooks, etc
- Controllers - contains HTTP related stuff (error codes, data format, etc). Executes the business logic by calling appropriate API methods defined in service layer which is then returned to the user in form of HTTP responses. Similarly, it accpets any data from the user and passes it forward to the appropriate service layer methods.
- Route layer - contains route matching algorithm to match the route of the API request
