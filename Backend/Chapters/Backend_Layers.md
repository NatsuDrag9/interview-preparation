## Backend Layers


### Request Lifecycle

Flow of request from client to database:
- Client originates the request
- Request reaches the entery point of the server, i.e. the port it is listening on
- Routing mechanism maps the request route and HTTP method to a specific handlers / controllers. 
- Handlers / controllers extract necessary data from the request
- Deserialize data into expected server side types and data structures.
- Validate and transform the deserialized data
- Controller / Handler then calls the service layer containing business logic.
- Service layer passes the data to the repository layer
- Repository layer constructs the database query based on the data and returns the output
- The service layer receives the response from respository layer and returns this response to controller layer
- Depending on the success/failure of the service method, the controller layer decides upon the appropriate response code
- Controller then sends back response to the client

### Middlewares
Middleware are optional functions that sit in the middle: 
- Before, during and after routing mechanism
- In the middle of handler -> service -> repository flow
- After repository, before service 
- After service, before handler and;
- After handler, before sending the response to the client

They can be used to perform various operations:
- Logging requests and responses
- Error handling
- Authentication and authorisation
- Logging and monitoring
- Setting default values for optional fields

A middleware gets `req`, `resp`, `next` from the language runtime. `next` is used to execute the next middleware (the next processing context) in the chain. 

#### Examples of Middlewares

- Security - CORS, security header, authentication, rate limit
- Logging and Monitoring - log info for easy debugging
- Global Error Handling - An example is to properly structure errors and send it to the client (not raw errors). Usually placed at the end of the middleware chain to catch any errors from previous middlewares.
- Compression - Compressing large data like images or videos using gzip.
- Data Parsing - Process of serializing / deserializing the data


#### Ordering of Middlewares

Commonly followed order:
1. CORS
2. Logging
3. Authentication
4. Data Parsing
5. Compression
6.Global Error Handling

### Request Context

A temporary data store / state, typically stored as a key-value pair, which is scoped exclusively to a single, specific API request lifecycle. It is created when the request enters the server, shared across all layers, and destroyed once the response is sent back to the client.


#### Why Do We Need It?
Without a Request Context, if a deep layer (like the Repository Layer) needs access to the logged-in User's ID or a Correlation ID, you would have to pass these values as arguments through **every single function** from the Controller to the Service to the Repository. This is known as *"prop-drilling"* and pollutes clean function signatures. Request Context allows layers to share data implicitly.


### Handlers / Controllers
All HTTP related stuff (like headers, response, body) are handled by the handlers / controllers.

Receives two objects as parameters:
- request
- response

The handler first extracts the necessary data from the request object depending on the method:
- GET - query params, path params,
- POST/PUT/PATCH - body
- DELETE - query params, path params, body

### Deserialisation

Deserialize the extracted data into native types and data structures of server side programming language. This is also called binding.

If deserialisation fails, the client is notified with an 400 Bad Request. Otherwise the request is allowed to proceed.


### Validation and Transformation

After deserialisation, the data is passed through validation and transformation layer. Here the data is validated and optionally transformed into expected server side types and data structures. If validation fails, the client is notified with 400 BAD REQUEST.

In transformation layer, we can set default values for optional fields like query or path params. For eg, if the user doesn't provide a value for `sort` query param, we can set it to `createdAt`.

This helps the downstream layer by ensuring that the data can be processed in an expected format.

### Service Layer

A good evaluation parameter is that whether a function(s) in this layer being used in an API. A good service layer function should not be used in an API. Instead the service layer function should be used by multiple APIs. 

Service layer can also use multiple repository methods to perform different operations like merging different types of data obtained from the database (repository layer), etc.

All the actual processing of the API (like sending an email, web hook notifications, etc.) happens in the service layer. It is also called as the _business logic layer_.

### Repository Layer

All database calls (CRUD operations) happens here. It is also called as the _persistence layer_. 
Some operations:
- Data insertion
- Fetching data
- Updating data
- Deleting data


