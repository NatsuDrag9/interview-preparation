## Graceful Shutdown

Stop the server gracefully and not, abruptly.

### Process Lifecycle Management

To understand graceful shutdown, you must understand how operating systems (like Linux) manage applications.

- **The Process**: Every backend application runs inside an operating system as a "process". Like all living things, a process has a lifecycle: it is born (starts), lives (executes), and dies (terminates).
- **Communication**: When the OS wants the application to stop, it doesn't just instantly kill it. Instead, it initiates a conversation using an IPC (Interprocess Communication) concept called **Signals**.
- **Handlers**: Your backend application registers "handlers"—blocks of code that constantly run in the background waiting to detect specific signals from the OS. Once a specific signal is received, the handler executes the graceful shutdown steps.

### Three Major Shutdown Signals

Operating system use 3 primary signals to tell an application to stop:

**SIGTERM**:

- A polite, gentle request from the OS asking the application to finish up and leave.
- Typically sent by process managers, deployment systems, or orchestration tools (like Kubernetes, PM2) when rolling out new deployment
- It gives the application / backend a specific window of time to finish processing existing requests and clean up before fully exiting

**SIGINT**:

- Another polite signal, but initiated by a user rather than a program
- A popular example is `CTRL + C` to stop running a terminal process
- Because the intention is same as `SIGTERM`, backend engineers configure their handlers to treat `SIGINT` and `SIGTERM` identically

**SIGKILL**

- It instantly and abruptly kills the application
- It cannot be caught, detected or ignored by the application's handlers unlike the above polite signals. The app instantly dies and gets zero opportunity to clean up.
- SIGKILL is issued when the application ignores or takes too long to respond to the polite signals

### Graceful Shutdown Steps

Generic pattern:

- Stop accepting new connections
- Finish exisitng connections
- Close the connection

#### Connection Draining

When a polite signal is received, the first major step the backend takes is managing network traffic, a process known as **Connection Draining**.

- It stops accepting more traffic - HTTP requests, TCP connections, db connections, websocket connections.
- Allows "in-flight" requests - the ones which are already being processed to finish their execution and return a response to the client
- **Timeout Mechanism** - You cannot let a server wait infinitely for existing requests to finish. Most productions systems implement a hard timeout limit (30 - 60s). If the application hasn't finished its tasks within this window, it will be forcefully stopped. Engineers choosing this timeout is a design consideration and depends on request duration and operational requirements.

#### Resource Cleanup

Letting go of system resources acquired by the backend application. Some of the resources are:

- File handlers
- Network connections
- Database connections
- Temporary files and caches

Cleaning up of resources should happen in the reverse order in which they were acquired to prevent situations where resources / operations are not being cleaned which depend on the previous operation.
