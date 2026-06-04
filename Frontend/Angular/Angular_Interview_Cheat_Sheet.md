### Components

Building blocks of any Angular appplication which manage a specific section of the user interface called a view. A component is made up of:

- Template - html file / html
- Class - the model containing state
- Metadata - defined using `@Component`. It links the class with its template, selector and styles
- Styles - styles applied to the component

### Module

NgMOdule is a class decorated with `NgModule` that defines an Angular module - a container grouping related components, directives, pipes and services into a cohesive unit for better organization, readability and maintainability

Key properties:

- `declarations` - components, pipes, directives in this module
- `imports` - other modules being used in this module
- `providers` - services available for dependency injection
- `exports` - elements made available to other modules

```js
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {WelcomeComponent} from './welcome.component';

@NgModule({
  declarations: [AppComponent, WelcomeComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
});

export data AppModule{}
```

### Data binding

Data binding connects the component's data with the template, keeping them in sync. It lets you display values, respond to user input, and update UI automatically.

Two types:

**One-way data binding**
Data flows in one-direction - component --> view or from view --> component

- Interpolation `{{value}}`: shows data
- Property Binding `[property]="value"`: data flows from component to view thus binding the value in ts file to the DOM
- Event Binding `(event)="handler()"`: listens to user actions so data flows from view to component

```js
<!-- Interpolation -->
<h3>{{ title }}</h3>

<!-- Property binding -->
<img [src]="imageUrl" />

<!-- Event binding -->
<button (click)="onClick()">Click</button>
```

**Two-way data binding**
Data flows in both-ways - updates in the view reflect in component and vice-versa.

```js
<input [(ngModel)]="username" />
<p>Hello, {{ username }}!</p>

// class

export class AppComponent {
  title = 'Data Binding Example';
  imageUrl = 'logo.png';
  username = '';
  onClick() {
    alert(`Hello ${this.username || 'Angular Dev'}!`);
  }
}


```

### Directive

Directives are classes that add behavior to elements. They let you manipulate the DOM, change appearance or modify structure

- **Component Directives** - have a template which act as custom elements
- **Structural Directives** - modify DOM layout. Prefixed with `*` like `*ngIf`, `*ngFor`
- **Attribute Directives** - change element appearance or behavior.

### Custom directives

Directives are classes that add behaviour or modify the DOM. Two types:

- **Attribute Directives** - change the appearance or behavior of an element
- **Structural Directives** - change the DOM structure by adding or removing elements

**Creating attribute directive**

```javascript

@Directive({
    selector: "[appHighlight]"
})

export class HighlightDirective{
    constructor(private el: ElementRef, private renderer: Renderer2){}

    @HostListener('mouseenter') onMouseEnter() {
        tihs.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'yellow');
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'transparent');
    }
}
```

**Usage**

```
<p>
<appHighlight> Highlight me! </appHighlight>
</p>
```

**Structural directive**

```javascript

@Directive({
    selector: '[appUnless]'
})

export class UnlessDirective{
    constructor(
        private templateRef: TemplateRef<any>,
        private vcRef: ViewContainerRef,
    ) {};

    @Input set appUnless(condition: boolean) {
        if(!condition) {
            this.vcRef.createEmbeddedView(this.templateRef);
        }
        else {
            this.vcRef.clear();
        }
    }
}
```

**Usage**

```js
<p *appUnless="isVisible">I am visible only when isVisible is false</p>
```

### Service

A service is a class decorated with `@Injectable()` that contains business logic and data operations which can be shared across the application (multiple components)

Key features:

- Singleton pattern - one instance shared app-wide
- Dependency injection - injected into components via constructor
- Separation of concerns - keeps business logic out of components

```js
@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(private htpp: HttpClient){}

  getData() {
    return this.http.get('/api/data');
  }
}


// Component
export class MyComponent {
  constructor(private dataService: DataService){};

  loadData() {
    this.dataService.getData().subscribe((data) => {console.log(data)})
  }
 }
```

### Dependency injection

A pattern where Angular automatically provides dependencies (like services) to components instead of components creating them manually.

**How it works**:

- Register services using `@Injectable()` and `providedIn`
- Inject dependencies via constructor parameters
- Angular's inject creates and manages instances

### Angular router

Enables navigation between different views / components in a single-page application

- Routes - map URLs to components
- Router outlet - placeholder for routed components
- Navigation - programmatic and declarative routing

```js
cosnt routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'about', component: AboutComponent}
]

// App html
<nav>
  <a routerLink = "/home">Home </a>
  <a routerLink = "/about">About </a>
</nav>

<router-outlet></router-outlet>

```

### Pipes

Transform data in templates without changing the original data. They are used for formatting display values.

Built-in pipes:

- DatePipe - format dates
- CurrencyPipe - format currency
- UpperCasePipe - convert to uppercase
- JsonPipe - display objects as JSON

```js
<p>{{ today | data: 'short' }}</p>
<p>{{ price | currency: 'USD' }}</p>
<p>{{ name | uppercase }}</p>
<p>{{ user | json}} </p>
```

Custom pipe

```js

@Pipe({name: 'reverse'})

export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    return value.split("").reverse().join("");
  }
}

// Usage

<p> {{'Angular' | reverse}} </p>

// Outputs: ralugnA
```

### Life cycle hooks

They are called at specific moments in a component's lifecycle

- `ngOnInit` - after component initializaation
- `ngOnDestroy` - before component destruction
- `ngOnChanges` - when input properties changes
- `ngAfterViewInit` - after view initialization

### Standalone components

Components that don't required `ngModules`. Components, directives and pipes are implicitly standalone by default since Angular 19+.

### @Input and @Output decorators

They enable communication between parent and child components

`@Input` - passes data from parent to child

```js
// Child
export class ChildComponent{
  @Input() userName: string = "";
}

// Parent
<app-child [username]="parentName"> </app-child>
```

`@output` - sends events from child to parent

```js
export class ChildComponent {
  @Output notify = new EventEmitter<string>();

  sendMessage() {
    this.notify.emit("Hello from child component");
  }
}

// Parent
<app-child (notify)="handleMessage($event)"></app-child>

export class Parent {
  handleMessage(message: string) {
    console.log(message);
  }
}
```

### Observables

An Observable is a reusable blueprint for creating a stream of data. Nothing happens until someone subscribes to it.

```js
// Observable — just a blueprint, nothing executes yet
const data$ = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

// Only when we subscribe does it run
data$.subscribe({
  next: (value) => console.log(value), // logs 1, 2
  complete: () => console.log("Done"),
});
```

| Type | How it works | Use case |
|------|-------------|----------|
| **Observable** | One-way: emits values, subscribers listen. Multiple subscribers get independent copies. | HTTP calls, timers, DOM events |
| **Subject** | Two-way: acts as both emitter and listener. Subscribers share the same stream. | Pub/sub within app, event buses |
| **BehaviorSubject** | Like Subject but remembers the latest value and gives it to new subscribers immediately. | Current user state, theme selection |

**Observable** - Read-only stream

```js
const data$ = new Observable(subscriber => {
  subscriber.next('value1');
  subscriber.next('value2');
});

// Subscriber 1 gets: value1, value2
data$.subscribe(v => console.log('Sub1:', v));

// Subscriber 2 ALSO gets: value1, value2 (independent stream)
data$.subscribe(v => console.log('Sub2:', v));
```

**Subject** - Emitter + Listener hybrid (hot stream)

```js
const clicks$ = new Subject<string>();

// Two subscribers
clicks$.subscribe(v => console.log('Sub1:', v));
clicks$.subscribe(v => console.log('Sub2:', v));

// When we emit, BOTH get it
clicks$.next('clicked'); // Both logs: 'clicked'
```

**BehaviorSubject** - Subject that remembers the last value

```js
const user$ = new BehaviorSubject<string>('Guest');

user$.subscribe(u => console.log('Sub1:', u)); // logs 'Guest' immediately

user$.next('Alice');

user$.subscribe(u => console.log('Sub2:', u)); // logs 'Alice' immediately (not 'Guest')
```

**Observable Combination Operators**:

**`combineLatest`** - Emits latest values from all observables whenever any changes

```js
searchResults$ = combineLatest([this.searchTerm$, this.category$]).pipe(
  switchMap(([term, cat]) => this.api.search(term, cat)),
);
```

**`withLatestFrom`** - Emits from primary observable with latest from secondaries (doesn't trigger on secondary changes)

```js
saveComment$ = this.saveButton$.pipe(
  withLatestFrom(this.userId$, this.commentText$),
  switchMap(([_, userId, text]) => this.api.save(userId, text)),
);
```

**`forkJoin`** - Waits for all observables to complete, then emits final values (like Promise.all)

```js
dashboardData$ = forkJoin({
  user: this.userService.getUser("123"),
  posts: this.postService.getPosts("123"),
});
```

### MVVM architecture pattern in Angular

Angular follows **Model-View-ViewModel (MVVM)** pattern where:

- **Model**: data and business logic (services, http calls)
- **View**: template (HTML)
- **ViewModel**: component class that binds data to view

```javascript
@Component({
    selector: "user-details",
    standalone: true,
    imports: [CommonModule],
    template: `<div>
        <h1>User Details</h1>
        <button (click)="getUserDetail('123')">Get User Details</button>
        <ng-container *ngIf="user$ | async as user">
            <ul>
                <li>Name: {{user.name}}</li>
                <li>Email: {{user.email}}</li>
            </ul>
        </ng-container>
    </div>` // View
})

// ViewModel
export class UserDetails {

    user$: Observable<{ name: string; email: string }> | null = null;

    constructor(private userService: UserService) {}

    getUserDetail(id: string) {
        this.user$ = this.userService.getUserDetails(id); // Model — async pipe handles subscribe/unsubscribe
    }

}

```

### Angular bootstrapping process

- `main.ts` calls `platformBrowserDynamic().boostrapModule(AppModule)`
- Angular creates the platform and application injector
- `AppModule` is instantiated and its providers are registered
- **Bootstrap component** (usually AppComponent) is created
- Component is **rendered** into DOM at the specified selector

**NgModule-based (classic)**

```javascript
// main.ts
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

// app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent], // tells Angular which component to render first
})
export class AppModule {}

// app.component.ts
@Component({
  selector: "app-root", // matches <app-root> in index.html
  template: `<h1>Hello Angular</h1>`,
})
export class AppComponent {}
```

**Standalone (modern, Angular v15+)**

```javascript
// main.ts
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
}).catch((err) => console.error(err));

// app.component.ts
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

No `AppModule` needed — providers are passed directly to `bootstrapApplication`.

### OnPush

The `OnPush` change detection strategy improves performance by limiting when Angular checks for changes. Instead of running on every event, it only triggers when:

- An input property changes (by reference)
- An event originates from the component or its children
- You manually mark it for check (`ChangeDetectorRef.markForCheck()`)

**How to use**

```javascript

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div>{{user.name}} </div>`
})
export class UserComponent {
    @Input user: User;

    constructor(private cdr: ChangeDetectorRef){}

    updateUser() {
        this.user = {...this.user, name: "New name"}; // Use immutable updates
        this.cdr.detectChanges(); // Manual trigger if needed
    }
}
```

**Tip**: Always pass new object references ({...obj} or arrays via spread) to trigger updates in OnPush components.

### LazyLoading Implementation

LazyLoading in Angular means that loading feature modules or components only when needed, rather than at app startup. It improves performance by reducing the initial bundle size and speeding up load times

**How to use**

Create a `users.module.ts`:

```javascript
// users/users.module.ts
@NgModule({
  declarations: [UsersListComponent, UserDetailComponent],
  imports: [CommonModule, RouterModule.forChild(userRoutes)],
})
export class UsersModule {}

// Internal routes inside user module
const userRoutes: Routes = [
  { path: '', component: UsersListComponent },
  { path: ':id', component: UserDetailComponent },
];
```

Register it in the app routes:

```javascript
// App routes
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
  },
];
```

**What it does**: This lazy loads an entire NgModule (and all the routes/components declared inside it).

**When to use it**: Use this if you are working with an older Angular application, or a project that heavily relies on traditional NgModules to organize features. When a user visits /users, Angular downloads the UsersModule bundle on demand.

**Modern way**

Create a standalone `users.component.ts`:

```javascript
// Component
@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Users</h1>`,
})
export class UsersComponent {}

// App routes
const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent), //  Loads the component directly!
  },
];
```

**What it does**: This lazy loads a single standalone component without requiring an NgModule wrapper. Angular downloads only that component's bundle when the route is visited.

**When to use it**: Use this in modern Angular (v14+) applications using standalone components. It is simpler and more tree-shakeable than module-based lazy loading since there is no NgModule overhead.

**Why does the NgModule approach have two route definitions?**

The NgModule version has two levels of routes because it lazy loads an entire module, which can contain multiple components with their own sub-routes:

- `userRoutes` — internal routes _inside_ the module (e.g. `/users` → list, `/users/:id` → detail)
- `routes` (app routes) — the top-level entry point that tells Angular where to find the module

The standalone `loadComponent` approach only needs one route entry because it loads a single component — there is no internal routing to configure.

If you need sub-routes in the modern approach, use `loadChildren` pointing to a routes array instead of a module:

```javascript
// users/users.routes.ts
export const userRoutes: Routes = [
  { path: '', component: UsersListComponent },
  { path: ':id', component: UserDetailComponent },
];

// App routes
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.userRoutes),
  },
];
```

**Rule of thumb**:

- Single component to load → `loadComponent`
- Multiple components with sub-routes → `loadChildren` (module or routes array)

### Difference between `providers` and `viewProviders`

Both `providers` and `viewProviders` define services that a component and its children can use but they differ in scope:

- `providers` - makes the service available to the component and all its children (including content children)
- `viewProviders` - limits the service available to the component's view only children (excludes content children)

```javascript
@Component({
  selector: "app-parent",
  template: `
    <app-internal-header></app-internal-header>

    <ng-content></ng-content>
  `, // app-internal-header is the view component and content children comes within ng-content
  providers: [LoggerService], // Available to projected children
  viewProviders: [AuthService], // Only for this component's view
})
export class ParentComponent {}

// Content children
<app-parent>
  <app-projected-child></app-projected-child>
</app-parent>;
```

### Ahead-of-time (AOT) compilation

Process of compiling Angular templates and Typescript code at build time, before application runs in the browser. Angular CLI uses AOT by default in production builds.

**How it works**

- Angular CLI compiles templates, metadata, and decorators into optimized JS during the build
- Browser pre-loads compiled code

**Benefits**

- Faster startup
- Smaller bundle size

### Signals vs RxJs Observables

Signals and Observables, both handle reactive data as well as data sharing but differ in scope and use case according to popular conventions. Strictly, either of them can do the job

**Signals**:

- For local reactive state
- Updates the UI automatically when the value changes
- Best for component-level state

**RxJs Observables**:

- Streams of data over time (async operations, events)
- Best for HTTP calls, events, async operations and shared state
- Best fit for operations like filtering, mapping, combining, etc

### Renderer2 and Direct DOM access discouragement

`Renderer2` is an Angular service that provides safe, platform-independent methods to manipulate the DOM without touching the browser APIs directly.

Advantages:

- Prevents XSS attacks by sanitizing changes
- Cross-platform compatibility (browser, server-side rendering, web workers)

Usage - Refer to `appHighlight` in [Directives](#custom-directives)

Direct DOM access is discouraged because it breaks Angular's platform abstraction and may fial in SSR or web worker contexts.

### Tree-Shakable providers and Bundle optimization

Tree-shakable providers are services defined with `providedIn: 'root'` or `providedIn: 'platform'` in the `@Injectable()` decorator. This allows unused services to be removed from the bundle during the build process, reducing the final bundle size.

```javascript
// user.service.ts — Tree-shakable service
@Injectable({
  providedIn: 'root', // Service is tree-shakable
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: string) {
    return this.http.get(`/api/users/${id}`);
  }
}

// Component — no need to add to providers array
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  template: `<div>{{ user$ | async }}</div>`,
})
export class UserComponent {
  user$ = inject(UserService).getUser('123'); // Service automatically injected
}
```

**Why use tree-shakable providers**:

- Services unused in the app are automatically removed from the bundle
- No manual provider registration needed
- Works seamlessly with standalone components
- Smaller final bundle size

### Dependency injection heirarchy and Token Resolution

Injectors are organized in a tree, and services are resolved top-down

**Heirarchy**:

- Root injector - singleton services (`providedIn: 'root'`)
- Module injector - services scoped to feature modules
- Component injector - services provided via `providers` or `viewProviders`

**Token Resolution** - Angular checks the component injector first, then moves up the tree to module injector and finally to root injectors. If the service is not found, an error is thrown.

s

```javascript
// Shared service at root level
@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(msg: string) {
    console.log(msg);
  }
}

// Component-level service (creates new instance per component)
@Injectable()
export class CounterService {
  count = 0;
  increment() {
    this.count++;
  }
}

// Parent component — provides its own CounterService
@Component({
  selector: 'app-parent',
  standalone: true,
  providers: [CounterService], // Creates instance for this component + children
  template: `
    <div>
      <button (click)="counter.increment()">Count: {{ counter.count }}</button>
      <app-child></app-child>
    </div>
  `,
})
export class ParentComponent {
  counter = inject(CounterService);
  logger = inject(LoggerService); // Gets root instance (singleton)
}

// Child component — shares parent's CounterService instance
@Component({
  selector: 'app-child',
  standalone: true,
  template: `<p>Child sees count: {{ counter.count }}</p>`,
})
export class ChildComponent {
  counter = inject(CounterService); // Same instance as parent
  logger = inject(LoggerService);   // Same root instance
}
```

**Resolution order**:

1. Child component asks for `CounterService` → finds it in parent's injector → uses parent's instance
2. Any component asks for `LoggerService` → goes to root injector → gets singleton

<!-- To Do: Add later ### Resolution modifiers

1. `@Optional()`

- Marks dependency as optional
- If this service is not found, Angular injects `null` instead of throwing an error

```js
constructor(@Optional() private logger?: LoggerService) {}

```

2. `@Self()` -->

### Testing Components that depend on `HttpClient` or `routing` modules

Use Angular's testing modules to mock HTTP requests and routes without real calls.

- HttpClient - `HttpTestingController` to mock requests and provide test data
- Routing - `RouterTestingController` to simulate navigation and test route-related logic

```js
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
});
```

```js
import { RouterTestingModule } from "@angular/router/testing";

TestBed.configureTestingModule({
  imports: [
    RouterTestingModule.withRoutes([{ path: "home", component: MyComponent }]),
  ],
});
```

### Pure vs Impure pipes

Pipes transform data in templates.

Pure pipes are default and run only when input reference changes. It has better performance

Impure pipes runs on every change detection cycle, regardless of input changes.

### `trackBy` in `*ngFor`

Like React's `key`, `trackBy` helps Angular identify which items changed, preventing unnecessary DOM re-rendering.

```js

@Component({
    template: `div *ngFor="let user of users; trackBy: trackByUserId">
        {{user.name}}
    </div>`
});

export class UserListComponent {
    users = [
        {id: 1, name: "John"},
        {id: 2, name: "Jane"},
    ];

    // Only re-render changed items instead of recreating all DOM elements
    trackByUserId(index: number, user: User): number {
        return user.id;
    }
}

```

### Signal Effects

Signal effects are reactive side effects that run automatically whenever a signal value changer - similar to `useEffect` in React. They let you respond to state changes outside the template.

### `ngZone` and `runOutsideAngular()`

`NgZone` is an Angular service that controls whether code runs inside or outisde Angular's change detection zone. Using `runOutsideAngular()` improves performance by preventing unnecessary change detection cycles for frequent operations.

**When to use**: High-frequency events (mouse move, scroll, window resize) that don't need to update UI immediately.

```js
@Component({
    selector: 'app-performance',
    standalone: true,
    template:
    `<div (mousemove)="onMouseMove($event)">
        Move mouse here - updates every {{updateCount}} times
    </div>
    <p> Final position: {{finalX}} </p>
    `,
});

export class PerformanceComponent implements OnDestroy {
    updateCount = 0;
    finalX = 0;

    constructor(private ngZone: NgZone) {}

    onMouseMove(event: MouseEvent) {
        // Run outside Angular's change detection
        this.ngZone.runOutsideAngular(() => {
            this.updateCount++;
            console.log(`Mousemove #${this.updateCount}`); // Logs without triggering change detection
        })

        if(this.updateCount % 100 == 0) {
        this.ngZone.run(() => {
            this.finalX = event.clientX;
        })
        }
    }

    ngOnDestroy() {
        // Clean up if needed
    }
}

```

### Migrating from RxJs to Signals

- Identify all RxJs streams (`BehaviorSubject`, `Subject`, `Observable`) in components and services
- Determine which streams are local state and async operations (Http, WebSocket)
- **Local component state** - convert local state to signals (along with any effect)
- **Service-level state** - use signal store or continue with RxJs service
- For derived or computed values, leverage computed signals
- Replace `subsctiptions` with **effects** or **computed signals**
- Test thoroughly

## References

- [GreatFrontEnd Angular Js Beginner](https://www.greatfrontend.com/blog/angular-basic-interview-questions)
- [GreatFrontEnd Angular Js Advanced](https://www.greatfrontend.com/blog/angular-experienced-interview-questions)
- [Mosoic](https://gist.github.com/mosioc/57579cb7a980f57defa5c2823fc661c9)
