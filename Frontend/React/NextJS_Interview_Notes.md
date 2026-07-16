# Next.js Interview Notes

## 1. Rendering Strategies

### CSR (Client-Side Rendering)

-   React executes only in the browser.
-   Browser downloads HTML shell, CSS and JS bundle.
-   React renders components, builds the Fiber tree, commits DOM updates
    and the browser paints the UI.
-   Best for highly interactive applications where SEO is not critical.

### SSR (Server-Side Rendering)

-   React executes on the server to generate HTML for each request.
-   Browser receives and displays HTML immediately.
-   Browser downloads the JS bundle.
-   React executes again in the browser to hydrate the page.
-   Hydration attaches event listeners and creates a persistent
    client-side React tree.

### SSG (Static Site Generation)

-   HTML is generated at build time.
-   Excellent for SEO and performance.
-   JavaScript is still downloaded and hydrated if the page contains
    interactive components.

### ISR (Incremental Static Regeneration)

-   Static pages are cached.
-   After the `revalidate` interval expires, the next request receives
    the stale page while Next.js regenerates it in the background.
-   Subsequent requests receive the regenerated page.

------------------------------------------------------------------------

## 2. React Server Components (RSC)

### Server Components

-   Default in the App Router.
-   Execute only on the server.
-   Their implementation JavaScript is **not** shipped to the browser.
-   Cannot use client-side hooks such as:
    -   `useState`
    -   `useEffect`
    -   `useReducer`
    -   DOM event handlers (`onClick`, etc.)
-   Ideal for:
    -   Data fetching
    -   Static content
    -   SEO
    -   Reduced bundle size

### Client Components

Use:

``` tsx
'use client';
```

-   JavaScript is shipped to the browser.
-   Hydrated in the browser.
-   Can use:
    -   `useState`
    -   `useEffect`
    -   Browser APIs
    -   Event handlers

------------------------------------------------------------------------

## 3. App Router

### page.tsx

-   Represents the UI for a route.
-   Every route must contain a `page.tsx`.
-   Server Component by default.

### layout.tsx

-   Shared UI across child routes.
-   Persists across navigation.
-   Preserves component state.
-   Avoids unnecessary remounts.

### template.tsx

-   Similar to a layout.
-   Remounts on every navigation.
-   Useful for resetting state, animations and rerunning effects.

### loading.tsx

-   Automatically wraps the route in a Suspense boundary.
-   Displays loading UI while Server Components are rendering.

### error.tsx

-   Route-level Error Boundary.

### not-found.tsx

-   Displayed when `notFound()` is called or the route/resource is not
    found.

### Dynamic Routes

    products/[id]/page.tsx

Access using:

``` tsx
params.id
```

------------------------------------------------------------------------

## 4. Data Fetching & Caching

### Default

``` tsx
await fetch(url)
```

Equivalent to:

``` tsx
cache: 'force-cache'
```

### force-cache

-   Cached.
-   Fastest.
-   Suitable for rarely changing data.

Examples: - About page - Documentation - Company information

### no-store

``` tsx
cache: 'no-store'
```

-   Never cached.
-   Fresh data every request.

Examples: - User profile - Dashboard - Live stock prices - Live sports
scores

### revalidate

``` tsx
next: {
  revalidate: 3600
}
```

-   Cached.
-   Automatically refreshed after the specified interval.
-   Best balance between performance and freshness.

Examples: - Product catalog - News articles - Blog posts

------------------------------------------------------------------------

## 5. Cache Invalidation

### revalidatePath()

``` tsx
revalidatePath('/products')
```

-   Invalidates a specific route.
-   Next request regenerates the page.

### revalidateTag()

``` tsx
next: {
  tags: ['products']
}
```

Invalidate:

``` tsx
revalidateTag('products')
```

-   Invalidates shared cached data.
-   Every page using the `products` tag gets fresh data on the next
    request.

### Interview Tip

-   `revalidatePath()` → Refresh this page.
-   `revalidateTag()` → Refresh this shared data.

------------------------------------------------------------------------

## 6. Server Actions

Declare:

``` tsx
'use server';
```

-   Execute only on the server.
-   Remove the need for simple API endpoints for UI-triggered mutations.
-   Ideal for:
    -   Create
    -   Update
    -   Delete
    -   Form submissions
    -   Login

Can be combined with:

``` tsx
revalidatePath()
revalidateTag()
```

### API Routes vs Server Actions

Use **Server Actions** when: - Only the Next.js application performs the
mutation.

Use **API Routes** when: - Mobile apps consume the API. - Third-party
integrations exist. - Public REST APIs are required. - Webhooks are
needed.

------------------------------------------------------------------------

## Common Interview One-Liners

-   Server Components reduce client bundle size because their JavaScript
    is never shipped to the browser.
-   Client Components are hydrated and become interactive in the
    browser.
-   Hydration attaches React to existing server-rendered HTML.
-   Layouts persist across navigation; templates remount.
-   `force-cache` caches indefinitely until invalidated or regenerated.
-   `no-store` always fetches fresh data.
-   `revalidate` offers a balance between freshness and performance.
-   `revalidatePath()` invalidates a route.
-   `revalidateTag()` invalidates shared cached data.
-   Server Actions simplify mutations initiated from the Next.js UI but
    do not replace public APIs.
