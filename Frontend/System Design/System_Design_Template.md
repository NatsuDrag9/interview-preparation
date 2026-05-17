# Frontend System Design: [Component / Feature Name]

## Problem Statement

Provide a brief, high-level description of what we are designing. Include real-world examples (e.g. "Similar to Google's Search Autocomplete" or "Similar to Facebook's News Feed") to set the context immediately.

* **Context:** [Describe the context, e.g. B2C desktop web app, standalone UI component, or complex dashboard]
* **Target Audience / Devices:** [Desktop, mobile responsive, heavy keyboard users, etc.]

---

## 1. Requirements

Gathering and clarifying requirements is the most critical first step of a frontend system design interview.

### Functional Requirements
*What features does the component or application support?*
* [ ] Feature 1 (e.g., "User can type in a text input and see suggestions")
* [ ] Feature 2 (e.g., "Suggestions should update dynamically with each keypress")
* [ ] Feature 3 (e.g., "Items should be selectable via mouse click and keyboard arrow keys")
* [ ] Feature 4 (e.g., "The dropdown list should close when clicking outside the component")

### Non-Functional Requirements
*What are the UX, accessibility, and performance standards?*
* [ ] **Performance:** [Target load time, initial render speed, debounce times, API call mitigation]
* [ ] **Scalability / Rendering:** [How does it handle hundreds or thousands of concurrent elements? (e.g., list virtualization)]
* [ ] **Network / Stale Data:** [Race-condition prevention, caching queries, optimistic updates]
* [ ] **Accessibility (A11y):** [WAI-ARIA compliance, screen reader support, full keyboard navigability]

### Assumptions & Constraints
*Define the scope to avoid over-engineering during the interview.*
* **Assumption 1:** [e.g., "We assume only 1 level of dropdown menus exists (no sub-menus)"]
* **Assumption 2:** [e.g., "We assume data fetched from the API fits within standard memory limits"]
* **Assumption 3:** [e.g., "The component is built using standard native elements instead of custom canvas elements"]

### Clarifying Questions for the Interviewer
*Keep these in mind to align with the interviewer early on.*
* *Question 1:* [e.g., "Should we support asynchronous lazy-loading on scroll or fetch all items upfront?"]
* *Question 2:* [e.g., "Do we need to handle rich media items (images/videos) in the suggestions, or just plain text?"]

---

## 2. High-Level Architecture & UI Structure

Define the components, who holds the state, and how elements relate to each other.

```mermaid
graph TD
    ParentContainer[Parent / Page Container] -->|Props: configuration & callbacks| TargetComponent[Target Component]
    TargetComponent -->|State: isOpen, activeIndex| Child1[Child Component 1 (e.g., Input)]
    TargetComponent -->|State: results| Child2[Child Component 2 (e.g., Dropdown)]
    Child2 -->|Props: single item details| Child3[Child Component 3 (e.g., ListItem)]
```

### Component Hierarchy
* **`<ContainerComponent>` (Container):**
  * Responsible for data fetching, global/server state integration, and passing callbacks.
* **`<TargetComponent>` (Presenter):**
  * Responsible for layout structure, applying local state (e.g., open/close), keyboard listeners, and basic styles.
* **`<ChildComponents>` (Presentational):**
  * Lightweight, reusable components focusing purely on visual rendering (e.g., individual list items, buttons).

---

## 3. Data Models & API Contracts

Define the exact data structures and communication protocols between client and server.

### Client-Server API Contract
*Describe the HTTP endpoint, request parameters, and response structure.*

* **Endpoint:** `GET /v1/search`
* **Query Parameters:**
  * `q`: `string` (The search query)
  * `limit`: `number` (Maximum results to return)
* **Response Payload (JSON):**
```json
{
  "results": [
    {
      "id": "string",
      "label": "string",
      "type": "string",
      "meta": {
        "subtitle": "string",
        "imageUrl": "string"
      }
    }
  ],
  "hasMore": "boolean",
  "nextCursor": "string"
}
```

### Component Prop Interfaces (TypeScript)
*Provide the exact TypeScript interfaces for the main components.*

```typescript
export interface ListItemData {
  id: string;
  label: string;
  type: string;
}

export interface TargetComponentProps {
  label?: string;
  placeholder?: string;
  initialValue?: string;
  onSelect: (item: ListItemData) => void;
  fetchData: (query: string) => Promise<ListItemData[]>;
}
```

---

## 4. State Management & Data Flow

Outline where state lives, how it is updated, and how it flows through the components.

### UI State (Local)
* **`isOpen` (`boolean`):** Controls the visibility of the interactive elements.
* **`activeIndex` (`number`):** Tracks the currently highlighted item for keyboard navigation.
* **`query` (`string`):** Holds the current input value.

### Server State (Asynchronous)
* **`results` (`ListItemData[]`):** Data fetched from the API.
* **`isLoading` (`boolean`):** Displays a spinner or skeleton loader.
* **`error` (`Error | null`):** Handles displaying failure alerts.

### Data Flow Execution
1. **User Action:** [e.g. User types character into input field]
2. **State Transition:** Local `query` state updates ➔ Debounce timer starts.
3. **Async Fetch:** Debounce completes ➔ API helper fires ➔ `isLoading` set to true.
4. **Data Receival:** Response returns ➔ `results` state populated, `isLoading` set to false.
5. **Render Update:** UI re-renders suggestion list with new items.

---

## 5. User Experience (UX) & Interactions

Describe hover states, transitions, micro-interactions, and visual states.

* **Hover States:** Visual feedback on hover (`cursor: pointer`, subtle background color transition).
* **Transitions:** Smooth fade-in/out and vertical slides for dropdowns using CSS transitions (`opacity`, `transform`).
* **Outside Clicks:** Attaching a global `mousedown` event listener to close overlay components if a click originates outside the container.
* **Visual Loaders:** CSS skeleton animations instead of plain spinners for a smoother loading feel.

---

## 6. Accessibility (A11y) & Semantics

Making your components accessible is a major differentiator in senior-level interviews.

### WAI-ARIA Attributes
* **`role="combobox"` / `role="listbox"`:** Identifies the component type to screen readers.
* **`aria-expanded={isOpen}`:** Informs screen readers if options are currently visible.
* **`aria-controls="options-list-id"`:** Links the input with its accompanying dropdown menu.
* **`aria-activedescendant={activeOptionId}`:** Keeps screen readers updated on which list item is currently focused via keyboard keys.

### Keyboard Navigation Map
Ensure full operability without a mouse:
* **`ArrowDown`:** Increments `activeIndex` to highlight the next option in the list.
* **`ArrowUp`:** Decrements `activeIndex` to highlight the previous option.
* **`Enter`:** Selects the highlighted option and triggers the selection callback.
* **`Escape`:** Closes the dropdown list and returns focus to the input element.
* **`Tab` / `Shift+Tab`:** Standard focus movement, ensuring focus is returned gracefully.

---

## 7. Performance & Optimizations

Detail how the component manages resources under heavy loads or slow networks.

* **Network Optimization:**
  * **Debouncing:** Delaying API queries by 200-300ms to avoid overwhelming the server during fast typing.
  * **Race Condition Mitigation:** Using `AbortController` to cancel previous in-flight requests when a new request is made, ensuring only the latest response updates the UI.
  * **In-Memory Caching:** Using a simple Map object `{ [query]: results }` to immediately resolve repeat queries without making extra network requests.
* **Rendering Optimization:**
  * **List Virtualization:** (If list size > 100) Render only visible items in the viewport, absolute positioning them to maintain correct scroll heights.
  * **Memoization:** Wrapping callbacks in `useCallback` and items in `React.memo` to avoid costly re-renders of list items during typing.

---

## 8. Edge Cases & Error Handling

List the scenarios that often break poorly designed applications.

* **Empty Query State:** If input query is cleared, immediately empty results and close dropdown.
* **No Results Found:** Render a user-friendly *"No results found matching '[query]'"* message inside the list.
* **Slow Network / Offline:** Handle timeout limits gracefully and display a cached fallback if offline.
* **API Error State:** Display a discreet warning banner with a "Retry" button.

---

## 9. Technical Trade-offs & Decisions

Prepare to defend your design choices against alternatives:
1. **Trade-off: Virtualization vs. DOM Overhead**
   * *Decision:* Used list virtualization. *Reasoning:* While it introduces extra JavaScript rendering calculations and scroll listeners, it keeps DOM nodes low, maintaining a solid 60FPS on low-power mobile devices.
2. **Trade-off: Centralized Redux Store vs. Local State**
   * *Decision:* Kept state local to the component container. *Reasoning:* Autocomplete or dropdown state is transient and doesn't need to persist or be shared globally, avoiding unnecessary boilerplate and store pollution.
