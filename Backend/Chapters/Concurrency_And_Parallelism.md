## Concurrency And Parallelism

### The Cost of IDLE CPU

A modern CPU can execute ~ 3B instructions / sec. Without concurrency, the server will continue to wait for the request to complete before processing another thus wasting its resources.

#### Concurrency

Concurrency allows CPU's resources to be used for other tasks while waiting for the response of a particular request.

#### Parallelism

One CPU core executes one instruction at a particular instant. Parallelism is when multiple CPU cores can execute multiple unique instructions simultaneously at a particular instant.
Most backend applications are I/O bound

### How to Implement

Fundamentally there are only two ways:

- Threads
- Event Loops

The difference between the two is in the way operations are paused and unpaused.

<!-- This needs to be refined -->

#### Threads

Create a new thread for each independent operation resulting in multiple threads for multiple operations. This resolves any CPU bound problem.

If multiple request arise, the thread for request A is paused, context switch occurs to complete the async operation.

**Overhead Cost**

- **Memory** - Creating a new thread involves creating a new stack for that thread which is a problem as the number of threads increases
- **Thread Creation** - Every time a thread is created, a system call is made to the OS kernel which:
  - Sets up the stack (memory issue above)
  - Allocating different data structures
  - Adding it to the scheduler
- **Context Switch** - Saving the current thread's CPU registers and perform all the other steps before moving to a new thread / task. This can be very large when there are thousands of threads.

#### Event Loop

One thread performs multiple tasks using callbacks, algorithms and other components which ensure that the event loop is never blocked. This resolves I/O bound problem - concurrent workloads.

The pause and unpause mechanism is controlled by _callbacks_.

On every loop iteration, check for the I/O operation's completion, run its callback and then place that operation / task back into the queue.
The catch is that each task should not be CPU intensive or ideally, not consume CPU at all. Hence, the nature of the task is generally for I/O.
