## Web Sockets

A persistent bidirectional connection between client and server that allows for real-time communication. The basic idea is that once a WebSocket connection is established, the client and server can send messages to each other at any time without the need for the client to repeatedly request data. This is different from HTTP where the client has to make a request to the server to get the latest data, which can be inefficient and cause delays in real-time applications.

Steps:
- Opening a web socket connection - Send a HTTP request with a specific set of headers called `Connection: Upgrade` and `Upgrade: websocket`, `Sec-WebSocket-Key`, etc
- Once the connection is established, the client and server can send messages to each other at any time.
- Connection states - `CONNECTING`, `OPEN`, `CLOSING`, `CLOSED`
- Events - `onOpen`, `onMessage`, `onError`, `onClose`
- Connection closing codes - `1000`, `1001`, `1009`, `1006`, etc


## Remote Procedure Call (RPC)

A function call to the server with a set of parameters. The client sends an RPC request to the server, and the server executes the function and sends back the result. 