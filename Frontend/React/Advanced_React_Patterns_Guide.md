# Advanced React Patterns Implementation Guide

## P4 Workflow Application

---

## Table of Contents

1. [Code Splitting](#code-splitting)
2. [React App Optimizations](#react-app-optimizations)
3. [Suspense](#suspense)
4. [Error Boundaries](#error-boundaries)
5. [Lazy Loading](#lazy-loading)
6. [Config Driven UI](#config-driven-ui)
7. [Dynamic UI](#dynamic-ui)

---

## 1. Code Splitting

### Definition

Code splitting breaks your bundle into smaller chunks that can be loaded on-demand, reducing initial bundle size and improving load time.

### Example from Codebase: `src/config/routes.ts`

```typescript
import { lazy } from "react";

const ContactDetails = lazy(
  () => import("@modules/entity-manager/ContactDetails/AddContactDetails"),
);

const UserManager = lazy(
  () => import("@modules/user-manager/ListView/ListView"),
);

const FinancialGoals = lazy(
  () => import("@modules/entity-manager/FinancialGoals/FinancialGoals"),
);

const UploadDocuments = lazy(
  () => import("@modules/entity-manager/UploadDocuments/UploadDocuments"),
);

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: MainLayout,
    requiredPermissions: [],
    children: [
      {
        path: "entity-manager/add-entity/contact-details",
        element: ContactDetails,
        requiredPermissions: [Permissions.CREATE_ENTITY],
      },
      {
        path: "user-manager",
        element: UserManager,
        requiredPermissions: [Permissions.VIEW_USER, Permissions.VIEW_GROUP],
      },
    ],
  },
];
```

### Explanation

- **What it does**: Uses `React.lazy()` to dynamically import route components
- **Benefit**: Each route module is split into a separate chunk and loaded only when the user navigates to that route
- **Implementation**: 50+ lazy-loaded routes in this application reduce initial bundle size significantly
- **When it loads**: When user navigates to `/entity-manager/add-entity/contact-details`, the ContactDetails chunk loads on-demand
- **Best for**: Large applications with many routes/pages that users don't all visit

---

## 2. React App Optimizations

### Definition

Performance optimizations using React hooks like `useMemo` and `useCallback` to prevent unnecessary re-renders and expensive computations.

### Example from Codebase: `src/hooks/useMemoizedFormFields.ts`

```typescript
import { useMemo } from "react";

function useMemoizedFormFields({
  formFields,
  onTargetGroupRefresh,
  documentConfig,
  singleSelectCallback,
}: UseMemoizedFormFieldsProps): FormFieldsType[] {
  return useMemo(() => {
    const handleTargetGroupRefresh = async () => {
      if (onTargetGroupRefresh) {
        await onTargetGroupRefresh();
      }
    };

    const processField = (field: FormFieldsType): FormFieldsType => {
      if (field.fieldType === "targetGroup") {
        return {
          ...field,
          onRefresh: handleTargetGroupRefresh,
          // Dynamic callback assignment
          onSelectOption: singleSelectCallback?.find(
            (cb) => cb.name === field.name,
          )?.onSelectOption,
        };
      }

      if (field.fieldType === "file" && documentConfig) {
        const callback = documentConfig.fileUploadCallbacks.find(
          (cb) => cb.fieldName === field.name,
        );
        return {
          ...field,
          onFileUpload: callback?.onFileUpload,
          initialFiles: documentConfig.uploadedDocuments?.[field.name] || [],
        };
      }

      return field;
    };

    return formFields.map(processField);
  }, [formFields, onTargetGroupRefresh, documentConfig, singleSelectCallback]);
}
```

### Explanation

- **What it does**: Memoizes the form field processing logic
- **Benefit**: Prevents recomputation of form fields unless dependencies change
- **How it works**:
  - `useMemo` only recalculates when `formFields`, `onTargetGroupRefresh`, `documentConfig`, or `singleSelectCallback` change
  - Saves expensive operations like dynamic callback assignment and file upload setup
- **Real-world impact**: In a form with 20+ fields, this prevents 20+ field processing cycles on every parent re-render
- **Dependency Array**: `[formFields, onTargetGroupRefresh, documentConfig, singleSelectCallback]` tells React when to recalculate

### Real Usage Context

```typescript
// In AddContactDetails component
const memoizedFormFields = useMemoizedFormFields({
  formFields: addContactDetailsFormFields,
  onTargetGroupRefresh: formApi.refreshCountries,
  documentConfig: {
    /* config */
  },
  singleSelectCallback: singleSelectCallbacks,
});
```

---

## 3. Suspense

### Definition

Allows components to "wait" for asynchronous operations (like code splitting) and show a fallback UI while waiting.

### Example from Codebase: `src/components/auth/RoutesWithGuard/RoutesWithGuard.tsx`

```typescript
import { Suspense } from 'react';
import { Loading } from '@components/generics';

function RoutesWithGuard({ routes }: { routes: RouteConfig[] }) {

  // This second inner Suspense handles the 100ms–500ms gap while that specific "chunk"
  // of JavaScript is being fetched.
  const renderRoute = (route: RouteConfig) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        route.children ? (
          <Suspense
            fallback={
              <div className="full-page-loader">
                <Loading />
              </div>
            }
          >
            <route.element>
              <Outlet />
            </route.element>
          </Suspense>
        ) : (
          <RouteGuard
            element={route.element}
            requiredPermissions={route.requiredPermissions}
          />
        )
      }
    >
      {route.children?.map((childRoute) =>
        childRoute.children ? (
          renderRoute(childRoute)
        ) : (
          <Route
            key={childRoute.path}
            path={childRoute.path}
            element={
              <RouteGuard
                element={childRoute.element}
                requiredPermissions={childRoute.requiredPermissions}
              />
            }
          />
        )
      )}
    </Route>
  );

// This global handles the delay while the app determines the user's "Global State."
// For example, checking if a user is logged in via an API call or loading the main configuration files
  return (
    <Suspense
      fallback={
        <div className="full-page-loader">
          <Loading />
        </div>
      }
    >
      <Routes location={location}>
        {routes.map(renderRoute)}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}
```

### Explanation

- **What it does**: Shows a loading spinner while lazy-loaded components are being fetched
- **Benefit**: Provides smooth UX during code chunk loading instead of blank screen
- **How it works**:
  - When user navigates to a lazy-loaded route, `Suspense` catches the pending promise
  - Displays `<Loading />` component (spinner) as fallback
  - Once the chunk loads, renders the actual route component
- **Multiple levels**: Suspense wraps both parent routes and child routes for granular loading states
- **Fallback UI**: `<div className="full-page-loader"><Loading /></div>` shows full-page loader during navigation

### User Experience Flow

```
1. User clicks on /entity-manager link
2. ContactDetails chunk is loading...
3. Suspense shows <Loading /> spinner
4. Chunk loads
5. Full ContactDetails page renders
```

---

## 4. Error Boundaries

### Definition

React components that catch JavaScript errors in child components and display a fallback UI instead of crashing the entire app.

### Example from Codebase: `src/components/generics/ErrorBoundary/ErrorBoundary.tsx`

```typescript
import { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '@modules/sandbox/ErrorPage/ErrorPage';
import { logError } from '@utils/logUtils';

const ErrorFallback = memo(
  ({ error, componentStack, route }: ErrorPageProps) => {
    return (
      <ErrorPage error={error} componentStack={componentStack} route={route} />
    );
  }
);

function ReactErrorBoundary({ children }: ReactErrorBoundaryProps) {
  const [errorInfo, setErrorInfo] = useState<{
    error: Error;
    componentStack: string;
  } | null>(null);
  const currentRoute = useCurrentRoute();

  return (
    <ErrorBoundary
      fallback={
        errorInfo ? (
          <ErrorFallback
            error={errorInfo.error}
            componentStack={errorInfo.componentStack}
            route={currentRoute}
          />
        ) : null
      }
      onError={(error, info) => {
        setErrorInfo({ error, componentStack: info.componentStack || '' });
        logError('ErrorBoundary (error-info):', info);
        logError('ErrorBoundary (error): ', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ReactErrorBoundary;
```

### Explanation

- **What it does**: Catches unhandled errors in child components and logs them
- **Benefit**: Prevents entire app crash; shows user-friendly error page instead
- **How it works**:
  - Uses `react-error-boundary` library (3rd party)
  - `onError` callback captures the error and component stack trace
  - Logs error for debugging via `logError()`
  - Displays `ErrorFallback` component with error details and current route
- **Error Information Captured**:
  - `error`: The thrown error object
  - `componentStack`: Stack trace showing which component threw the error
  - `currentRoute`: What page user was on when error occurred
- **Logging Integration**: All errors are logged for monitoring and debugging

### Error Handling Flow

```
1. Child component throws error
2. ErrorBoundary catches it
3. setErrorInfo() stores error and stack
4. logError() logs to console/monitoring service
5. ErrorFallback renders with error details
6. User sees friendly error page instead of blank screen
```

---

## 5. Lazy Loading

### Definition

Loading resources (components, images, data) only when they're needed rather than upfront.

### Example from Codebase: `src/config/routes.ts` (Same as Code Splitting)

```typescript
// Components are lazy loaded at route level
const ContactDetails = lazy(
  () => import("@modules/entity-manager/ContactDetails/AddContactDetails"),
);

const UserManager = lazy(
  () => import("@modules/user-manager/ListView/ListView"),
);

const FinancialGoals = lazy(
  () => import("@modules/entity-manager/FinancialGoals/FinancialGoals"),
);

// More than 50 lazy-loaded routes...
```

### How It Works in This App

```
Application Start:
├─ Load: Main.tsx
├─ Load: App.tsx
├─ Load: MainLayout component
└─ Load: RoutesWithGuard component
   └─ Routes defined but NOT yet loaded

User navigates to /entity-manager/add-entity/contact-details:
├─ Route matches
├─ React.lazy() triggers
├─ ContactDetails chunk downloads
├─ Suspense shows Loading spinner
├─ Component renders
└─ Subsequent navigations to same route use cached chunk
```

### Explanation

- **What it does**: Components are only imported when route is accessed
- **Benefit**:
  - Initial bundle size: ~100KB (core app)
  - Each route chunk: ~20-50KB (loaded on-demand)
  - vs non-lazy bundle: ~3-5MB (everything upfront)
- **Network**: Chunks load over network only when needed
- **Caching**: Browser caches chunks, subsequent navigations are instant
- **50+ Routes**: Each can be independently cached and updated

---

## 6. Config Driven UI

### Definition

Building UI dynamically from configuration objects rather than hardcoding components. Separates data (config) from presentation.

### Example 1: FormBuilder - `src/components/composites/FormBuilder/FormBuilder.tsx`

#### Type Definition: `src/definitions/formBuilderTypes.ts`

```typescript
export type FieldType =
  | "date"
  | "email"
  | "number"
  | "text"
  | "targetGroup"
  | "multiSelect"
  | "singleSelect"
  | "textarea"
  | "file"
  | "checkbox"
  | "mobile"
  | "timeInput";

export interface FormFields {
  fieldType: FieldType;
  name: string;
  label: string;
  isRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
  // ... more config properties
  conditionalFields?: {
    value: string;
    fields: FormFields[];
  }[];
}

export interface FormBuilderProps<T extends FieldValues> {
  formValidationSchema: ObjectSchema<T>;
  onSubmit: (formData: T) => void;
  initialData?: T;
  formFields: FormFields[]; // Config array
  optionsList?: OptionsList[];
  // ...
}
```

#### Component: `src/components/composites/FormBuilder/FormBuilder.tsx`

```typescript
function FormBuilder<T extends FieldValues>({
  formFields,        // Config: Array of field definitions
  optionsList,       // Config: Available options for selects
  onSubmit,
  initialData,
  // ... other props
}: FormBuilderProps<T>) {

  const renderField = useCallback(
    (field: FormFields): ReactNode => {
      // Renders different components based on field config
      const fieldContent = (
        <>
          {(() => {
            switch (field.fieldType) {
              case 'date':
                return (
                  <DateInput
                    name={field.name}
                    label={field.label}
                    isRequired={field.isRequired !== false}
                    minDate={field.minDate}
                    maxDate={field.maxDate}
                    placeholder={field.placeholder}
                  />
                );
              case 'email':
              case 'number':
              case 'text':
                return (
                  <FormInput
                    inputType={field.fieldType}
                    name={field.name}
                    placeholder={field.placeholder}
                    isRequired={field.isRequired !== false}
                    labelText={field.label}
                  />
                );
              case 'singleSelect':
                return (
                  <>
                    <SingleSelectFormInput
                      fieldName={field.name}
                      selectLabel={field.label}
                      selectOptions={getOptions(field.name, optionsList || [])}
                    />
                    {renderConditionalFields(field)}
                  </>
                );
              case 'multiSelect':
                return (
                  <MultiSelectFormInput
                    fieldName={field.name}
                    selectLabel={field.label}
                    selectOptions={getOptions(field.name, optionsList || [])}
                  />
                );
              case 'file':
                return (
                  <UploadFileFormInput
                    uploadFileInputId={field.uploadFileInputId}
                    initialFiles={field.initialFiles}
                    onFileUpload={field.onFileUpload}
                  />
                );
              // ... more cases
              default:
                return null;
            }
          })()}
        </>
      );

      return field.containerClassName ? (
        <div className={field.containerClassName}>{fieldContent}</div>
      ) : (
        fieldContent
      );
    },
    [optionsList]
  );

  return (
    <FormLayout>
      <div className="form-builder__form-rows">
        {formFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(field)}
          </React.Fragment>
        ))}
      </div>
    </FormLayout>
  );
}
```

#### Usage Example: `src/modules/entity-manager/ContactDetails/constants.ts`

```typescript
// This is the CONFIG - just plain JavaScript objects
const addContactDetailsFormFields: FormFields[] = [
  {
    fieldType: "text",
    name: "addEntityFirstName",
    label: "First Name",
    isRequired: true,
    placeholder: "Enter first name",
  },
  {
    fieldType: "email",
    name: "addEntityEmail",
    label: "Email Address",
    isRequired: true,
    placeholder: "Enter email",
  },
  {
    fieldType: "singleSelect",
    name: "addEntityCountry",
    label: "Country",
    isRequired: true,
  },
  {
    fieldType: "date",
    name: "addEntityDOB",
    label: "Date of Birth",
    isRequired: true,
    minDate: "1950-01-01",
    maxDate: "2005-12-31",
  },
  {
    fieldType: "file",
    name: "addEntityDocuments",
    label: "Upload Documents",
    isRequired: false,
    maxFiles: 5,
  },
];
```

### Explanation

- **What it does**: Form structure is defined as configuration, component renders based on it
- **Benefit**:
  - Add/remove/reorder fields without touching component code
  - Reuse same component for different forms
  - Easy to generate forms from API responses
- **Switch Statement**: Maps `fieldType` to appropriate input component
- **Flexibility**: Each field can have its own validation, styling, callbacks
- **Scalability**: To add a new form, just create new config array, no new component needed

---

### Example 2: DisplayBuilder - `src/components/composites/DisplayBuilder/DisplayBuilder.tsx`

#### Type Definition: `src/definitions/displayBuilderTypes.ts`

```typescript
export type DisplayBuilderType = "textField" | "description" | "attachments";

export interface DisplayBuilderElement {
  type: DisplayBuilderType;
  documents?: GenericDocumentTypeBackendFormat[];
  label?: string;
  content?: string;
}
```

#### Component: `src/components/composites/DisplayBuilder/DisplayBuilder.tsx`

```typescript
function DisplayBuilder({ previewElements }: DisplayBuilderProps) {
  const renderElement = (element: DisplayBuilderElement, index: number) => {
    // Renders different components based on element type config
    switch (element.type) {
      case 'textField':
        return (
          <TextField
            key={`textField-${index}`}
            label={element.label || ''}
            content={element.content || ''}
          />
        );
      case 'description':
        return (
          <DescriptionArea
            key={`description-${index}`}
            label={element.label || ''}
            content={element.content || ''}
          />
        );
      case 'attachments':
        return (
          <DocumentCard
            key={`attachments-${index}`}
            documents={element.documents || []}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="display-builder" data-testid="display-builder">
      {previewElements.map((element, index) =>
        renderElement(element, index)
      )}
    </div>
  );
}
```

#### Usage Example

```typescript
// Config from API or state
const previewElements: DisplayBuilderElement[] = [
  {
    type: 'textField',
    label: 'Customer Name',
    content: 'John Doe',
  },
  {
    type: 'description',
    label: 'Customer Notes',
    content: 'Premium customer with 10+ years history',
  },
  {
    type: 'attachments',
    documents: [
      { name: 'ID.pdf', url: '/docs/id.pdf' },
      { name: 'License.pdf', url: '/docs/license.pdf' },
    ],
  },
];

// Render with same component for any similar data
<DisplayBuilder previewElements={previewElements} />
```

### Comparison

| Aspect           | FormBuilder              | DisplayBuilder         |
| ---------------- | ------------------------ | ---------------------- |
| Purpose          | Input form generation    | Display data layout    |
| Interactivity    | High (user input)        | Low (read-only)        |
| Field Types      | 11+ input types          | 3 display types        |
| Dynamic Features | Yes (conditional fields) | No (static)            |
| Use Case         | Create/Edit forms        | Preview/Review screens |

---

## 7. Dynamic UI

### Definition

UI elements that change, appear, or disappear based on user interactions, state changes, or data conditions without requiring page reload or component swap.

### Example from Codebase: `src/components/composites/FormBuilder/FormBuilder.tsx`

```typescript
function FormBuilder<T extends FieldValues>({
  formFields,
  optionsList,
  // ... other props
}: FormBuilderProps<T>) {
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});

  const handleSelectChange = (fieldName: string, value: string) => {
    setSelectValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = useCallback(
    (field: FormFields): ReactNode => {
      const isRequired = field.isRequired !== false;

      // DYNAMIC: This function renders different fields based on user selection
      const renderConditionalFields = (
        singleSelectField: FormFields
      ): ReactNode => {
        // Only process if field is singleSelect and has conditional fields
        if (
          singleSelectField.fieldType === 'singleSelect' &&
          singleSelectField.conditionalFields
        ) {
          // Get the CURRENT selected value from state
          const selectedValue = selectValues[singleSelectField.name];

          // Find matching conditional fields for this selected value
          const matchingCondition = singleSelectField.conditionalFields.find(
            (condition) => condition.value === selectedValue
          );

          // If match found, DYNAMICALLY render those fields
          if (matchingCondition) {
            return matchingCondition.fields.map((conditionalField) => (
              <React.Fragment key={conditionalField.name}>
                {renderField(conditionalField)}
              </React.Fragment>
            ));
          }
        }
        return null;
      };

      // ... render main field ...

      switch (field.fieldType) {
        case 'singleSelect':
          return (
            <>
              <SingleSelectFormInput
                fieldName={field.name}
                selectLabel={field.label}
                selectOptions={getOptions(field.name, optionsList || [])}
                onOptionSelect={(value) => {
                  if (field.onSelectOption) {
                    field.onSelectOption(value);
                  }
                  // Update state when selection changes
                  handleSelectChange(field.name, value);
                }}
              />
              {/* DYNAMIC: Conditionally render fields based on selection */}
              {renderConditionalFields(field)}
            </>
          );
        // ... other cases ...
      }
    },
    [optionsList, selectValues] // selectValues dependency triggers re-render
  );

  return (
    <FormLayout>
      <div className="form-builder__form-rows">
        {formFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(field)}
          </React.Fragment>
        ))}
      </div>
    </FormLayout>
  );
}
```

#### Config Structure with Conditional Fields

```typescript
// From constants or API
const formFieldsWithConditionals: FormFields[] = [
  {
    fieldType: "singleSelect",
    name: "entityType",
    label: "What type of entity?",
    isRequired: true,
    // DYNAMIC: These fields appear/disappear based on selection
    conditionalFields: [
      {
        // Show these fields if user selects "Individual"
        value: "Individual",
        fields: [
          {
            fieldType: "date",
            name: "dateOfBirth",
            label: "Date of Birth",
            isRequired: true,
          },
          {
            fieldType: "text",
            name: "nationality",
            label: "Nationality",
            isRequired: true,
          },
        ],
      },
      {
        // Show these fields if user selects "Company"
        value: "Company",
        fields: [
          {
            fieldType: "text",
            name: "registrationNumber",
            label: "Company Registration Number",
            isRequired: true,
          },
          {
            fieldType: "text",
            name: "industry",
            label: "Industry",
            isRequired: true,
          },
        ],
      },
    ],
  },
];
```

### Explanation

- **What it does**: Form fields appear/disappear based on user's selection of another field
- **How it works**:
  1. User selects "Individual" from dropdown
  2. `handleSelectChange()` updates `selectValues` state
  3. `renderConditionalFields()` finds matching condition for "Individual"
  4. Those fields are DYNAMICALLY rendered below the dropdown
  5. If user changes to "Company", different fields appear

- **State-Driven**: `selectValues` state tracks what user selected
- **Recursive**: `renderField()` calls itself for conditional fields (nested conditions supported)
- **Dependency Array**: `[optionsList, selectValues]` means re-render whenever selection changes

### Real-World Scenario

```
Initial State:
┌─ Entity Type (dropdown) ← User hasn't selected yet
│
└─ No additional fields shown

User selects "Individual":
┌─ Entity Type (dropdown) = "Individual"
├─ Date of Birth (DATE INPUT) ← Appears
└─ Nationality (TEXT INPUT) ← Appears

User changes to "Company":
┌─ Entity Type (dropdown) = "Company"
├─ Company Registration Number (TEXT INPUT) ← Appears
└─ Industry (TEXT INPUT) ← Appears

User clears selection:
┌─ Entity Type (dropdown) = ""
└─ No additional fields ← All conditional fields disappear
```

---

## Summary Table

| Pattern                 | Implementation                     | Use Case                             | File Location                                               |
| ----------------------- | ---------------------------------- | ------------------------------------ | ----------------------------------------------------------- |
| **Code Splitting**      | `React.lazy()` + Dynamic import    | Large multi-page apps                | `src/config/routes.ts`                                      |
| **React Optimizations** | `useMemo()`, `useCallback()`       | Expensive calculations               | `src/hooks/useMemoizedFormFields.ts`                        |
| **Suspense**            | `<Suspense>` with fallback         | Loading states for lazy components   | `src/components/auth/RoutesWithGuard/`                      |
| **Error Boundaries**    | `react-error-boundary` library     | Graceful error handling              | `src/components/generics/ErrorBoundary/`                    |
| **Lazy Loading**        | Dynamic imports at route level     | Route-based code splitting           | `src/config/routes.ts`                                      |
| **Config Driven UI**    | Config objects → Component mapping | Reusable form/display components     | `src/components/composites/FormBuilder/`, `DisplayBuilder/` |
| **Dynamic UI**          | State-based conditional rendering  | Show/hide fields based on user input | `src/components/composites/FormBuilder/FormBuilder.tsx`     |

---

## Best Practices Applied

1. **Performance**: Memoization reduces unnecessary re-renders
2. **UX**: Suspense shows loading states, Error Boundaries catch crashes
3. **Maintainability**: Config-driven UI separates data from presentation
4. **Scalability**: Code splitting keeps bundle size manageable
5. **Flexibility**: Dynamic UI adapts to different data/user choices
6. **Error Handling**: Comprehensive error boundaries with logging

---

## Interview Key Takeaways

- **Code Splitting + Suspense**: Provides fast initial load with smooth loading UX
- **Error Boundaries**: Prevents full app crash, logs errors for monitoring
- **useMemo/useCallback**: Optimizes expensive operations, essential for large forms
- **Config-Driven UI**: Reuse same component for multiple forms/displays
- **Dynamic UI**: Complex conditional rendering handled elegantly with state
- **Combined Power**: These patterns work together to create responsive, maintainable apps

---

## How to Use This Guide

- **Quick Reference**: Use the Summary Table to identify which pattern to use
- **Deep Dive**: Read each section's explanation and code example
- **Interview Prep**: Read "Key Takeaways" and rehearse each pattern's benefits
- **Implementation**: Copy config structures and adapt to your use case
- **Code Navigation**: File paths are clickable in IDE - jump directly to source

---

**Document Created**: 2026-03-29
**Application**: P4 Workflow
**React Version**: 18+
**TypeScript**: Yes
