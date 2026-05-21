## Task Queues and Background Jobs

Background Job - Any piece of code or logic that runs **outside of the standard request/response lifecycle** of an application. It is not a mission critical task which needs to be responded immediately and hence can be asynchronous.

### Why Are Background Tasks Necessary?

- **Responsive UX** - If a user action (like signing up) requires heavy processing or calls to an external service, doing it synchronously would block the API, causing the user to wait. Offloading it allows the server to immediately return a success response (eg, 201, 200), keeping the app fast and responsive.

- **Handling External Failures** - If backend relies on 3rd party service, and that service is temporarily down, a synchronous API call would fail, ruining the user's action. Background tasks separate the user's core action from the extenral dependency.

- **Retrying Mechanisms** - Background processing frameworks automatically inject failed tasks back into the queue.

### Types of Tasks Offloaded to Background Jobs

- Sending emails
- Processing images / videos
- Generating reports
- Sending push notifications
  - Whenever the mobile installs the app, the mobile device is registered in the backend's poush notification's service
  - To send a push notification, the backend makes a service call to Apple or Google which then send the notification to the mobile device

### Architecure of a Task Queue

A task queue is system managing and distributing background jobs / tasks.

3 main components:

1. **The Producer** - The main backend application code which collects necessary data, serializes it (into an appropriate format), create the task and push it into the queue (enqueued ).
2. **The Broker (Task Queue)** - This is the underlying technology (like RabbitMQ, Redis, PubSub, AWS SQS, etc) which temporarily holds the tasks until they are ready to be processed. When a task fails, it is re-injected into the queue using algorithms like **exponential backoff**. No. of re-tries of a task is set.
3. **The Consumer (Worker)** - This is a program running in an entirely separate process or thread. It constantly monitors the queue, picks up new tasks (dequeue's the task), deserializes the data, and runs the actual execution code (via a registered function / handler).

### The Processing Workflow

- **Enqueuing** - Producer pushes a new, serialized task into the broker
- **Dequeuing** - A consumer pulls the task from the queue and deserializes the JSON back into a native language format (like a Python dict or JS Object)
- **Execution** - Consumer runs a pre-registered **handler** function using the data provided in the task
- **Acknowledgement** - Once processing finishes successfully, the consumer sends an acknowledgement signal back to the queue, telling it to permanently delete it
- **Visibility Timeout** - When a consumer picks up a task, it enters a _visibility timeout_ period where it is marked as in-progress. If the consumer crashes or fails to send an acknowledgement within this time limit, the queue assumes the task failed and makes it visible to other workers so the task isn't lost.

### Types of Background Tasks

- **One-of Tasks** - Simple, single execution triggered by a specific event

- **Recurring Tasks** - Tasks which have to be executed periodically in specific intervals like sending a annual report at a particular date and time, maintenance jobs, etc.

- **Chained Tasks** - Workflows with a parent-child hierarchy where a task relies on the completion of the previous one. For example, uploading a video triggers an encoding task; once encoded, it triggers a thumbnail generation task.

- **Batch Tasks** - A group of similar or related tasks that are collected over a period of time and processed together in a single execution cycle, rather than one at a time. This is more efficient when individual processing overhead is high — for example, sending 1000 emails in one bulk operation instead of queuing 1000 separate jobs.

### Design Considerations for Scale

- **Idempotency** - Tasks are to be designed in such a way that they can be safely executed multiple times without causing any side effects. If a task fails halfway through and is retried by the queue, it should start cleanly from 0% completion.

- **Error Handling** - Because tasks run in a separate process, missing errors are easy. A robust system to catch, meticulously log failures and retry failed tasks for easy debugging.

- **Monitoring** - Tracks the status of whole task management system via task emtrics like current queue length, success vs failure rate of tasks, how many tasks to allow in queue, etc.

- **Scaling** - Design the system in a way so that more consumers can be added - scale horizontally and ensure processing remains responsive

- **Ordering** - Whatever library is used, tasks need to be executed in a particular order

- **Rate Limiting** - If your background tasks interact with third-party APIs (which often charge per request or enforce limits), you must implement rate limiting on your consumers to avoid overloading the external service.

### Best Practices

- Keep tasks small and focused. Focus ensures that tasks are as independent of each other as possible. For dependency, use parent-child relationship.

- Avoid long running tasks to prevent usage of computing resources

- Use proper error handling and logging for easier debugging and perform various retry mechanisms

- Monitory queue length and worker health
