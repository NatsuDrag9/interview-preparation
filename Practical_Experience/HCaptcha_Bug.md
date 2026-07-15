# The Captcha Bug, Traced

**Bug trace · hCaptcha invisible mode**

## Why the first click never registered a user

The `verify` call fired every time. The `register` call fired one click late.
Here's the exact sequence that caused it, and the one-line habit that fixed it.

### Before vs After

| Before | After |
|---|---|
| Click 1 → verify only, no register | Every click → verify, **then** register, in that order |
| Click 2 → registers click 1's data | Uses `await captchaRef.execute({ async: true })` directly |

## 1. What the network tab showed

- **1st click:** `api.hcaptcha.com` fires → `200 OK`. Then nothing — no `register` call.
- **2nd click:** `api.hcaptcha.com` fires again → `200 OK`, immediately followed by `register` → `201 Created`.
- **Every click after that:** verify and register fire together, in order, no delay — looked "fixed" on its own, which is what made it confusing.

So the registration that succeeded on the second click was actually carrying the **first click's** form data — the flow was silently one interaction behind the user.

## 2. What the code was actually doing

**Click 1 — data gets dropped**
- `t=0`: `handleSubmit(formA)` runs
- `t=0`: `setPendingFormData(formA)` — queued, not applied yet (React state update is async)
- `t=0`: `captchaRef.execute()` fires, doesn't wait for anything
- `t=340`: hCaptcha resolves, calls `onVerify`
- `t=340`: `onVerify` is still closed over `pendingFormData = null` → bails out

**Click 2 — click 1's data ships**
- `t=0`: `handleSubmit(formB)` runs
- `t=0`: `setPendingFormData(formB)` queued — but state still holds `formA` from before
- `t=0`: `captchaRef.execute()` fires again
- `t=310`: `onVerify` fires, this time sees `pendingFormData = formA`
- `t=310`: `register` fires — with **click 1's** data, one click late

## 3. Root cause: stale closure over async state

`handleSubmit` stored the form values in React state (`pendingFormData`) and fired the captcha, expecting `onVerify` to read fresh state whenever it eventually resolved. But `onVerify` was registered as a prop on `<HCaptcha>` at render time — it closes over whatever `pendingFormData` was *at that render*, not whatever it becomes later.

Because `setPendingFormData` and `captchaRef.execute()` both fired synchronously in the same tick, the verify response usually landed before React re-rendered with the new state — so the callback always saw state one step behind the click that triggered it.

## 4. The fix

Applied to `FormOne`, `FormTwo`, `FormThree` — stop routing the token through state and a callback prop; await it directly where the form data already lives.

```diff
- setPendingFormData(formData);
- captchaRef.current?.execute();
- // ...separately, in a stale onVerify closure:
- const token = captchaResponse; // from stale pendingFormData
+ const { response: token } = await captchaRef.current.execute({ async: true });
+ // formData is still the live argument passed into this call — no state hop
+ await submit({ ...formData, 'h-captcha-response': token });
```

Dropped the `pendingFormData` state and the `onVerify` prop entirely, across `FormOne.tsx`, `FormTwo.tsx`, `FormThree.tsx`.

## STAR summary (for interview use)

**Situation:** A signup flow using hCaptcha in invisible mode across three separate forms. Users would click "Submit" and nothing would visibly happen — no error, no success — and only succeeded (with the previous form's data) on a second click.

**Task:** Figure out why the first submission never registered a user, and why it "self-corrected" on the second attempt, without any errors being thrown.

**Action:**
- Traced the network tab click-by-click instead of trusting logs: click 1 fired the captcha verify call but no `register` call; click 2 fired verify again and *then* `register` succeeded — but with click 1's data.
- Root-caused it to a stale closure: form data was stashed in React state (`pendingFormData`) before calling `captchaRef.execute()`, and the `onVerify` callback prop closed over that state at render time. Since the state setter and the `execute()` call both ran synchronously in the same tick, the async verify response resolved before the re-render — so `onVerify` always read state that was one click behind.
- Fixed it by eliminating the state hop entirely: switched to `await captchaRef.current.execute({ async: true })` called directly inside `handleSubmit`, so the token resolves in the same closure that already has the current `formData` as a live argument — no shared state, no stale callback.
- Applied the same pattern across all three forms that used the same captcha integration.

**Result:** Every click now verifies and registers in the same interaction, first try. Eliminated the "submit twice" bug and the misleading appearance of it "just working" on retry.

## Key takeaway

A bug that "goes away on retry" is often state lagging one step behind the UI, not a random flake — trace it interaction-by-interaction in the network tab. When bridging a callback-based async API (like `onVerify`) with React state, watch for stale closures: prefer awaiting a promise-based version of the API (`execute({ async: true })`) directly inside the handler that already has the current data, rather than routing that data through state for a separately-registered callback to pick up later.
