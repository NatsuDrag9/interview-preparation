# JavaScript Interview Questions & Answers

> Based on the [roadmap.sh/javascript](https://roadmap.sh/javascript) curriculum

---

## Missed out

rest vs spread operator

## 🎯 Section 1: Trivia / Quiz Questions

---

### Q1 — `var`, `let`, and `const`: Hoisting, Scope & Reassignability

**Question:**
What is the difference between `var`, `let`, and `const` in terms of hoisting, scope, and reassignability? Name the specific scope each belongs to.

**Answer:**

| Feature      | `var`                                | `let`                                                | `const`                                              |
| ------------ | ------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| Scope        | Function scope                       | Block scope                                          | Block scope                                          |
| Hoisting     | Hoisted & initialized as `undefined` | Hoisted but **not** initialized (Temporal Dead Zone) | Hoisted but **not** initialized (Temporal Dead Zone) |
| Reassignable | ✅ Yes                               | ✅ Yes                                               | ❌ No                                                |
| Redeclarable | ✅ Yes                               | ❌ No                                                | ❌ No                                                |

**Key points:**

- `var` is hoisted to the top of its function and initialized to `undefined`, so you can reference it before the declaration without a `ReferenceError` (you'll just get `undefined`).
- `let` and `const` are also technically hoisted, but they sit in the **Temporal Dead Zone (TDZ)** — accessing them before declaration throws a `ReferenceError`.
- `const` requires an initializer at declaration and its **binding** cannot be reassigned, but the value it points to (e.g., an object or array) can still be mutated.

Can you give an example?

```javascript
console.log(a); // undefined (hoisted)
var a = 1;

console.log(b); // ReferenceError (TDZ)
let b = 2;
```

---

### Q2 — `==`, `===`, and `Object.is()`

**Question:**
What are the differences between `==`, `===`, and `Object.is()`? Give one example where `===` and `Object.is()` produce different results.

**Answer:**

| Operator      | Name               | Coercion                       | Special Cases                                                   |
| ------------- | ------------------ | ------------------------------ | --------------------------------------------------------------- |
| `==`          | Loose equality     | ✅ Yes — type coercion applied | `null == undefined` is `true`                                   |
| `===`         | Strict equality    | ❌ No                          | `NaN === NaN` is `false`; `+0 === -0` is `true`                 |
| `Object.is()` | SameValue equality | ❌ No                          | `Object.is(NaN, NaN)` is `true`; `Object.is(+0, -0)` is `false` |

**The two cases where `===` and `Object.is()` differ:**

```javascript
// Case 1: NaN
NaN === NaN; // false
Object.is(NaN, NaN); // true ✅

// Case 2: Signed zero
+0 === -0; // true
Object.is(+0, -0); // false ✅
```

**When to use which:**

- `===` for everyday comparisons
- `Object.is()` when you need to distinguish `+0` from `-0` or safely check for `NaN` (alternative: `Number.isNaN()`)

---

### Q3 — The 7 Primitive Types + Type Coercion vs. Explicit Casting

**Question:**
JavaScript has 7 primitive types. Name them all. Then explain the difference between _type coercion_ and _explicit type casting_ with a code example of each.

**Answer:**

**The 7 Primitive Types:**

1. `string`
2. `number`
3. `bigint`
4. `boolean`
5. `undefined`
6. `null`
7. `symbol`

> Everything else (arrays, functions, objects) is of type `object`.

**Type Coercion (Implicit):**
JavaScript automatically converts types behind the scenes when operators or contexts require it.

```javascript
// Implicit coercion — JS converts number 5 to string "5"
console.log("5" + 5); // "55"  (number coerced to string)
console.log("5" - 2); // 3     (string coerced to number)
console.log(true + 1); // 2     (boolean coerced to number)
console.log(null + 1); // 1     (null coerces to 0)
```

**Explicit Type Casting:**
The developer intentionally converts a value using built-in functions or operators.

```javascript
// Explicit casting
Number("42"); // 42
String(100); // "100"
Boolean(0); // false
parseInt("3.9"); // 3
parseFloat("3.9"); // 3.9
!!null; // false (double-negation trick)
```

---

### Q4 — CommonJS vs. ES Modules

**Question:**
What are the key differences between CommonJS (`require`) and ES Modules (`import/export`)? Name two behavioral differences that affect how you write code.

**Answer:**

| Feature             | CommonJS (CJS)                 | ES Modules (ESM)                             |
| ------------------- | ------------------------------ | -------------------------------------------- |
| Syntax              | `require()` / `module.exports` | `import` / `export`                          |
| Loading             | **Synchronous**                | **Asynchronous**                             |
| Execution           | At runtime                     | Statically analyzed at parse time            |
| Default in          | Node.js (legacy)               | Browsers, modern Node.js                     |
| File extension      | `.js` / `.cjs`                 | `.mjs` or `"type": "module"` in package.json |
| `this` at top level | `module.exports` object        | `undefined`                                  |

**Two key behavioral differences:**

1. **Static vs. Dynamic imports**: ESM `import` statements are hoisted and resolved before any code runs — you can't use them inside `if` blocks. CJS `require()` is a function call and can appear anywhere, including inside conditionals.

```javascript
// CJS — dynamic, works at runtime
if (condition) {
  const mod = require("./module");
}

// ESM — static, must be top-level
// import mod from './module'; // ✅ top-level only
// Dynamic ESM import (async):
if (condition) {
  const mod = await import("./module"); // ✅ dynamic import()
}
```

2. **Live bindings vs. copied values**: ESM exports are **live bindings** — if the exporting module changes a value, the importing module sees the updated value. CJS exports are **copies** at the time of `require()`.

---

## 💻 Section 2: Output-Based Questions

---

### Q5 — Closures, `var`, and the Event Loop

**Question:**
What is the output of this code and why?

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

Then fix it to log `0`, `1`, `2`.

**Answer:**

**Output:** `3 3 3`

**Why?** Because `var` is **function-scoped** (not block-scoped), all three setTimeout callbacks share the **same `i` variable**. By the time the event loop runs the callbacks (after the synchronous loop finishes), `i` has already been incremented to `3`.

**Fix 1 — Use `let` (block-scoped, creates a new binding per iteration):**

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Output: 0, 1, 2
```

**Fix 2 — Use an IIFE to capture `i` by value:**

```javascript
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// Output: 0, 1, 2
```

**Fix 3 — Pass `i` as an extra argument to setTimeout:**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout((j) => console.log(j), 0, i);
}
// Output: 0, 1, 2
```

---

### Q6 — `this` in Regular Functions vs. Arrow Functions

**Question:**
What does this code log?

```javascript
const obj = {
  name: "roadmap",
  regular: function () {
    console.log(this.name);
  },
  arrow: () => {
    console.log(this.name);
  },
};

obj.regular();
obj.arrow();
```

**Answer:**

```
"roadmap"
undefined
```

**Why?**

- `obj.regular()` — A regular function's `this` is determined at **call time**. When called as a method (`obj.regular()`), `this` refers to `obj`, so `this.name` is `"roadmap"`.

- `obj.arrow()` — Arrow functions **do not have their own `this`**. They inherit `this` from their **lexical (surrounding) scope** at the time they are defined. The arrow function is defined in the object literal, which is at the top level (or inside a module). In non-strict mode in a browser, the global `this` is `window`, and `window.name` is `""` or `undefined`. In strict mode or Node.js, `this` is `undefined`, making `this.name` throw or return `undefined`.

**Key takeaway:** Never use arrow functions as object methods when you need `this` to refer to the object.

---

### Q7 — Event Loop: Microtasks vs. Macrotasks

**Question:**
What is the output order of the following?

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

**Answer:**

```
1
4
3
2
```

**Why (Event Loop execution order):**

1. **`console.log("1")`** — Synchronous, runs immediately. → `1`
2. **`setTimeout(..., 0)`** — Schedules a **macrotask** (task queue). Does not run yet.
3. **`Promise.resolve().then(...)`** — Schedules a **microtask** (microtask queue). Does not run yet.
4. **`console.log("4")`** — Synchronous, runs immediately. → `4`
5. **Call stack is now empty.** The event loop processes the **microtask queue first** (before any macrotask). → `3`
6. **Microtask queue is empty.** The event loop picks the next macrotask (setTimeout callback). → `2`

**Rule to remember:** Microtasks (Promises, `queueMicrotask`) always run **before** the next macrotask (setTimeout, setInterval, I/O).

---

## 🔬 Section 3: Deep JS Knowledge Questions

---

### Q8 — Prototypal Inheritance & the Prototype Chain

**Question:**
Explain how prototypal inheritance works in JavaScript. How does it differ from classical inheritance? What does `Object.create()` do, and how is the `class` keyword implemented under the hood?

**Answer:**

**Prototypal Inheritance:**
Every JavaScript object has an internal `[[Prototype]]` property (accessible via `__proto__` or `Object.getPrototypeOf()`). When you access a property on an object, JS first looks at the object itself, then walks up the prototype chain until it finds the property or reaches `null`.

```javascript
const animal = {
  speak() {
    return `${this.name} makes a sound.`;
  },
};

const dog = Object.create(animal); // dog's [[Prototype]] = animal
dog.name = "Rex";

console.log(dog.speak()); // "Rex makes a sound." — found on prototype
console.log(Object.getPrototypeOf(dog) === animal); // true
```

**`Object.create(proto)`** creates a new object with its `[[Prototype]]` set to `proto`. This is pure prototypal inheritance — no constructor function involved.

**Classical vs. Prototypal Inheritance:**

| Classical (Java, C++)                                   | Prototypal (JavaScript)                          |
| ------------------------------------------------------- | ------------------------------------------------ |
| Classes are blueprints; objects are instances           | Objects inherit directly from other objects      |
| Inheritance is defined at class definition time         | Inheritance chain is dynamic and can be modified |
| `new ClassName()` creates a new copy based on the class | `Object.create()` links to an existing object    |

**`class` is syntactic sugar:**
The ES6 `class` keyword does NOT introduce classical inheritance. Under the hood, it still uses prototypal inheritance with constructor functions.

```javascript
// ES6 class syntax
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} speaks.`;
  }
}

// Is equivalent to:
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} speaks.`;
};
```

`class` is cleaner syntax for the same prototype-based mechanism.

---

### Q9 — Memory Management, Closures & Memory Leaks

**Question:**
Explain the JavaScript memory lifecycle. What is a memory leak, and how can closures cause one? Describe a real-world scenario and how you'd detect it using Browser DevTools.

**Answer:**

**The Memory Lifecycle:**

1. **Allocate** — Memory is allocated when variables, objects, or functions are created.
2. **Use** — The allocated memory is read/written during execution.
3. **Release** — The garbage collector (GC) reclaims memory no longer reachable.

JavaScript uses **mark-and-sweep** garbage collection: the GC marks all objects reachable from "roots" (global scope, call stack) and sweeps (frees) anything not reachable.

**What is a Memory Leak?**
A memory leak occurs when memory that is no longer needed is **never released** because the GC still considers it reachable — usually due to unintentional references being kept alive.

**How Closures Can Cause Memory Leaks:**
Closures keep a reference to their outer scope. If a closure outlives its expected lifetime and holds onto large objects, those objects can't be garbage collected.

```javascript
// Memory leak example
function createLeak() {
  const largeArray = new Array(1_000_000).fill("data"); // Large allocation

  return function () {
    // This closure captures largeArray in its scope
    // Even if we never use largeArray, it stays in memory
    // as long as the returned function is referenced
    console.log("I still hold largeArray in my closure!");
  };
}

const leakyFn = createLeak(); // largeArray is NEVER freed as long as leakyFn exists
```

**Real-World Scenario — Event Listeners:**

```javascript
function setup() {
  const hugeData = fetchSomeHugeData();

  document.getElementById("btn").addEventListener("click", () => {
    // hugeData is captured in the closure
    process(hugeData);
  });
  // If the button is removed from DOM but the listener isn't cleaned up,
  // hugeData stays in memory forever.
}

// Fix: remove the listener when done
button.removeEventListener("click", handler);
```

**Detecting with Chrome DevTools:**

1. Open DevTools → **Memory** tab
2. Take a **Heap Snapshot** before the suspected leak
3. Perform the actions that may cause the leak
4. Take another **Heap Snapshot**
5. Use **"Comparison"** view to see objects that grew in count/size
6. Look for detached DOM nodes or growing closure scopes
7. Use the **Performance** tab → record → look for a **sawtooth memory pattern** that never fully drops (memory never freed = leak)

---

### Q10 — Iterators, Generators & Async Flow Control

**Question:**
What is the iterator protocol in JavaScript? How do generators differ from regular functions, and how can a generator implement async flow control _without_ `async/await`? Write a brief code sketch.

**Answer:**

**The Iterator Protocol:**
An object is an _iterator_ if it has a `next()` method that returns `{ value, done }`:

- `value` — the current value
- `done` — `true` when the sequence is exhausted

An object is _iterable_ if it has a `[Symbol.iterator]()` method that returns an iterator. Built-ins like arrays, strings, Maps, and Sets are iterable.

```javascript
// Custom iterator
const range = {
  [Symbol.iterator]() {
    let i = 1;
    return {
      next() {
        return i <= 3
          ? { value: i++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

for (const n of range) console.log(n); // 1, 2, 3
```

**Generators:**
A generator function (marked with `function*`) returns a **Generator object** which is both an iterator and iterable. It uses `yield` to pause execution and return a value, then resumes from where it left off on the next `.next()` call.

```javascript
function* counter() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = counter();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

**Async Flow Control Without `async/await`:**
Before `async/await` existed, generators + a runner function could replicate the same pattern. `yield` pauses for a Promise to resolve, and the runner calls `.next(resolvedValue)` to resume:

```javascript
function run(generatorFn) {
  const gen = generatorFn();

  function handle(result) {
    if (result.done) return;
    // The yielded value is a Promise
    result.value.then((res) => handle(gen.next(res)));
  }

  handle(gen.next());
}

function* fetchUser() {
  const user = yield fetch("https://api.example.com/user/1").then((r) =>
    r.json(),
  );
  console.log(user.name); // runs after fetch resolves

  const posts = yield fetch(
    `https://api.example.com/posts?userId=${user.id}`,
  ).then((r) => r.json());
  console.log(posts);
}

run(fetchUser);
// This is exactly what async/await desugars to internally!
```

**Key difference from `async/await`:** `async/await` is built-in syntactic sugar — under the hood, it compiles to a state machine very similar to this generator pattern. Generators give you manual control over the same mechanism.

---

## 📊 Topic Coverage Summary

| Roadmap Topic                                      | Covered In |
| -------------------------------------------------- | ---------- |
| Variable Declarations, Hoisting, Scopes            | Q1, Q5     |
| Data Types, Primitive Types                        | Q3         |
| Type Casting vs. Coercion                          | Q3         |
| Equality Comparisons & Algorithms                  | Q2         |
| Functions, Closures, Lexical Scoping               | Q5, Q6, Q9 |
| `this` keyword & Arrow Functions                   | Q6         |
| Asynchronous JS — Event Loop, Promises, setTimeout | Q7, Q10    |
| Prototypal Inheritance, Object Prototype, Classes  | Q8         |
| Modules — CommonJS vs ESM                          | Q4         |
| Memory Management, Garbage Collection              | Q9         |
| Iterators and Generators                           | Q10        |
| Debugging & Browser DevTools                       | Q9         |
| IIFEs                                              | Q5 (fix)   |
| Callback Hell (historical context)                 | Q10        |
