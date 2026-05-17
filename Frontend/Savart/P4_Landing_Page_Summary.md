# Savart Landing Page — Deep-Dive Project Summary

> Interview-ready technical breakdown. Covers architecture, API layer, Next.js patterns, presentational components, and talking points for cross-questioning from senior developers.

## 1. Project Overview

Savart is a fintech investment advisory platform. This is their **multi-page marketing + product landing site** covering Home, Pricing, Advisory, About Us, Enterprise, PMS, Apart AI, Savart One, and Research Reports. Built on **Next.js 15.2.0** with **React 19**.

---

## 2. Architecture

### Section-Based Architecture

Pages are thin orchestrators. A page file like `app/pricing/page.tsx` imports and stacks section components from `sections/pricing/`. Each section is a self-contained composition of smaller reusable components.

**Why this over co-locating components with pages?**
Sections are **reusable across pages** (e.g. `sections/common/ContactForm` appears on multiple pages), and the `components/` directory holds **generic, page-agnostic** building blocks (buttons, cards, inputs, carousels). A designer can say "put the testimonials section on the about page" and you just import it.

### Component Taxonomy

```
components/
├── buttons/             PrimaryButton, SecondaryButton, etc.
├── cards/               PricingCard, TestimonialsCard, VideoCard, ResearchReportCard, etc.
├── composites/          Multi-part components: FormBuilder, CarouselOne, CarouselTwo, TestimonialsMarquee, MenuBar
├── inputs/              FormInput, MobileInput, SingleSelectFormInput, CheckboxInput
├── generics/            PopupLayout, ProgressBar
├── scroll-animations/   TextScrollAnimation, ScrollTimelineWithImage
└── utility/             LenisProvider, ScrollToTop, CookieManager
```

---

## 3. Next.js Concepts — Cross-Question Ready

### Q: "Why App Router over Pages Router?"

Next.js 15 with React 19. App Router gives:

- **React Server Components by default** — `layout.tsx` is a Server Component. It renders the shell (Header, Footer, Toaster, scripts) on the server. Zero JS shipped for the layout itself.
- **Nested layouts** — the root layout wraps all pages with providers, header, footer. Pages only define their unique content.
- **Metadata API** — `layout.tsx:20-87` uses the typed `Metadata` export with template titles (`'%s'`), OpenGraph, Twitter cards, robots directives, and JSON-LD structured data. This is SEO-critical for a marketing site.

### Q: "How do you handle the server/client boundary?"

The root layout is a Server Component. Auth needs browser access, so there's a **providers boundary** — `providers.tsx` is marked `'use client'` and wraps children in `SessionProvider` (NextAuth) and `LazyMotion` (Framer Motion). This is the **"client boundary push-down" pattern** — keep the boundary as deep as possible so the layout, header shell, and footer can render on the server.

Key point: `'use client'` doesn't mean "runs only on client" — it means "this is the boundary where client-side JS kicks in." Everything above it in the tree remains a Server Component.

### Q: "What's `LazyMotion` doing and why?"

`providers.tsx:22-28` — `LazyMotion` with `domAnimation` **tree-shakes** Framer Motion. Instead of shipping the full ~30KB Framer bundle, only the DOM animation features actually used are shipped. The `strict` prop throws errors if you accidentally use `motion.div` (full bundle) instead of `m.div` (lazy-compatible). Throughout the project you'll see `m.div`, `m.section`, `m(Image)` — that's the lightweight API.

### Q: "How does `next/script` strategy work?"

`layout.tsx:114-174` — Facebook Pixel and Kiwi-Interakt chat use `strategy="lazyOnload"`. This means:

1. Next.js waits until the page is fully loaded and idle
2. Then injects the script
3. This keeps LCP and FID scores clean — third-party scripts don't compete with the critical rendering path

Contrast with `beforeInteractive` (SSR-injected, blocks hydration) and `afterInteractive` (runs after hydration but before idle).

### Q: "Explain your `next.config.ts` rewrites."

`next.config.ts:33-52` — In **development only**, requests to `/next-js/backend/:path*` are proxied to the actual backend API. This solves CORS — the browser thinks it's same-origin. In production, `API_PROXY_BASE_URL` (`endpoints.ts:38-41`) points directly to the backend URL because in prod, CORS headers are configured properly or it's the same domain.

The `beforeFiles` placement means the rewrite happens **before** Next.js checks the filesystem — so it won't accidentally match a page route.

### Q: "Why `sassOptions.prependData`?"

`next.config.ts:23-29` — Every SCSS file in the project automatically has `@use 'helpers' as *` and font imports prepended. No need to manually import color variables, breakpoint mixins, or font definitions in each component's SCSS file. The `as *` makes all helpers available without a namespace prefix.

### Q: "How do you handle `next/image` optimization?"

- `domains: ['3.110.98.254']` in config allows remote images from the backend server
- Hero uses `sizes` prop for responsive art direction: `sizes="(max-width: 768px) 50vw, 33vw"` — tells the browser the image will be 50% of viewport on mobile, 33% on desktop, so Next.js generates appropriately sized variants
- `quality={85}` balances file size with visual quality

### Q: "Custom headers — why X-Frame-Options: DENY?"

`next.config.ts:55-80` — Prevents the site from being embedded in iframes (clickjacking protection). `X-DNS-Prefetch-Control: on` lets browsers pre-resolve DNS for external resources (fonts, analytics scripts). Static assets get `Cache-Control: public, max-age=31536000, immutable` — one year, never revalidate — because they're fingerprinted by Next.js's build.

### Q: "What's the `[...nextauth]` catch-all route?"

`route.ts` at `app/nextjs-backend/auth/[...nextauth]/` — The `[...]` syntax creates a **catch-all dynamic route**. NextAuth needs multiple endpoints (`/api/auth/signin`, `/api/auth/callback`, `/api/auth/session`, etc.) — the catch-all handles all of them from a single file. The `basePath` in `SessionProvider` is configured via `NEXT_PUBLIC_AUTH_PATH` to point to this custom location instead of the default `/api/auth`.

---

## 4. API Layer — The Real Architecture

### Three-Tier Client System

The project has **three distinct layers**, not two. Getting this right matters because they're often conflated:

**Tier 1: Raw axios instances** (`services/baseApi.ts`)

- **`apiClient`** — `axios.create()` pointed at the proxy URL (`/next-js/backend` in dev, `NEXT_PUBLIC_API_URL` in prod). Used from the **browser** for unauthenticated or simple calls. `withCredentials: true` so cookies flow automatically. 10s timeout.
- **`serverApiClient`** — `axios.create()` pointed **directly** at `NEXT_PUBLIC_API_URL`. Used from the **Next.js server** (specifically inside NextAuth's `authorize` callback). No CORS concerns because it's server-to-server. 15s timeout.

Neither of these has any auth orchestration. They're just typed HTTP clients.

**Tier 2: `UnifiedApiClient` class** (`utils/apiUtils.ts`)

A generic class wrapping an internal axios instance with 401-triggered refresh logic. Instantiated via constructor DI:

```typescript
new UnifiedApiClient(
  getAuthTokens: () => Promise<AuthTokens | null>,  // function, not a value
  updateAuthTokens: (tokens: AuthTokens) => Promise<void>,
  baseURL: string
)
```

The class doesn't know **where** tokens live — it just receives a getter and a setter. This makes it environment-agnostic (same class, different wiring for client vs server).

**Tier 3: `useAuthenticatedApiClient` hook** (`utils/apiUtils.ts:323`)

A React hook that instantiates `UnifiedApiClient` pre-wired with `useSession()` — the getter reads `session.authTokens`, the setter calls `session.update()`. Services like `paymentFlowApi` consume this hook.

**Common misconception:** the hook is **not** a separate API layer. It's a 20-line factory that returns a `UnifiedApiClient` instance. Three tiers total: raw axios → generic class → wired-up hook.

### Why `UnifiedApiClient` Exists When `apiClient` Already Has `withCredentials`

This is the single most important architectural question in the project. `withCredentials: true` is **only the transport layer** — it tells the browser to include cookies with outgoing requests and accept `Set-Cookie` headers on responses. That's all.

Everything else `UnifiedApiClient` does is about **consistency between three places tokens live**:

1. The NextAuth JWT (encrypted `HttpOnly` cookie, source of truth)
2. `document.cookie` (what axios actually reads via `withCredentials`)
3. The backend's view of valid tokens (which rotates on refresh)

When a 401 comes back, `UnifiedApiClient`:

1. Intercepts the response (the `_retry` flag on the request config prevents infinite loops)
2. Calls `refreshTokens()` which uses a **singleton promise mutex** — if 3 concurrent requests all 401 at once, the first triggers refresh and the other 2 `await` the same promise instead of firing 3 refresh calls
3. Uses a **separate axios instance** (`axios.create()` not `this.client`) for the refresh call itself — this breaks the interceptor recursion that would otherwise happen if the refresh endpoint also returned 401
4. Parses the new tokens from the refresh response's `Set-Cookie` headers
5. Writes them to `document.cookie` via `setBrowserCookies` with protocol/host-aware flags (`Secure` only on non-localhost HTTPS, `domain` only when not localhost, `SameSite=Lax`)
6. Calls `updateAuthTokens()` to sync the new tokens back into the NextAuth JWT via `session.update()`
7. Retries the original request

**The session sync in step 6 is the sneakiest part.** Without it, the backend sees rotated tokens but the NextAuth session still holds the stale ones. On next page load, `CookieManager` would read the stale NextAuth session and **overwrite** `document.cookie` with expired tokens — silently undoing the refresh.

**Short version:** `withCredentials` is 5% of the value. The refresh orchestration + session consistency is 95%.

### What's Load-Bearing vs What's Sugar

Not every part of `UnifiedApiClient` is essential. Honest breakdown:

| Essential (don't touch) | Sugar (could be removed) |
|---|---|
| 401 interceptor + `_retry` flag | Typed `get<T>`, `post<T>`, `put<T>`, `delete<T>` methods |
| Singleton promise mutex (`isRefreshing` + `refreshPromise`) | `getRaw`/`postRaw` parallel methods |
| Separate refresh axios instance (breaks interceptor loop) | The `axiosInstance` getter |
| `handleResponseCookies` + `setBrowserCookies` | `Promise<T>` unwrapping (`.data` extraction) |
| `updateAuthTokens` session sync | |

The typed methods are **ergonomic sugar**, not a feature axios is missing. Axios already provides `axios.get<T>()` returning `AxiosResponse<T>`. The wrapper exists purely to unwrap `response.data` so callers don't destructure it on every call. You could delete all of them, have callers use `this.client.get<T>(...)` directly, and the class would lose ~30 lines and gain nothing meaningful.

### Cookie Flow — The Two-Path Sync

`document.cookie` stays in sync with the NextAuth session via **two independent paths** that cover different trigger conditions:

| Trigger | Handled By | Why |
|---|---|---|
| Fresh sign-in (session becomes authenticated) | **`CookieManager`** component | Backend's `Set-Cookie` headers went to the Next.js **server** during `authorize()`, not the browser. `document.cookie` is empty after sign-in until `CookieManager` reads from the session and writes it |
| Page reload with existing session | **`CookieManager`** | NextAuth JWT is still valid, but a fresh browser tab's `document.cookie` may be empty — needs re-seeding from the session |
| Sign-out | **`CookieManager`** (the `else` branch clears cookies) | Security — don't leave tokens lying around |
| Backend rotates cookies mid-session (CSRF rotation on any response) | **`UnifiedApiClient.handleResponseCookies`** | Runs after every response with `Set-Cookie` headers |
| 401 → token refresh | **`UnifiedApiClient._performRefresh` → `setBrowserCookies`** | The refresh endpoint's `Set-Cookie` headers get parsed and written |

**Both paths use the same protocol/host-aware flag logic**, and the logic is duplicated in two places (`CookieManager.tsx` and `apiUtils.ts:setBrowserCookies`). This is a real code smell — one shared `cookieUtils.ts` module would be cleaner. Worth flagging proactively in interviews.

#### Cookie Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│              NextAuth JWT cookie (HttpOnly)              │
│              contains authTokens                         │
│              — source of truth for auth state —          │
└──────────────────────────────────────────────────────────┘
            │                              ▲
            │ useSession()                 │ session.update()
            ▼                              │
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ CookieManager                │   │ UnifiedApiClient             │
│ (session → document.cookie)  │   │ (responses → document.cookie │
│                              │   │   + session sync)            │
│ Runs on session change       │   │ Runs on 401 + refresh        │
│ BOOTSTRAP & hydration        │   │ MAINTAIN & sync              │
└──────────────────────────────┘   └──────────────────────────────┘
            │                              │
            ▼                              ▼
┌──────────────────────────────────────────────────────────┐
│                    document.cookie                       │
│           (what axios withCredentials reads)             │
└──────────────────────────────────────────────────────────┘
```

The NextAuth JWT is the **source of truth**. `CookieManager` reads from it (via `useSession()`) on session change events — bootstrap and page-reload hydration. `UnifiedApiClient` writes back to it (via `session.update()`) after token refresh, and also pushes updates directly to `document.cookie` when backend responses carry `Set-Cookie` headers. Both paths converge on `document.cookie`, which is what axios actually sends on outgoing requests.

**Why both paths exist:** `CookieManager` is the **bootstrap** path (session change events). `UnifiedApiClient` is the **maintenance** path (backend response events). Neither is redundant because they fire on different triggers. `UnifiedApiClient` alone can't handle sign-in because the first authenticated API call would send with an empty `document.cookie` and 401 before any maintenance could happen.

### Service Layer Pattern

`paymentFlowApi.ts` and friends — Services are **factory functions**, not classes:

```typescript
createPaymentFlowService(authenticatedApiClient: UnifiedApiClient) => ({
  calculatePricing: async (data: CalculatePricingRequest): Promise<CalculatePricingResponse> => {
    return authenticatedApiClient.post(EP.CALCULATE_PRICING, data);
  },
  // ...
})
```

This is **dependency injection without a DI framework**. Each method is fully typed via generics, and swapping the client (e.g., for a mock in tests) is trivial.

### The `jwt` Callback's Incomplete Refresh

Worth knowing: NextAuth's `jwt` callback ([route.ts:135-158](src/app/nextjs-backend/auth/[...nextauth]/route.ts#L135-L158)) has an expiry check that's **currently a no-op** — both branches return the token unchanged. The author wrote the skeleton for server-side refresh but never implemented the actual refresh call.

This is why the client-side `UnifiedApiClient` refresh logic exists in the first place. If the `jwt` callback did real server-side refresh, the singleton promise mutex and most of `UnifiedApiClient`'s complexity would disappear — each server request is naturally isolated, so there are no race conditions to protect against.

### Architectural Reflection

The client-side BFF pattern in `UnifiedApiClient` was chosen because it matched familiarity with axios interceptors at build time. With more Next.js experience, the same concerns (auth tokens, cookie handling, CORS, refresh) could be handled more cleanly via **Route Handlers with `HttpOnly` cookies**:

- Tokens in `HttpOnly` cookies = XSS-proof (currently `document.cookie` is JS-readable — a real concern for a payment flow)
- Browser never touches backend tokens = `CookieManager` + most of `UnifiedApiClient` can be deleted
- Token refresh moves to the `jwt` callback server-side = no race conditions, no singleton mutex
- No `next.config.ts` rewrites = everything is naturally same-origin

The current code works and is production-ready, but for security-sensitive endpoints (payments, token refresh), Route Handlers would be the correct next step — primarily to eliminate XSS token exposure. Not a full rewrite, but a targeted migration of the auth and payment endpoints.

### Q: "Why not React Query / SWR?"

The current approach is simpler for a site that's mostly marketing content with a focused payment flow. React Query would add caching, deduplication, and stale-while-revalidate — useful if the site had dashboards or frequently-changing data. For the current scope (form submissions + a payment flow), raw axios with the `UnifiedApiClient` is adequate. This is a **future improvement** candidate.

---

## 5. Authentication Flow — Step by Step

NextAuth with a **CredentialsProvider** (`app/nextjs-backend/auth/[...nextauth]/route.ts`):

1. User enters phone number -> hits `CHECK_USER` endpoint -> backend returns whether to use OTP or PASSWORD
2. `authorize()` sends `LoginRequestBody` to `token/` with either OTP or password
3. Backend returns user data in JSON body + **auth tokens in `Set-Cookie` headers**
4. `extractAuthCookies()` parses `Set-Cookie` headers to extract `csrftoken`, `access_token`, `refresh_token`
5. Returns `CustomUser` object with tokens embedded

### JWT Callback (`route.ts:135-158`)

- On first sign-in: spreads user data + tokens into the JWT, sets `expiresAt` to now + 1 hour
- On subsequent requests: checks `expiresAt`, returns existing token if still valid

### Session Callback (`route.ts:160-173`)

- Projects `authTokens` from JWT into the session object so client components can access them via `useSession()`

### Q: "Why JWT strategy instead of database sessions?"

This is a stateless landing page — no database to store sessions. The backend handles its own session via the access/refresh tokens. NextAuth's JWT is just a **transport mechanism** to carry those tokens across the client-server boundary. The actual auth state lives in the backend's token pair.

### Q: "What happens when the token expires mid-session?"

The `UnifiedApiClient`'s 401 interceptor catches it, calls `token/refresh/` with the refresh token cookie, extracts new tokens from the response headers, updates both `document.cookie` and the NextAuth session via `update()`, then retries the failed request transparently.

---

## 6. State Management — Pricing Context Deep Dive

`contexts/PricingContext.tsx` manages a **multi-step checkout flow**:

### Step Progression

- New user: 6 steps (CheckUser -> Login -> Welcome -> PlanSummary -> BillingAddress -> PaymentSuccessful)
- Existing subscriber: 4 steps (skips CheckUser + Login)
- If already authenticated when popup opens, jumps to step 2

### Optimistic Step Count

`PricingContext.tsx:80-87`:

```typescript
if (!hasLoadedSubscriberStatus) {
  totalSteps = TOTAL_STEPS_FOR_SUBSCRIBER; // 4 — optimistic
}
```

Before the API call resolves, the progress bar assumes 4 steps. Once subscriber status loads, it adjusts to 6 if needed. This prevents a progress bar "jump" from 4 to 6 steps.

### Why All the `useCallback` Wrappers?

Every setter is wrapped in `useCallback` so the **context value object stays referentially stable** through `useMemo`. Without this, every state change would create new function references -> new context value -> **every consumer re-renders**. With `useCallback`, only consumers that read the changed value re-render.

### Q: "Why not `useReducer` for this many state fields?"

Valid critique. A reducer would centralize the state transitions and make them more predictable (especially the step logic). The current approach works but is verbose. A candidate for refactoring — keep the context but replace 12 `useState` calls with a single `useReducer` with typed actions.

### Razorpay Integration (`utils/razorpayUtils.ts`)

- `buildRazorpayOptions` creates the config from the `PurchasePlanResponse`
- `loadAndOpenRazorpay` **dynamically injects** the Razorpay script (not loaded on every page — only when payment is triggered)
- Handles `payment.failed` event and `modal.ondismiss` for interrupted payments
- Prefills user phone number conditionally with spread syntax

---

## 7. Presentational Components — Explained for Cross-Questioning

### Carousel (Pure CSS Animation)

**Files:** `components/composites/CarouselOne/CarouselOne.tsx` + `CarouselOne.scss`

**How it works without JavaScript:**

- All cards are placed in the **same CSS grid cell** (`grid-area: 1/1/2/2`) — stacked on top of each other
- Each card runs the same `card-cycle` keyframe animation but with a **negative `animationDelay`** offset: `animationDelay: -${index * cardDuration}s`
- The keyframe moves cards: hidden (0-10%) -> slide in from right (10-20%) -> visible center (20-30%) -> slide out to left (30-40%) -> hidden (40-100%)
- `z-index` flips between 1 (hidden) and 5 (visible) to handle stacking

**Q: "Why CSS animation over JS-driven carousel?"**
Zero JavaScript overhead. No timer management, no state, no re-renders. The browser's compositor handles the animation on the GPU. The only JS is calculating `animationDuration` and `animationDelay` based on card count and display/transition times. Hand off the math and the browser handles 60fps.

**Q: "What's the formula?"**
`cardDuration = displayTime + transitionTime * 2` (enter + display + exit). `totalCycleDuration = cardCount * cardDuration`. Each card's delay is `-index * cardDuration` (negative to stagger them into the past so they're already phased when the page loads).

---

### Marquee (Infinite Scroll)

**Files:** `components/composites/TestimonialsMarquee/TestimonialsMarquee.tsx` + `TestimonialsMarquee.scss`

**The duplication trick:**
Content (testimonials + videos) is rendered **twice**. The CSS animation translates the container by `-50%` (exactly one copy's width). When it hits -50%, it snaps back to 0 — since the second copy is identical, the loop appears seamless.

```css
animation: marquee 20s linear infinite;
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

**Pause behavior:**

- CSS: `:has(.testimonials-card:hover)` pauses on hover — **no JS needed** for this
- JS: When a video plays, `anyVideoPlaying` adds a `--paused` modifier class, and the selected video opens in a `VideoCardPopup` modal
- All handlers use `useCallback` to prevent re-renders of child cards

**Q: "Why not `requestAnimationFrame` or a JS-based marquee?"**
CSS `translateX` is a **composited property** — the browser animates it on the GPU without triggering layout or paint. A JS-driven marquee would fire on every frame, hit the main thread, and risk jank. The CSS approach is also simpler to pause (just `animation-play-state: paused`).

---

### Scroll Timeline with Image

**File:** `components/scroll-animations/ScrollTimelineWithImage/ScrollTimelineWithImage.tsx`

**Framer Motion's `useScroll` hook:**

```typescript
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ['start 10%', 'end 50%'],
});
```

Creates a `MotionValue` from 0 to 1 tracking how far the section has scrolled through the viewport. `'start 10%'` means tracking begins when the section's top hits 10% from the viewport top.

**Derived transforms:**

- `heightTransform` — maps scroll [0,1] to [0, height/2] for the timeline line growth
- `opacityTransform` — maps scroll [0, 0.1] to [0, 1] for fade-in
- `imageOpacity` — maps scroll [0, 0.05, 0.95, 1] to [0, 1, 1, 0] — fade in at start, fade out at end (a 4-point keyframe curve)

**Active index calculation (line 213-228):**
Divides the scroll range into equal segments per data item. `Math.floor(value / itemScrollRange)` determines which item is active. The guard `if (newActiveIndex !== activeIndex)` prevents unnecessary re-renders on every scroll tick.

**`m.div` vs `motion.div`:** `m.div` is the **LazyMotion-compatible** shorthand. `motion.div` imports the full Framer bundle; `m.div` only works within a `LazyMotion` provider and keeps the bundle small.

---

### Text Scroll Animation (Vanilla JS)

**File:** `components/scroll-animations/TextScrollAnimation/TextScrollAnimation.tsx`

**Character-level reveal:**

1. Text is split into words, words into characters — each wrapped in a `<span class="char">`
2. On scroll, `getBoundingClientRect()` calculates a `scrollProgress` from 0 to 1
3. `normalizedProgress` is clamped between `triggerStart` and `triggerEnd` (responsive — 0.75 on mobile, 0.5 on desktop)
4. `charsToReveal = Math.floor(totalChars * progress * revealSpeed * 2)` determines how many characters should be visible
5. Characters get/lose an `active` class that toggles opacity via CSS

**Q: "Why vanilla JS instead of Framer Motion here?"**
Framer Motion's `useScroll` + `useTransform` works great for continuous transforms (opacity, position). But toggling **individual element classes on 100+ characters per frame** is more efficiently done via direct DOM manipulation (`.classList.add/remove`) than re-rendering React components. This avoids creating 100+ motion values or triggering React reconciliation on every scroll tick.

**Q: "Why `document.documentElement.clientWidth` instead of `window.innerWidth`?"**
`clientWidth` excludes the scrollbar width. `innerWidth` includes it. For breakpoint calculations that should match CSS `@media` queries, `clientWidth` is more accurate because CSS media queries also exclude the scrollbar.

---

### Lenis Smooth Scrolling

**Files:** `components/utility/LenisProvider/LenisProvider.tsx` + `hooks/useLenisContainer.ts`

**Global smooth scroll** uses `ReactLenis` with `root` prop (takes over `window` scrolling). Config: `lerp: 0.1` (interpolation factor — lower = smoother/slower), `duration: 1.2`, `smoothWheel: true`.

**`LenisScrollSync` component:** A no-op `useLenis` callback that exists to sync Lenis's virtual scroll position with `window.scrollY`. This is critical because Framer Motion's `useScroll` reads `window.scrollY` — without this sync, scroll-based animations would lag behind the smooth scroll.

**`useLenisContainer` hook** — creates an **isolated Lenis instance** for a specific DOM element (not the window). Uses its own `requestAnimationFrame` loop and cleans up via `cancelAnimationFrame` + `lenis.destroy()`. The ref is intentionally excluded from the dependency array (refs are stable — the comment explains why the ESLint rule is disabled).

---

### Staggered Hero Animations

**File:** `sections/home/Hero/Hero.tsx`

- `m(Image)` creates a motion-enabled `next/image` wrapper — the `m()` HOC factory from Framer Motion
- `containerVariants` with `staggerChildren: 0.05` orchestrates child animations in sequence
- Each image has directional variants (left slides from -100px, right from +100px, bottom from +100py)
- `isClient` state gate prevents SSR/hydration mismatch — animations only start after `useEffect` confirms client-side rendering
- Separate `transform` and `opacity` transition configs per variant give opacity a faster duration (0.25s) than movement (0.5s) for a polished feel

---

## 8. Form Architecture

### FormLayout (`components/composites/FormBuilder/FormLayout.tsx`) — The Foundation

- Wraps children in `FormProvider` (React Hook Form's context provider)
- Uses `yupResolver` to connect Yup schemas to RHF
- `mode: 'onSubmit'` (validate on submit), `reValidateMode: 'onChange'` (re-validate on each keystroke after first error)
- Auto-resets form when `initialData` changes (for pre-filling from API data)
- Has a `shouldResetForm` prop for programmatic reset from parent

### FormBuilder (`components/composites/FormBuilder/FormBuilder.tsx`) — The Dynamic Builder

- Generic: `FormBuilder<T extends FieldValues>` — the form data type flows through to RHF
- Renders fields from a `formFields` array config — supports text, email, number, textarea, checkbox, mobile (compound: country code dropdown + phone input), singleSelect
- `renderField` is memoized with `useCallback` to prevent re-creating field renderers on every render

**Q: "Why `yupResolver as unknown as Resolver<T, unknown>`?"**
Type incompatibility between `@hookform/resolvers/yup` and RHF's `Resolver` generic. The `as unknown` double-cast is a known workaround. Safe because the runtime behavior is correct — only the TypeScript types don't align perfectly.

---

## 9. SCSS Architecture

`styles/_mixins.scss` is the most interview-worthy file:

### `pseudo-element-border` Mixin

Creates gradient borders using `mask-composite: exclude`. A pseudo-element has a gradient `background`, and the `mask` with `mask-composite: exclude` cuts away the inner content area, leaving only the border visible. This allows **gradient borders with border-radius** — which `border-image` cannot do.

### `blurred-blue-circle` Mixin

Creates ambient glow effects with `::before` pseudo-elements using `filter: blur()` and `mix-blend-mode: hard-light`.

### `custom-scrollbar` Mixin

Cross-browser scrollbar styling using `@supports` feature queries:

- WebKit browsers -> `::-webkit-scrollbar` pseudo-elements
- Firefox -> `scrollbar-color` and `scrollbar-width` CSS properties
- The `@supports (scrollbar-width: thin)` / `@supports not` pattern ensures only one set applies

### `tooltip` Mixin

Pure CSS tooltips using `::before` (content from `data-tooltip` attribute) and `::after` (arrow). Supports 4 positions via `@if` directives. A `responsive-tooltip` variant switches position between mobile and desktop.

---

## 10. Positive Aspects

1. **Performance-first animation choices** — CSS animations for carousels/marquee (GPU composited), LazyMotion for tree-shaking Framer, dynamic Razorpay script loading, `lazyOnload` for third-party scripts
2. **Race condition handling** — The singleton promise pattern in `UnifiedApiClient.refreshTokens()` is production-grade
3. **Type safety end-to-end** — From API request types (`LoginRequestBody`) through service functions (`CalculatePricingRequest -> CalculatePricingResponse`) to component props. Strict mode enabled.
4. **Clean DI pattern** — `UnifiedApiClient` receives token getters/setters via constructor, `createPaymentFlowService` receives the client. Easy to test, easy to swap implementations.
5. **SCSS system** — The mixins library (gradient borders, tooltips, scrollbars, blurred circles) shows strong CSS fundamentals beyond "I use Tailwind"
6. **Developer tooling** — Storybook with play functions + a11y addon, Husky + commitlint for conventional commits, lint-staged, bundle analyzer
7. **Smart Lenis-Framer sync** — The `LenisScrollSync` component solves a real problem (smooth scroll libraries hijack `scrollY`, breaking other scroll-dependent code)

---

## 11. Architectural Decisions From The Docs

These are the "why" details I pulled from `docs/AUTHENTICATION_GUIDE.md`, `docs/NEXTAUTH_CUSTOM_PATH_SETUP.md`, and `docs/PROXY_VS_NO_PROXY.md`. Senior devs will probe these.

### Two Separate "Backend" Paths — Deliberately

The project uses **two distinct paths** that are easy to confuse. Knowing the difference is a key talking point:

| Path | Purpose | Handled By |
|---|---|---|
| `/nextjs-backend/auth/*` | NextAuth routes (signIn, session, callbacks) | Next.js route handler at `src/app/nextjs-backend/auth/[...nextauth]/route.ts` |
| `/next-js/backend/*` | Proxy to external backend API | Next.js `rewrites()` in `next.config.ts` (dev only) |
| `NEXT_PUBLIC_API_URL` | The real backend (e.g. `http://34.93.113.27:8000/api`) | External Django server |

**Why two paths?** The backend itself serves APIs at `/api/*`. If NextAuth used its default `/api/auth/*`, you'd get ambiguity — is `/api/auth/session` a NextAuth route or a backend route? Using `/nextjs-backend/auth` for NextAuth and `/next-js/backend` for the proxy keeps them **provably distinct**.

**`NEXTAUTH_URL` trick:** NextAuth auto-detects its basePath from the `NEXTAUTH_URL` env var. The client-side `SessionProvider` must explicitly receive a matching `basePath` prop — that's why `providers.tsx` reads `NEXT_PUBLIC_AUTH_PATH` and passes it through.

### Why the Proxy — The Real Reasoning

From `PROXY_VS_NO_PROXY.md`, the proxy wasn't chosen for convenience — it was chosen to **avoid CORS cookie hell**:

1. **`withCredentials: true` alone isn't enough.** Cross-origin requests need the backend to send `Access-Control-Allow-Credentials: true` *and* `Access-Control-Allow-Origin: <exact-origin>` (wildcards fail with credentials).
2. **Browsers silently drop `Set-Cookie` headers** on cross-origin responses even when CORS is otherwise configured correctly, unless all the right pieces align.
3. **`SameSite` policies break cross-origin cookies** — even if stored, the browser may not send them back.
4. **CSRF token validation becomes cross-origin** — adding complexity for no benefit.
5. **Environment drift** — each deployment (dev, staging, prod) would need separate CORS allowlists on the backend.

By proxying through the Next.js dev server, **everything is same-origin** — the browser treats the backend as if it were part of the frontend app. In production, the app and backend share a domain, so no proxy is needed.

### Trailing Slash Gotcha (Django)

The proxy destination is `${NEXT_PUBLIC_API_URL}/:path*/` — note the **trailing slash**. Django's `APPEND_SLASH` setting expects trailing slashes and can't redirect a `POST` to the slash version without losing the request body. This was a real bug that the trailing slash in the rewrite fixed.

### Historical CORS/Cookie Challenges (From Auth Guide)

The `AUTHENTICATION_GUIDE.md` documents 7 challenges the team hit while building this. These make great war stories:

1. **Manual `Cookie` headers ignored by browser** — browsers block manual cookie headers for security. Solution: proxy makes it same-origin, cookies flow naturally.
2. **Missing `withCredentials` on some Axios instances** — one of several clients forgot the flag, caused inconsistent cookie behavior.
3. **Session/cookie storage mismatch** — NextAuth stored tokens in JWT, but API calls needed browser cookies. Solution: `CookieManager` component syncs them.
4. **Django trailing slash** — covered above.
5. **Server-side vs client-side execution** — NextAuth callbacks run on both; `document.cookie` crashes on the server. Solution: `typeof window !== 'undefined'` guards.
6. **Base URL inconsistency** — some clients used `NEXT_PUBLIC_API_URL` directly, others used the proxy path. Standardized on `API_PROXY_BASE_URL` constant.
7. **Hot-reload caching** — config changes weren't picking up. Solution: restart dev server after `next.config.ts` or `.env` changes.

### The CookieManager Component

I missed this in my initial pass. It's imported in `layout.tsx` and does one job:

```typescript
// Syncs session tokens → browser cookies on every session change
useEffect(() => {
  if (session?.authTokens) {
    document.cookie = `csrftoken=${session.authTokens.csrf}; path=/; samesite=lax`;
    document.cookie = `access_token=${session.authTokens.access}; path=/; samesite=lax`;
    document.cookie = `refresh_token=${session.authTokens.refresh}; path=/; samesite=lax`;
  }
}, [session]);
```

**Why it exists:** NextAuth stores tokens inside its JWT (which lives in an HTTP-only session cookie managed by NextAuth). But the backend expects its own tokens as plain browser cookies it can validate. `CookieManager` is the **bridge** — it reads from the NextAuth session and writes to `document.cookie` so Axios requests with `withCredentials: true` automatically include them.

**Note the overlap with `UnifiedApiClient`:** both set cookies. `CookieManager` syncs on login/session change; `UnifiedApiClient` syncs after token refresh. Together they ensure the browser cookie state is always in sync with the NextAuth session.

---

## 12. Pricing Flow — Complete Walkthrough

From `docs/components/PRICING_POPUP.md`, reconciled with the actual code in `src/sections/pricing/Popup/` and `src/contexts/PricingContext.tsx`.

### Architecture

The pricing flow is a **multi-step wizard** implemented as a state machine in `PricingContext`. The main `Popup.tsx` component reads `currentStep` from context and dispatches to one of 6 step components via a `switch` statement. All steps share the same `PopupLayout` wrapper (header + progress bar + close button + footer).

```
src/sections/pricing/Popup/
├── Popup.tsx              Orchestrator — reads currentStep, renders step
├── helperFunctions.ts     getContent(stepIndex) → { title, subTitle, footer }
├── CheckUser/             Step 0
├── Login/                 Step 1
├── Welcome/               Step 2
├── PlanSummary/           Step 3
├── BillingAddressForm/    Step 4
└── PaymentSuccessful/     Step 5
```

### Step-by-Step Flow

| Step | Component | Purpose | Inputs | API Calls |
|---|---|---|---|---|
| **0** | `CheckUser` | Determine if user exists + which login method (OTP vs password) | Phone number, country code | `POST login/password_or_otp/` |
| **1** | `Login` | Authenticate user via NextAuth credentials provider | OTP or password | `signIn('mobile-auth', ...)` → NextAuth → `POST token/` |
| **2** | `Welcome` | Welcome authenticated user, fetch subscriber status | — | `GET subscriptions/plans/`, `GET rewards/balance/` |
| **3** | `PlanSummary` | Display plan details, duration selector, coin checkbox, coupon input | Plan, duration, coupon | `POST payments/calculate-pricing/` |
| **4** | `BillingAddressForm` | Collect billing address, trigger Razorpay | Address fields | `POST payments/billing-address/`, `POST payments/plans/purchase/`, `GET payments/invoice-lookup/` |
| **5** | `PaymentSuccessful` | Confirmation screen with invoice | — | — |

### State Machine — Subscriber vs New User

This is the part the docs get wrong. The `PRICING_POPUP.md` doc says **"6 total steps (fixed value)"**, but the actual code in `PricingContext.tsx:80-87` supports **two different step counts**:

```typescript
if (!hasLoadedSubscriberStatus) {
  totalSteps = TOTAL_STEPS_FOR_SUBSCRIBER; // 4 — optimistic
} else if (isSubscriber) {
  totalSteps = TOTAL_STEPS_FOR_SUBSCRIBER; // 4
} else {
  totalSteps = TOTAL_STEPS_FOR_NEW_CUSTOMER; // 6
}
```

- **New user:** walks through all 6 steps
- **Existing subscriber:** sees 4 steps (skips CheckUser + Login)
- **Already authenticated when popup opens** (`status === 'authenticated'`): jumps straight to step 2 via the `useEffect` in `PricingContext`

**The "optimistic" progress bar:** Before the API call that determines subscriber status resolves, `totalSteps` defaults to 4 (optimistic). Once subscriber status loads, it either stays at 4 or adjusts to 6. This avoids a jarring "3/4 → 3/6" jump in the progress bar.

### Razorpay Integration (Step 4 → 5)

When `BillingAddressForm` submits:

1. Backend is called with the billing address → returns a billing address ID
2. `POST payments/plans/purchase/` → backend creates a Razorpay order, returns `order_id`, `razorpay_key_id`, `amount`, `currency`
3. `buildRazorpayOptions()` (from `razorpayUtils.ts`) constructs the Razorpay config with a `handler` callback and `modal.ondismiss` callback
4. `loadAndOpenRazorpay()` **dynamically injects** the `checkout.razorpay.com` script into the DOM (not loaded on page load — only when needed), then calls `rzp.open()`
5. On success: `handler` fires → `onPaymentSuccess(paymentId, orderId)` → stores `orderId` in context → advances to step 5
6. On dismiss: `onPaymentDismiss` fires → shows error toast → user stays on step 4
7. On `payment.failed` event: logged, error shown

### Graceful Close Behavior

`handlePopupClose` in `Popup.tsx:120-133` has a subtle UX detail:

```typescript
if (status === 'authenticated') {
  await signOut({ redirect: false });  // ← Prevent page reload
  showSuccessToast('Signout successful! Bye bye!');
}
closePopup();
```

Closing the popup mid-flow **signs the user out** (with `redirect: false` to prevent a page reload). This prevents a half-authenticated state where the user closed the popup but is still logged in with no visible UI for it.

### State in Context

The `PricingContext` stores everything step-to-step needs:

- **Flow state:** `currentStep`, `totalSteps`, `isPopupOpen`, `isNewUser`, `isSubscriber`, `hasLoadedSubscriberStatus`
- **User data:** `userDetails`, `coinsData`
- **Plan selections:** `selectedPlan`, `selectedDuration`, `isCoinsChecked`, `appliedCoupon`
- **Payment data:** `orderId`, `invoiceNumber`

Every setter is wrapped in `useCallback` and the value object in `useMemo` to keep context consumers from re-rendering on unrelated state changes.

---

## 13. Doc vs Code Discrepancies (Worth Knowing)

Going through the docs surfaced a few places where the docs are stale — these are **interview gold** because they show you read critically:

1. **`PRICING_POPUP.md` says `totalSteps` is a fixed value of 6.** The actual code (`PricingContext.tsx:80-87`) supports both 4 and 6 based on subscriber status. The doc is out of date.
2. **`AUTHENTICATION_GUIDE.md` and `API_INTEGRATION_GUIDE.md` reference `/api/backend` as the proxy path.** The actual config uses `/next-js/backend`. The docs are from an earlier iteration before the path was renamed to avoid `/api/*` collisions.
3. **`API_INTEGRATION_GUIDE.md` shows a simple Axios instance pattern** without the token refresh / race condition handling that `UnifiedApiClient` actually implements. The doc describes an earlier, simpler version of the API layer.
4. **`CookieManager` is referenced in `AUTHENTICATION_GUIDE.md`** but the `layout.tsx` flow suggests most cookie-setting now happens inside `UnifiedApiClient.handleResponseCookies()`. Both exist — `CookieManager` likely runs on session hydration, `UnifiedApiClient` runs after every response with `Set-Cookie`.

Being able to say "I noticed the docs are inconsistent with the code here — let me walk you through the actual implementation" is a strong signal.

---

## 14. Improvements to Mention (Shows Self-Awareness)

1. **Server Components underutilized** — most data fetching happens client-side. Static content (plans, testimonials, team data) could be fetched in server components and passed down, eliminating loading spinners
2. **No ISR/SSG** — marketing pages are perfect candidates for static generation. A revalidation interval of 60s would give near-instant loads
3. **PricingContext should use `useReducer`** — 12 `useState` calls with interrelated state transitions is a code smell. A reducer with typed actions would be cleaner
4. **Hero images should use `priority={true}`** — currently set to `loading="lazy"` which defeats the purpose for above-the-fold content
5. **No React Query** — acceptable for current scope, but the payment flow would benefit from query caching and mutation state management
6. **`heightTransform` computed but unused** — `ScrollTimelineWithImage.tsx:236-240` computes it then only logs it to bypass ESLint — should be removed or used
7. **Bundle analyzer available but ESM migration incomplete** — the commented-out ESM version in `next.config.ts` shows awareness of tree-shaking concerns with barrel exports, but the migration isn't done yet. CommonJS uses require() which is a runtime function — the bundler can't statically prove what's unused. ESM uses import which is a compile-time declaration — the bundler knows exactly which bindings are consumed and can eliminate the rest. This matters especially with barrel/index files, where a single CommonJS import can pull in an entire directory of components.
