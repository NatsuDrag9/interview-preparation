# Frontend System Design: News Feed (Interview-Ready)

## Problem Statement

Design a web news feed that allows users to: - Browse posts (text +
images) - React to posts (like, etc.) - Create new posts

Focus on: - Frontend architecture - Client--server contract -
Performance and scalability

---

## 1. Requirements

### Functional

- Fast initial render
- Infinite scrolling (load more on scroll)
- Reactions and post creation
- Handle long-lived sessions and stale data

### Non-Functional

- Smooth scrolling (no jank)
- Low time-to-first-render
- Efficient memory + DOM usage
- Scalable to large feeds

---

## 2. High-Level Approach

- Build as a SPA
- Use cursor-based pagination
- Render feed incrementally
- Separate:
  - Data fetching
  - State management
  - Presentation

---

## 3. API Contract

### Fetch Feed

```
GET /feed?cursor=`<cursor>`{=html}&limit=10

Response: { "posts": Post\[\], "nextCursor": "abc123", "hasMore": true }
```

### Key Decision

- Return fully hydrated Post objects
- Avoid returning only IDs (prevents N+1 requests)

---

## 4. Data Fetching Strategy

### Initial Load

- Fetch first 10--20 posts
- Render immediately for fast perceived performance

### Pagination

- Use nextCursor to fetch next batch
- Append new posts to existing list

---

## 5. Infinite Scroll + Prefetching

### Infinite Scroll

- Use Intersection Observer
- Add a sentinel element near bottom
- When visible → trigger next fetch

### Prefetching

- Fetch next page before reaching bottom
- Eliminates loading delay

---

## 6. Component Structure

- FeedList (data + pagination)
- FeedCard (individual post)
- Subcomponents: ReactionBar, CommentSection

---

## 7. State Management

### Server State

- Posts, pagination cursor, caching
- Managed via query layer

### UI State

- Comment toggles
- Local interaction state

---

## 8. Interactions

### Reactions

- Optimistic updates
- Rollback on failure

### Comments

- Lazy load per post
- Paginate if large

---

## 9. Performance Optimizations

- Virtualization (render only visible posts)
- Image lazy loading
- Prefetching
- Caching

---

## 10. Long-Lived Sessions

- Background refetching
- Cache invalidation
- Optional memory windowing

---

## 11. Optional UX Consideration

- "You're all caught up" markers
- Session-awareness nudges

---

## 12. Summary

- Cursor-based pagination
- Infinite scroll + prefetching
- Virtualization for performance
- Clear state separation
