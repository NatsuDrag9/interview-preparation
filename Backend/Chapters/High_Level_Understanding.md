## High Level Understanding

The essence of backend is _data_ - what is the source of truth, where is it stored, how is it manipulated, how is it protected, when and were is it retrieved

### Request travel

1. Originates from a client (like browser)
2. Goes to DNS which then points to the AWS instance
3. Then reaches the AWS firewall which protects the traffic at infrastructure level
4. Next, the request reaches AWS instance where nginx is running. The nginx is a reverse proxy which points the request to the actual server-ip in the instance.
5. Finally, the request reaches the local server within an AWS instance.

### Why can't we do everything on Frontend and why do we need a backend?

- Security reasons - security policies of brwsers are very restricitive
- CORS issue
- Connection pool to databases - prevents connection/reconnection to databases on each request
- Higher computing power for business logic
