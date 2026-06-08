## Authentication and Authorization

**Authentication** - _who are you_

**Authorization** - _what can you do in a particular context_

## 3 Components of Authentication

#### Sessions

A session provides a way to establish a temporary server side context for each user. The server stores the user data along with session id in a persistent storage - database or an in-memory redis store.

#### JWT

A mechanism to transfer claims in a stateless manner between two systems. The key innovation is that jwt tokens are self-contained.
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
- Server, when receives this jwt, verifies it with its secret key, identifies the client and checks its permissions

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
- On successful authentication, the server generates a session-id and sends back to the client in a cookie
- All subsequent requests from client will contain this cookie having the session-id

session-id - cryptographic string or jwt

- Centralized storage of authentication info
- High security
- But main challenge is limited scalability during distributed systems, latency issues when synchronizing between multiple servers located in different regions

#### Stateless

- Client sends username, password to server
- On successful authentication, the server generates a signed jwt token with a secret key. This secret key is used to sign the jwt token and verify it. JWT containing user info is sent back to client.
- Client sends this jwt in a **authorization** header to the Server for identification in all subsequent requests
- Server extracts the JWT token, decrypts it and verifies the client

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

Reference - [Backend From First Principles](<(https://www.youtube.com/watch?v=0Rwb4Xmlcwc&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1)>)

---

### Types of Authentication

#### Basic Authentication

Username and password entered by the user is compared to the stored username and password in the backend

**Steps**

- User enters username and password in the login page
- User makes an API request to the backend with username and password in payload
- Backend extracts the username and password from payload and checks whether the user exists in the database
- If user exists, then checks the password
- If password matches, then generates a session id and sends it back to the client in a cookie
- Client sends this cookie to the server in every subsequent requests as user identification to perform appropriate actions

#### OAuth / OAuth 2.0

It allows a user to grant a third-party application limited access to their resources on another service (like their Google or Facebook account) without ever sharing their password.

**Authorization Server (AS)** - Authenticates the user, obtains consent, and issues the **Access Token**.
**Resource Server (RS)** - Hosts the protected user data (e.g., API endpoints) and accepts access tokens.

- **Relationship**: The RS trusts the AS. To validate a token, the RS either cryptographically verifies its signature (using the AS's public keys) or calls the AS's token introspection endpoint.

**Steps (Authorization Code Flow)**:

1.  **Redirect**: User clicks login; Client redirects User to the **Authorization Server** (AS).
2.  **Consent**: User authenticates and grants permissions (scopes).
3.  **Auth Code**: AS redirects User back to Client's redirect URI with an **Authorization Code** (in the URL query parameter).
4.  **Token Exchange**: Client's backend exchanges the Authorization Code + Client Secret with the AS for an **Access Token**.
5.  **Resource Request**: Client calls the **Resource Server** (RS) with the Access Token (typically in the `Authorization: Bearer <token>` header).
6.  **Validation**: RS validates the Access Token (via the AS public key or AS introspection endpoint).
7.  **Response**: RS verifies the token scopes and returns the protected data to the Client.

#### Open Id Connect (OIDC)

OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0. It allows you to verify the identity of the user and obtain basic profile information from them.

**Key Component**: **ID Token** (a JSON Web Token - JWT).

**Flow (Implicit Flow Example)**:

1.  **Redirect**: User clicks login; Client redirects the browser to the Authorization Server (AS).
2.  **Authentication**: User logs in to the AS.
3.  **Token Delivery**: The AS redirects the browser back to the Client's **Redirect URI** with the **ID Token** and **Access Token** in the URL fragment (`#`).
4.  **Client Processing**: The Client extracts the tokens from the URL.
5.  **Validation & Session**: The Client validates the ID Token signature and claims (e.g., `sub`, `iss`, `exp`). Upon success, it establishes a local session for the user (e.g., via a cookie).
6.  **Resource Access**: For subsequent requests to a Resource Server (RS), the Client uses the Access Token from step 3.

**Key Difference from OAuth**: OAuth is for **Authorization** (granting access to resources). OIDC is for **Authentication** (proving who the user is) and uses the ID Token to convey identity information.

#### JSON Web Tokens (JWT)

A JSON Web Token (JWT) is a compact, URL-safe means of representing data to be transferred between two parties. The data in a JWT are encoded as a JSON object that is simply signed using JSON Web Signature (JWS) or optionally encrypted using JSON Web Encryption (JWE).

**Structure**

A JWT consists of three parts:

- **Header**: Contains the type of the token and the signing algorithm being used.
- **Payload**: Contains the claims, which are the statements about an entity (typically, the user), and any additional data.
- **Signature**: Used to verify the integrity of the token. It is created by signing the header and payload with a secret key.

**Flow**

1.  **Authentication**: User logs in with username and password
2.  **Token Generation**: Server generates a JWT token with user info and sends it to the client
3.  **Client Request**: Client sends the JWT token in the Authorization header to the server for authentication
4.  **Token Validation**: Server validates the JWT token
5.  **Response**: Server returns the requested resource to the client

**Example JWT**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Reference - [Backend Cheat Sheet](https://github.com/cheatsnake/backend-cheats#common-authentication-patterns)
