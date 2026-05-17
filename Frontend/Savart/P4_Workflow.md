## Summary

This is a summary of all the work I did in P4 Workflow, Savart.

### Complex Composites

These are config-driven reusbale composite components which are used throughout the application

#### Form Builder

Form Builder is a config-driven component that takes an array of objects of field definitions and a Yup schema, then dynamically renders a validated form - including conditional fields that appear based on user selections - without writing any JSX per form. FormLayout underneath handles all state management, validation, dirty tracking, and reset logic via react-hook-form and yup.

**Working**

1. Config In -> UI Out
   You define fields as plain JS (TS) objects:

```
 {fieldType: 'text', name: 'firstName', label: 'First Name', isRequired: true, }
```

FormBuilder iterats through an array of field objects and renders the matching `fieldType` via a `switch` statement defined in a `renderField()` function. For example, `text` -> `FormInput`, `date` -> `DateInput`, `singleSelect` -> `SingleSelectFormInput`, etc.

2. Dynamic Conditional Fields - A singleSelect field can declare `conditionalFields` - nested field configs which render based on the user's selected option. When user selects an option, the `handleSelectChange` updates the internal `selectedValues` state, and then displays the conditional fields using `renderConditionalFields()`. Since it's defined within `renderField()`, it calls the `renderField()` recursively until all fields assigned to the `conditionalFields` array have been displayed.

3. FormLayout - the engine underneath
   FormBuilder component is purely the rendering layer wrapper over FormLayout. FormLayout, whcih again is a wrapper over `react-hook-form`'s provider, handles all state management, validation, dirty tracking and reset logic via `react-hook-form`.
   - react-hook-form - `useForm` hook manages fields registration, dirty tracking and submission
   - Yup (`yupResolver`) handles schema-based validation with `mode: onSubmit` and `revaliateMode: onChange`
   - FormProvider exposes the form context so all nested inputs (like `FormInput`, `DateInput`) can self-register via `useFormContext` without prop-drilling
   - reset(initialData) - FormLayout resets all fields to new values when `initialData` prop changes
   - dirtyFields - used to compute `modifiedData` - fields which actually changed and, passes both `formData` (all values) and `modifiedData` back to the parent via onSubmit callback
   - Server errors clearing - watches all fields and auto-clears serverErrors when the user edits anything

**Usage**
To use FormBuilder, it needs be to setup in the parent component using a set of hooks followng an assembly pattern:

1. Define the config (in `constants.ts`) - It doesn't contain any runtime data and is a static array of `FormFields`:

```
// constants.ts

const formFields: FormFields[] = [
   {fieldType: 'text', name: 'firstName', label: 'First Name', isRequired: true},
   {fieldType: 'singleSelect', name: 'country', label: 'Country',},
   {fieldType: 'file', name: 'documents', label: 'Upload'}
]

```

2. Define schema + initial data (`in schemaGenerator.ts`):

```
// schemaGenerator.ts
export interface MyFormInterface {
    firstName: string;
    country?: string;
    ...
}

const initialData: MyFormInterface = {
    firstName: "A",
    country: "IN",
    ...
}

const formSchema = YupObject({
    firstName: YupString().required(),
    country: YupString().optional(),
    ...
})

```

3. Parent Component

- `useFormApi` -- custom hook that wraps RTK Query calls to use in the parent component
- `useOptionsList` -- maps dropdown API responses the format accepted by FormBuilder
- `singleSelectCallbacks` -- for reacting to dropdown selections
- `useMemoizedFormFields` -- the glue. Takes static config and injects all dynamic behaviour. Returns a memoized array that only recomputes when dependencies change.

```
const formFields = useMemoizedFormFields({
    formFields: baseFormFields, // from constants.ts
    singleSelectCallbacks: singleSelectCallbacs, // dropdown callbacks
    onTargetGroupRefresh: formApi.refresh, // api to be called when target group is refreshed
    documentConfig: {
        uploadedDocuments,
        fileUploadCallbacks,
        handleErrorChange,
        uploadFileError
    }
})
```

4. Render

```
<FormBuilder<MyFormInterface>
    formValidationSchema={formSchema}
    onSubmit={handleSubmit}
    initialData={formInitialData}
    formFields={formFields}
    optionsList={optionsList}
    isApiLoading={formApi.isPostingData}
    hasSingleButton
    buttonText="Save'
 />

```

** Flow Visualized**:

- constants.ts - static field definitions
- schemaGenerator.ts - Yup schema + interface + initial data (validation rules)
- useFormApi - API layer (fetch options, post data)
- useOptionsList - transforms API data into dropdown options format accepted by FormBuilder
- singleSelectCallbacks - react to user selections
- useMemoizedFormFields - merges static config + callbacks + file handlers
- FormBuilder - prepares fields from merged config to render
- FormLayout - react-hook-form + Yup state management, form validation, dirty tracking
- handleSubmit - receives `formData` (all fields data) and `modifiedData` (changed fields data) as callback

This ensures config stays static and reusable. Runtime logic stays in the parent and FormBuilder is independent of either of them

#### Task Composite

Built to resolve multiple changes across different modules using this flow. It contains 3 components following a one task management flow.

1. TaskListView - Paginated list with filters, search and in-place status editing. Receives a `config` object with `useTaskListQuery`, `buildQueryParams`, `columnData`, route handlers and persists via `useListViewState` so navigation away and back restores the user's position.
2. AddTaskForm - Config-driven form (wraps FormBuilder) for task creation. Receives `useFormApi` (API hooks), `getPostData` which transforms data to POST request payload, and `formFields` and passes them to FormBuilder.
3. TaskDetailsView - Single task view with comments, status/assignment chnages, bulk task view and related support. Receives a config with `useTaskDetailsQuery`, `onCommentAdd`, `onStatusChange`, `onAssignmentChange`. Automatically detects bulk task and switches to a paginated sub-list of individual task instances.

#### Ticket Composite

Solves the same problem faced in task composite. Contains 2 components:

- TicketListView - Paginated list with filters, in-place status editing. Same pattern as TaskListView where it receives a `config` with `useTicketListQuery`, `buildQueryParams`, `columnData`, `ticketDetailRoute`.
- TicketDetailsView - Single ticket view with activity/comments and pin functionality. Renders 3 sections - an optional `HeaderComponent` (custom), a `TicketDetailsCard` (contains ticket metadata), a `QueryCard` (displaying the issue raised) and an activity section showing all comments as ActivityCard components. Supports comment pinning via `onPinClick` callback

**Improvements**

1. No error boundary per form - If a single field's render throws, the entire page crashes via global ErrorBoundary. Form Builder should catch per-field errors gracefully
2. Regex matching in conditionalFields - Works for `.*\\|NEW` but even a small typo in the expression silently breaks conditional rendering with no error. Use a discriminator function at the source where conditionalFields is defined:

```
conditionalFields: [
    {match: (value) => value.endsWith('*.\\|NEW'), fields: [...]},
    {match: (value) => value.endsWith('*.\\|MIGRATE'), fields: [...]},
]
```

#### Filter Component

A resuable filtering system that plugs in any list view. It renders the appropriate input UI based on the field's **datatype** and available **operators**. Users can add multiple filter conditions, save them as reusable templates, and apply them to trigger data refetches.

The dual-state design:

1. `filterState` - the applied filters driving the current data
2. `tempFilterState` - what the user is editing inside the popup

When the user clicks Apply, temp becomes applied and the parent is notified via `onApply`. When they cancel, temp resets to the last committed state. This prevents half-edited filters from leaking into API calls.

**Usage**

Parent provides:

1. `filterConfig` - what fields can be filtered (operators, datatypes, labels)
2. `templates` - saved filter presets (from API)
3. `onApply` - callback receiving validated `FilterState[]`
4. `onSaveTemplate` - callback to save a named template

Filter handles:

1. Popup open/close with state isolation
2. Validation - strips empty values, checks for date ranges, etc.
3. Template selection - loads filters but doesn't auto-apply
4. FilterPopup child renders the editing UI based on pre-defined datatypes and operators. Datatypes like `text`, `date`, `boolean` and `number` define what UI to render (`text` shows a text input, `date` shows a date picker, `number` shows a numebr input, `boolean` shows a toggle). Operators define how to compare - `equals`, `contains`, `in`, `range`, and so on

#### Permissions Table Group and Permissions Table

<!-- To Do: Complete this -->

---

### Architecture

#### RBAC based Routing

A declarative, config-driven access control system where every route declares the permissions it requires, and a single `RouteGuard` component enforces them before rendering.

**route.ts** - Stores the static config where every route is a plain object with its corresponding permissions.

```
[{
    path: "user-manager",
    element: UserManager,
    requiredPermissions: [Permissions.VIEW_USER, Permissions.VIEW_GROUP],
    children?: RouteConfig[]
},
...
]
```

**RoutesWithGuard.tsx**
Contains `RouteGuard` and `RoutesWithGuard`.

`RouteGuard` - wraps every leaf route. It performs 3 checks with the 3 outcomes:

- No specific permissions required - render the component
- Not authenticate - redirect to `/login`
- Missing any required permission - redirec to `/unauthorized`

Uses `requiredPermissions.every(hasPermission)` - AND logic, which means the user needs _all_ listed permissions

`RoutesWithGuard` - recursively calls the `RouteConfig[]` array tree and builds react-router `<Route>` elements. Parent routes with children get `<Suspense> + <Outlet>`, leaf routes are rendered via `RouteGuard`

**Permission Flow**

- User logs in
- Persmissions are stored in auth state of redux
- `usePermissions()` hook exposes `hasPermission(<perm>)` checker
- `RouteGuard` calls `hasPermission` for each required permission
- Pass - render component inside `Suspense`
- Fail - redirect

####
