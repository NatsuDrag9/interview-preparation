## Authentication and Authorization

**Authentication** - _who are you_

**Authorization** - _what can you do in a particular context_

## 3 Components of Authentication

#### Sessions

A session provides a way to establish a temporary server side context for each user. The server stored the user data along with session id is stored in a persistent storage - database or an in-memory redis store.

#### JWT

A stateless mechanism to transfer claims in a stateless manner between two systems. The key innovation is that jwt tokens are self-contained.
Has 3 parts:

- Header - contains metadata about jwt itself like signing algorithem
- Payload - user data stored in the jwt. Format:
  - sub - stores user id
  - iat - stores when jwt is issued
  - name - stores user info
- Signature - verifies whether the _user_ is the one who issued that jwt

Working:

- Client logs in
- Server sends a jwt token which is stored in the client's system
- With every subsequent request, client sends a JWT in either a authorization or in other forms like cookie.
- Server, when receives this jwt, verifies it with its secret key and identifies the client and checks its permissions

**Hybrid Approach**

- After server verifies the JWT, it can maintain a list of blacklisted tokens in the persistence store (either DB or redis). Using this blacklisted tokens, we can temporarily block certain users based on suspicious activity

The whole point of using JWT is statelessness. But if persistence storage lookup is being done, then why not use a statefull approach which can provide the above advantage.

To resolve such questions, we use an industry accepted **AuthProvider** which handles such stuff.

#### Cookie

The session id sent to the client in a cookie. Using this session id, the client can fetch stored data.

Cookie is a way to store a piece of information sent by server in browsers (client-side).

**Conditions**

- Cookie is only acceptable to that server which set it
- A cookie set by a server in the client's browser will be sent in all the subsequent request to that server by the client

**Flow**

- Client authenticates with username, password to the server
- On successful authentication, the server sets the cookie in the browser containing the authorization token (like JWT)
- Client's browser sents this cookie to the server to identify the user and perform appropriate actions

### Types of Authentication

#### Stateful

Flow:

- Client sends username, password to server
- On successful authentication, the server genrates a session-id and sends back to the client in a cookie
- All subsequent requests from client will contain this cookie having the session-id

session-id - cryptographic string or jwt

- Centralized storage of authetnication info
- High security
- But main challenge is limited scalability during distributed systems, latency issues when synchronizing between multiple servers located in different regions

#### Stateless

- Client sends username, password to server
- On successful authentication, the server generates a signed jwt token with a secret key. This secret key is used to sign the jwt token and verify it. JWT containing user info is sent back to client.
- Client sends this jwt in a **authorization** header to the Server for identification in all subsequent requests
- Server extracts the JWT token, decrypts it and verify the client

**Stateless** because no lookup is happening in a persistence store

- Easily scalable as authorization is not stateful
- However, revoking client's access based on suspicious activity is not possible by the server. We need to wait until the jwt token in the browser expires.

#### API Key

- A platform generates an API key so that the client can access that platform's server for a particular service
- Commonly used for programmatic use cases where the platform's service can be integrated into a custom backend application
- Ideal for machine-to-machine communication
- API key is used to authenticate a client. Our custom backend app can ask a client to provide its API key of that platform

#### Open Authorization (OAuth 2.0)

Solves the issue of authorization using delegation (to the authorization server).

**OAuth 1.0**

- Client redirects the the user to authorization server
- User authenticates and grants necessary permissions to the authorization server
- Authorization server generates a token based on user's cred and sends it to the client.
- Client uses this token to access a particular resource based on the permissions from the authorization server

**OAuth 2.0**

- Introduced bearer tokens
- Allowed developers to choose flows based on application type - mobile devices, smart tv, tabs, browsers, etc
-

#### Open Id Connect (OIDC)

This fills the gap of authentication in OAuth workflow. Extended OAuth workflow using ID token.

- ID token is a jwt with user info
- Allows sign-in with google, facebook, etc to authenticate the user in a custom backend app

### Using type of authentication based on use cases

- Stateful Auth - web apps for sass based models
- Stateless Auth - for APIs or scalabale systems with servers located in various regions
- OAuth - third party integrations and providing logic functionality using an external authorization server (like Google, FB)
- API Key - server-to-server communciation

### Authorization

Providing specific permissions to specific users. Not all users in the platform have the same access levels.

#### Roled Based Access Control (RBAC)

Different roles are assigned different permissions.

### Error Messages

Do not send detailed / specific messages to prevent attackers from deducing auth.
Instead send generic messages like _Authentication failed to incorrect username or password_

### Timing Attack

- User submits username, password
- Server verifies the creds - compares the provided password with the stored one (which is a hash key of the actual password)
- Server also checks whether the account is locked by checking whether user tried too many invalid attempts to `
- The comparison of both strings takes different amounts of time depending on the number of matching characters. Username comparison is faster than password comparison as it involves simple string matching. Password comparison has a delay.
- An attacker can exploit this delay to determine the correct password.
- To prevent timing attacks, use a constant-time comparison algorithm instead of the standard string comparison. The core principle is that the execution time does not depend on the input data.
- Another way is to simulate a fake delay to mask the actual delay caused by the comparison