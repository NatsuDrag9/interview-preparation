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

### URL Components

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
-
