## Routing

Expresses the **where** of the intent (HTTP methods). It is essentially mapping url params to the server side logic.

Routing logic - HTTP method + route

```
GET /api/books
POST /api/books

```

The above don't create conflict because the routing logic is unique for each request despite having the same location within the server

### Types of Routes

**Static routes**: `/api/books`

**Dynamic routes**:

- Path parameter - `/api/books/:id` where the path parameter `:id` is replaced during the client request
- Query parameter -`/api/books/?query=<query-param>`

**Nested routes**:
Has a path parameter 1 level deeper.

```
 GET `/api/books/:id/pages/:id`
```

The `pages/:id` indicates that for a book with a given id, we fetch a page with a given id. The page's id indicates nesting within the book.

**Catch-all Route**
If client sends a request to a route which the server doesn't serve for, then the server can respond with a _Route Not Found_ message. Essentially, the path (route) doesn't exist in the server. This is different from 404 which is an error code returned by the server when it couldn't locate the requested resource.

Catch-all routes are frequently used to implement 404 pages.

### Route Versioning

```
// Version 1
/api/v1/products

// Version 2
/api/v2/products
```

Version 1 returns data in one format.
After new requirements, version 2 returns data in another format. This way, version 1 can be deprecated safely with sufficient time periods for the frontend engineers to make changes.
