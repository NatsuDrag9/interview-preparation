## Roadmap

### Table of Contents

1. [Roadmap and Backend Introduction](#roadmap-and-backend-introduction)
2. [A high-level understanding](./Chapters/High_Level_Understanding.md)
3. [HTTP protocol](./Chapters/HTTP_Protocol.md)
4. [Routing](./Chapters/Routing.md)
5. [Serialisation and deserialisation](./Chapters/Serialization_and_Deserialization.md)
6. [Authentication and Authorisation](./Chapters/Authentication_And_Authorization.md)
7. [Validation and transformation](./Chapters/Validations_And_Transformations.md)
8. [Middlewares](./Chapters/Backend_Layers.md)
9. Request context
10. [Handlers, Controllers and Services](./Chapters/Backend_Layers.md)
11. CRUD deepdive
12. [RESTful Architecture and Best Practices](./Chapters/Rest_API_Design.md)
13. Databases
14. Business logic layer (BLL)
15. [Caching](./Chapters/Caching.md)
16. Transactional emails
17. [Task queuing and scheduling](./Chapters/Task_Queues_And_Background_Jobs.md)
18. Elastic Search
19. Error handling
20. Config management
21. Logging, monitoring and observability
22. Graceful shutdown
23. Security
24. Scaling and performance
25. Concurrency and parallelism
26. Object storage and large files
27. Real-time backend systems
28. Testing and code quality
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
