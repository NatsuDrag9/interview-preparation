### Traditional SSR
React rendering components on the server into HTML.

```
Everything executes twice.

Server

↓

Browser
```

**How does server execute useState()**

```

Give me the initial value.

↓

Render HTML.

↓

Forget everything.

```

During CSR/ hydration:

```
Create persistent state.

↓

Listen for updates.

↓

Rerender when state changes.
```

A component with useState can be rendered on the server to produce its initial HTML, and then hydrated in the browser where the state becomes "live."

### React Server Components
```
Server Components execute once.

Client Components execute twice.
```

Components that execute only on the server and whose JavaScript is not sent to the browser.
A Server Component cannot use useState in the first place because it is never hydrated or executed in the browser


### NextJs App Router
A framework that uses both React SSR and React Server Components, while adding routing, caching, ISR, and other framework features. Components inside app/ are Server Components by default.

```
Browser
     │
GET /
     │
     ▼
Next.js Server
     │
Server Components
     │
Client Components
     │
HTML
     │
RSC Payload
     │
JS Bundle
     ▼
Browser
     │
Hydration
     │
User Click
     │
React Update
```

#### Streaming
Breaking down a page into smaller chunks.Don't wait for the entire HTML document before sending it to the browser. Send parts of it as soon as they're ready.

Instead of 

```
Server

↓

Entire HTML

↓

Browser
```
we get:

```
Server

↓

Header ready

↓

Send

↓

Sidebar ready

↓

Send

↓

Products ready

↓

Send

↓

Reviews ready

↓

Send
```

#### Suspense
A React feature that allows you to wrap components that might take time to load with a fallback UI. The fallback UI is shown while the component is loading. Without a Suspense boundary, React treats the entire component tree as one rendering unit. If any component in that tree suspends (e.g., waiting for data), React waits until the whole tree is ready before sending the HTML.

```
<Suspense fallback={<Spinner />}>
    <Products />
</Suspense>

```

####
