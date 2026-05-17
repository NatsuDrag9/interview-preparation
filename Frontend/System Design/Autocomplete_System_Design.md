# Frontend System Design: Autocomplete Component (Interview-Ready)

## Problem Statement

Design an autocomplete UI component where: - User types in an input
box - Suggestions appear in a dropdown - User can select a suggestion

Examples: - Google search suggestions - Facebook search

------------------------------------------------------------------------

## 1. Requirements

### Functional

-   Show suggestions based on user input
-   Update results dynamically as user types
-   Allow selection via mouse and keyboard
-   Close dropdown on selection or blur

### Non-Functional

-   Fast and responsive UI
-   Avoid excessive API calls
-   Handle stale responses correctly
-   Accessible and keyboard-friendly

------------------------------------------------------------------------

## 2. High-Level Approach

-   Controlled input field
-   Fetch suggestions from server
-   Render dropdown with results
-   Manage async behavior carefully

------------------------------------------------------------------------

## 3. API Contract

GET /search?q=`<query>`{=html}

Response: { "results": \[ { "id": "1", "label": "John Doe", "type":
"user" } \] }

------------------------------------------------------------------------

## 4. Data Flow (Core)

User types → debounce (300ms) → API call → update results → render
dropdown

### Important Behaviors

Debouncing: - Delay API call until user stops typing - Prevents
excessive network requests

Race Condition Handling: - Only latest response should update UI - Use
request ID tracking or AbortController

------------------------------------------------------------------------

## 5. Component Structure

-   Autocomplete (container)
-   Input
-   Dropdown
-   ListItem

------------------------------------------------------------------------

## 6. State Management

UI State: - query - isOpen - activeIndex

Server State: - results - loading - error

------------------------------------------------------------------------

## 7. Interactions

Keyboard: - ArrowDown → next item - ArrowUp → previous item - Enter →
select - Escape → close

Mouse: - Click → select item

------------------------------------------------------------------------

## 8. Performance

-   Debouncing
-   Caching (per query)
-   Limit results (top 5--10)

------------------------------------------------------------------------

## 9. Edge Cases

-   Empty query → hide dropdown
-   No results → show message
-   Slow network → loading state
-   API failure → error state

------------------------------------------------------------------------

## 10. Accessibility

-   role="combobox"
-   aria-expanded
-   aria-controls
-   aria-activedescendant

------------------------------------------------------------------------

## 11. Summary

-   Debounce input
-   Handle stale responses
-   Support keyboard navigation
-   Cache results
-   Ensure accessibility
