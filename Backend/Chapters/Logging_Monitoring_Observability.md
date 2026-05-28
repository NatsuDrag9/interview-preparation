## Logging, Monitoring and Observability

Main benefit is to debug the application

### Logging

Recording all the important event (suspicious, security, etc) with meta data. A journal to know what happened, when happened and eventually deduce why it happened.

#### Levels

**Debug**
Used in `dev` mode

**Info**
General application related messages and logs even in prod

**Warn**
Any warning to be displayed

**Error**
Any kind of errors

**Fatal**
Very serious as this level of logging restarts the app

### Monitoring

Keeping track of the state of the system in real-time (very minor delay).
Checking the status of the application and giving an aggregation data to determine its performance and the behaviour of the appplication over time

### Observability

A system is called observable when its internal state can be determined by looking at various external parameters.

- Logs - to record important events in the application
- Metrics - different real-time parameters concerning our application which can be tracked to quantify the state of the application
- Traces - tracks all the components / layers which were touched during the execution of a particular event / request
