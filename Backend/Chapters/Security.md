## Security

### Cross Origin Resource Sharing (CORS)

Used because browsers have a same-origin policy by default to restrict making requests to a domain different from the one serving the web-page.

**CORS** is a security mechanism enforced by browsers to control how web applications interact with resources hosted on different domains (origins).

#### Types of Flows

**Simple Request**

When a cross-origin request qualifies as "simple" (GET, POST, or HEAD method; only simple headers like Accept, Content-Type; simple Content-Types), the browser sends the request directly with the Origin header, skipping the preflight OPTIONS request. The server responds with Access-Control-Allow-Origin. If the origin matches (or \* is set), the browser allows JavaScript access to the response. If not, the request completes on the server but the browser blocks access to the response, resulting in a CORS error on the client.

**Pre-flight Request**
Apart from _Origin_ and server domain being different, to qualify as a pre-flight request, one fo these 3 have to be true:

- Method is not GET, POST, or HEAD (eg. PUT, DELETE)
- Request includes non-simple headers (like Authorization, X-Custom-Header)
- The request has a Content-Type other than `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`.

Made using `OPTIONS` method

**Browser Request**:
OPTIONS /api/resource HTTP/1.1
Host: api.anotherdomain.com
Origin: https://example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Authorization

Browser is making a cross-origin-request to the server at `api.anotherdomain.com` to ask whether it supports the `PUT` method for this route and asks whether `Authorization` header is supported.

**Server Response**:
HTTP/1.1 2-4 No Content
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: PUT, DELETE
Access-Control-Allow-Headers: Authorization
Access-Control-Max-Age: 86400 // Server says the config specified will be same for 24 hrs (86400s) so don't make another request to me
