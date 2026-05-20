## Rpresentational State Transfer (REST) API Design

Constraints to solve the problem of scalability in world-wide web:

- Client-Server functionality constraint
- Uniform Interface - Simplifies the overall system architecture by establishing a standardized way of web components to communicate with each other
- Layered System - Architecture composed of heirarchical layer and, each layer can only see and interact with the layer immediately below it
- Cache - Responses from server must be explicitly labeled as cacheable or non-cacheable
- Stateless - Each request from the client to the server must contain all the necessary information to process data. The server does not store any client context
- Code On Demand (optional) - Servers can temporarily extend client functionality by transferring executable code to the client (like JS)

### Representational

Resources on the web are representated in a specific format like JSON, XML, HTML depending on the context.
For eg:

- A server-to-server communication will depend on JSON based representation
- A server-to-client communication will depend on HTML based representation
- XML

### State

The current condition or attribute(s) of a particular resource. And, each resource has a state that can be transferred between client and server.

### Transfer

Movement of resource representations between client and server. The transfer of data happens through a common standard - HTTP methods like GET, POST, etc.

**RESTful** standards eliminates human related errors in the application.

### Anatomy of RESTful URL Route

`https://sriniously.xyz/blog/zist?q=something#header`

- **https** - scheme like http, https
- **sriniously.xyz** - authority or main domain
- **/blog/zist** - resource being accessed. `/` represents a heirarchical relationship between different resources
- `?q=something` - pass query parameters for more info like filters, parameters, etc.
- `#header` - navigates / scrolls to a particular section of a webpage

#### Industry Standard

`https://<sub-domain>/<versioning>/<resource>`

- versioning - v1, v2, ...
- resource - word should be in plural form

To fetch information of a single resource (say book), the url is:
`https://api.example.com/v1/books/1`

`resource` remains plural but `id` fetches the particular book

**Readability of URLs**

- No spaces
- No underscores
- Slug of url is in small case; Any space is replaced with hyphen

### Idempotency

The property of certain operations in which performing the same action multiple times has the same effect as performing it once.

In this context, it doesn't matter how many times the client performs a particular request, the outcome in the server environment is (should be) the same. Idempotent means that what side-effect (the _change_) can be caused in the server, and whether it remains the same during every api call in the server environment.

For eg:

- GET - Fetches the same resources regardless of how many times the API is called
- PUT, PATCH requests are idempotent - For any update operation (PATCH, PUT), idempotency is maintained for every API call with same body
- DELETE - In first API call DELETE id = 1 deletes a record with id = 1. Subsequent API calls, server sends 404 error if client tries to delete id = 1 regardless of how many times the DELETE/1/ request is made
- POST requests are not idempotent - Each API calls always create a new record with a different id despite having same body

**POST** - Say, an operation is not strictly a _create_ operation and it can't be placed under any of the R, U, D operations then, we can place it in POST.
For eg, send EMAIL. These POST requests return 200 instead of 201 as they don't create

### Designing Interface of API

- Start from UI designing interface to understand how the end user interact with the platform
- List the resources - a good thumb rule is all the _nouns_ involved
- DB schema design using the resources
- Interface design of API
  - List APIs -
    - returns a list of records
    - pagination with `page` and `limit` as query params
    - sorting - `sortBy` and `sortOrder` as query params
    - filtering - `<name-of-filtering-param>` with its value as query params
    - server should take sane defaults. Clients shouldn't be burdened to provide default params
  - A 404 error code is sent when client requests for a single resource or a particular resource. For list apis, just return empty array and any pagination details
  - If JSON is used as serialization format then keys are declared in camelCase.
-

### Best Practices for API Engineers

- **Extract Nouns from UI**: Before coding, look at the frontend wireframes (like Figma) to figure out what data the user interacts with. Identify the "nouns" (e.g., projects, users, tasks); these become your API's core resources.
- **Implement "Sane Defaults"**: Your server should not crash if a client forgets to send optional data. If a client doesn't pass a pagination limit, default it to `10`. If they don't provide a sort order, default to sorting by `created_at` in `descending` order. If a new organization is created without a status, default it to `active`.
- **Total Consistency**: Be ruthlessly consistent. JSON payloads should always use `camelCase`. If an endpoint expects a field called `description`, do not abbreviate it to `desc` in another endpoint. Inconsistencies force other developers to guess, leading to bugs.
- **Interactive Documentation**: Always use tools like Swagger/OpenAPI to generate an interactive playground. This acts as both documentation for front-end developers and a testing ground for you.
