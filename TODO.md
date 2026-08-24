# Project TODO Audit

Audit date: 2026-08-23

This register covers first-party application code, build configuration, and deployment configuration. Generated dependencies (`node_modules`), runtime uploads, binary assets, and generated lockfile contents were not reviewed as application code. The lockfile lint configuration is included because it currently breaks the project's quality gate.

Priorities:

- **P1 — High:** incorrect user-visible behavior, security exposure, or failure handling that can misreport success.
- **P2 — Medium:** reliability, architecture, accessibility, and maintainability defects with meaningful operational impact.
- **P3 — Low:** latent defects, dead code, incomplete quality tooling, and cleanup work.

## P1 — High priority

- [x] **Remove the hard-coded backend endpoint from the image.** `Dockerfile` compiles every deployment against a fixed HTTP IP address. Vite values must be required build inputs, with matching `build.args` in `docker-compose.yml`; runtime container variables cannot reconfigure an already-built SPA. (`Dockerfile`, `docker-compose.yml`)
- [x] **Stop injecting all `.env` values into the frontend container.** The static Nginx service receives backend/CMS secrets it does not need. (`docker-compose.yml`)
- [x] **Invalidate Pinia authentication state on backend 401 responses.** The interceptor redirects without clearing the stale user, while the anonymous-only route guard redirects that user away from login again. (`src/api.ts`, `src/stores/authStore.ts`, `src/router/index.ts`)
- [x] **Make the data response adapter status-aware and schema-aware.** `responseToResult` treats many 4xx/5xx or malformed payloads as successful data because Axios resolves all HTTP statuses. (`src/data/index.ts`)
- [x] **Guarantee the documented `Result` contract for transport failures.** Most data functions still throw on timeout, CORS, and network failures, forcing callers to handle both `Result.Err` and exceptions. (`src/data/index.ts`)
- [x] **Check mutation response statuses.** Logout, disconnect, and device-command calls can report success for resolved 4xx/5xx responses. Callers must explicitly handle returned `Result` failures. (`src/data/auth.ts`, `src/data/index.ts`, `src/stores/authStore.ts`, `src/pages/sensors/SensorHeader.vue`)
- [x] **Fix online-state calculation.** `isOnline` currently returns true for stale timestamps and ignores the boolean record value, reversing status across the dashboard and sensor pages. Preserve an unknown/error state instead of mapping request failures to offline. (`src/utils/utils.ts`)
- [x] **Render the filtered dashboard collection.** Search and status filters currently affect only empty-state checks; cards still iterate over the unfiltered sensor list. (`src/pages/DashboardPage.vue`)
- [x] **Stop profile mutations from reporting failed HTTP responses as success.** Email/password changes bypass the data layer, do not inspect resolved statuses, and mutate UI state on 4xx/5xx responses. (`src/pages/ProfilePage.vue`)
- [x] **Handle account `Result` values.** Email-confirmation start and confirmation pages ignore `Result.Err` and display success/redirect after ordinary HTTP failures. (`src/pages/ProfilePage.vue`, `src/pages/auth/ConfirmEmailPage.vue`)
- [x] **Correct sensor-settings save control flow.** Unchanged and successful saves leave `saving` active; failed saves apply rejected state as though they succeeded. Use `try/finally`, update state only on `Ok`, and expose errors. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Make initial sensor loading failure-safe.** Transport failures can leave the details page on an infinite spinner with no retryable error. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Connect period selection to parent state.** `SensorTemperatureTab` emits a period update that the parent never handles, so the chart remains fixed at 24 hours. (`src/pages/sensors/SensorDetailsPage.vue`)

## P2 — Medium priority

### Deployment and quality gates

- [x] **Upgrade and pin service images.** PostgreSQL 13 is EOL, `postgis:13-master` and `directus:latest` are mutable, and `redis:6` is broadly pinned. Plan migrations and use tested immutable versions or digests. (`docker-compose.yml`)
- [x] **Replace predictable database credentials with a required secret.** The committed `directus` password is shared between PostgreSQL and Directus. (`docker-compose.yml`)
- [x] **Fail fast for missing deployment variables.** Use required Compose interpolation for secrets, admin credentials, and public URLs rather than silently substituting empty strings. (`docker-compose.yml`)
- [x] **Declare required Vite environment variables.** Add typed `VITE_API_URL` and `VITE_CMS_URL` declarations, then ensure the CMS variable is actually consumed. (`env.d.ts`)
- [x] **Make ESLint a reliable quality gate.** Exclude generated lockfiles from JSON content rules and enable the Vue essential/recommended rules rather than only the parser/base preset. (`eslint.config.ts`)
- [x] **Add automated tests.** Introduce Vitest and a test TypeScript configuration. Prioritize response conversion, auth guards/session expiry, route builders, online-state freshness, time formatting, and critical form flows. (`package.json`, `tsconfig.app.json`)

### Routing and authentication

- [x] **Select layouts through typed route metadata.** `App.vue` hard-codes the `/auth` prefix instead of declaring layout intent in the route table. (`src/App.vue`, `src/router/index.ts`)
- [x] **Reconcile route constants, builders, and registered routes.** Remove or restore disabled registration and unregistered sensor-list routes; make the confirmation builder generate the query token the page expects. (`src/constants/routes.ts`, `src/router/index.ts`)
- [x] **Use route constants everywhere.** Confirmation/profile navigation, the application logo, the cookie policy link, and landing navigation contain hard-coded or nonexistent routes. (`src/pages/auth/ConfirmEmailPage.vue`, `src/components/layout/ApplicationLayout.vue`, `src/components/CookieBanner.vue`, `src/components/layout/LandingLayout.vue`)
- [x] **Validate and encode email-confirmation tokens.** Accept exactly one non-empty query value and encode it before inserting it into a URL path. (`src/pages/auth/ConfirmEmailPage.vue`, `src/data/index.ts`)
- [x] **Clean up delayed confirmation redirects.** Store the timer and clear it on unmount to prevent navigation after the user leaves the page. (`src/pages/auth/ConfirmEmailPage.vue`)
- [x] **Make login submission robust.** Validate required/email fields, prevent concurrent requests, expose busy state, and verify `/me` established authentication before navigating. (`src/pages/auth/LoginPage.vue`, `src/stores/authStore.ts`)
- [x] **Make logout semantics explicit.** Match server logout results and decide whether failures should retry, preserve the local session, or force local logout with a warning. (`src/stores/authStore.ts`, `src/data/auth.ts`)

### Dashboard and device cards

- [x] **Expose dashboard load failures.** Device-list failures are converted into an empty list, while state failures are converted into offline devices. Add visible error/unknown states and retry behavior. (`src/pages/DashboardPage.vue`)
- [x] **Validate persisted dashboard data.** Schema-check ping history and settings loaded from `localStorage`; clamp refresh intervals to a finite safe range. Also handle unavailable Web Storage. (`src/pages/DashboardPage.vue`)
- [x] **Centralize device polling.** The dashboard and every `DeviceCard` independently refetch overlapping data, creating roughly `1 + 4N` requests per cycle and inconsistent snapshots. (`src/pages/DashboardPage.vue`, `src/components/DeviceCard.vue`)
- [x] **Make card refresh non-reentrant and failure-safe.** Always clear initial loading, do not replace working data with a skeleton during background refresh, and ignore/cancel stale responses. (`src/components/DeviceCard.vue`)
- [x] **Represent card state explicitly.** Distinguish online, offline, unknown, and request-error instead of labeling missing state as offline. (`src/components/DeviceCard.vue`)
- [x] **Label dashboard controls.** Search and status filters need programmatic accessible names. (`src/pages/DashboardPage.vue`)

### Account and connection forms

- [x] **Move profile mutations into the data layer.** Normalize and validate email, validate password policy, return typed `Result` values, and avoid direct backend Axios calls in components. (`src/pages/ProfilePage.vue`, `src/data/index.ts`)
- [x] **Fix profile error narrowing.** Network errors may have no `response` or `data`; current catch handlers can throw while handling the original failure. (`src/pages/ProfilePage.vue`)
- [x] **Preserve current-user load errors.** Do not unwrap them to `null` before the page can render a visible retryable error. (`src/pages/ProfilePage.vue`)
- [x] **Improve account form accessibility.** Associate labels/IDs, announce status messages, and use appropriate autocomplete values. (`src/pages/ProfilePage.vue`)
- [x] **Validate device identifiers.** The connection form advertises UUID input but checks only that it is non-empty. (`src/pages/ConnectDevicePage.vue`)
- [x] **Make connection submission transport-safe.** Catch rejected requests and reset submitting in `finally`. (`src/pages/ConnectDevicePage.vue`)
- [x] **Expose connection validation/status accessibly.** Add `aria-invalid`, `aria-describedby`, and live status semantics. (`src/pages/ConnectDevicePage.vue`)
- [x] **Improve login accessibility.** Associate labels with IDs, label the password-visibility toggle, expose pressed state, and announce errors. (`src/pages/auth/LoginPage.vue`)

### Sensor details and telemetry

- [x] **Respond to route-ID changes.** Validate the sensor ID and reload/reset polling and state when Vue Router reuses the component for another sensor. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Prevent telemetry races.** Manual and interval refreshes can overlap; serialize, cancel, or generation-check requests and schedule polling after completion. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Expose telemetry `Result.Err` values.** Current errors are logged and converted to `null` while stale readings remain visible without warning. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Make connection checks stateful and failure-safe.** Activate `statusLoading`, block duplicate checks, and mark status stale/unknown on failure. (`src/pages/sensors/SensorDetailsPage.vue`)
- [x] **Align sensor editor state and events.** Initialize the editable name from loaded data, handle `cancel`, and remove or implement the unused `update` event. (`src/pages/sensors/SensorDetailsPage.vue`, `src/pages/sensors/SensorInfoTab.vue`)
- [x] **Align `SensorSettings` with persisted API data.** Thresholds, phone, SMS frequency, defrost time, and tags are hard-coded or never saved. Either implement persistence or reduce the model. (`src/pages/sensors/SensorDetailsPage.vue`, `src/pages/sensors/SensorInfoTab.vue`)
- [x] **Make command submission status-aware.** Return a `Result` from `sendDeviceCommand`, show errors, and close the modal only after `Ok`. (`src/data/index.ts`, `src/pages/sensors/SensorHeader.vue`)
- [x] **Fix command-dialog interaction and accessibility.** Put backdrop click handling on the backdrop; add dialog semantics, focus management, Escape handling, associated labels, and announced errors. (`src/pages/sensors/SensorHeader.vue`)
- [x] **Use the filtered chart data for empty state.** A selected period with no matching samples currently renders an empty chart branch. (`src/pages/sensors/SensorTemperatureTab.vue`)
- [x] **Represent time correctly on the chart.** X coordinates and hit testing use array indexes, making irregular samples look evenly spaced. (`src/components/TemperatureChart.vue`)
- [x] **Provide an accessible telemetry alternative.** Canvas-only history is unavailable to keyboard and screen-reader users; add a chart label and readable summary/table. (`src/components/TemperatureChart.vue`)
- [x] **Clean up the chart observer.** Disconnect `ResizeObserver` on unmount. (`src/components/TemperatureChart.vue`)
- [x] **Implement accessible tab semantics.** Sensor tabs need `tablist`/`tab`, selected state, panel relationships, and keyboard navigation; period buttons need a group label and `aria-pressed`. (`src/pages/sensors/SensorTabs.vue`, `src/components/PeriodTabs.vue`)

### Landing page and CMS

- [x] **Configure the CMS client from environment.** Remove the hard-coded production host, validate `VITE_CMS_URL`, and set a finite timeout. (`src/composables/api_cms.ts`)
- [x] **Make lead composable state truthful.** Its exported loading/error refs are never changed and failures collapse to `false`; return actionable error state. (`src/composables/useLeads.ts`)
- [x] **Render lead failures.** `formStatus = "error"` has no corresponding UI. Add a retryable message. (`src/pages/LandingPage.vue`)
- [x] **Prevent duplicate lead submissions.** Disable submission during the success/reset window and track/clear the reset timer. (`src/pages/LandingPage.vue`)
- [x] **Render roadmap loading, failure, empty, and retry states.** The page currently discards the composable's loading/error refs. (`src/pages/LandingPage.vue`, `src/composables/useRoadmap.ts`)
- [x] **Improve lead-form accessibility.** Associate field errors, mark required/invalid fields, and announce success/failure. (`src/pages/LandingPage.vue`)
- [x] **Replace broken landing navigation placeholders.** Duplicate `/#` values create duplicate Vue keys and do not navigate to advertised content. (`src/components/layout/LandingLayout.vue`)
- [x] **Make the mobile menu an accessible disclosure.** Add expanded/control relationships and distinct labels. (`src/components/layout/LandingLayout.vue`)
- [x] **Add a main landmark to the landing layout.** (`src/components/layout/LandingLayout.vue`)

### Shared components

- [x] **Fix attribute fallthrough in wrapped controls.** `ShipTextbox` and `ShipSelect` manually bind `$attrs` while Vue also applies them to the root wrapper, duplicating IDs and bubbling listeners. (`src/components/ShipTextbox.vue`, `src/components/ShipSelect.vue`)
- [x] **Consolidate input abstractions.** `ShipInput` and `ShipTextbox` duplicate behavior and use an untyped model. Keep one typed component API. (`src/components/ShipInput.vue`, `src/components/ShipTextbox.vue`)
- [x] **Give shared buttons a safe default type.** `ShipButton` currently defaults to native `submit` inside forms. Default to `button` while allowing explicit submit usage. (`src/components/ShipButton.vue`)
- [x] **Fix heading semantics and API.** Replace the invalid `hgroup`/`div` structure, make descriptions optional, and support a constrained heading level. (`src/components/ShipHeading.vue`)
- [x] **Handle unavailable Web Storage in the cookie banner.** Reads/writes can throw and disable the feature. (`src/components/CookieBanner.vue`)
- [x] **Resolve cookie-banner registration.** Import/register the component or remove the unresolved template element while the feature is disabled. (`src/App.vue`)

## P3 — Low priority

- [ ] **Verify the email-confirmation idempotency status.** The code calls HTTP 304 “Conflict”; standard Conflict is 409. Rename/document a backend-specific contract or migrate it. (`src/data/index.ts`)
- [x] **Fix latent relative-time formatting.** `formatTimeAgo` subtracts `getMilliseconds()` rather than epoch time and needs invalid/future timestamp handling. (`src/utils/utils.ts`)
- [x] **Remove no-op sensor lifecycle code.** The deep watcher and mount callback only await `nextTick`. (`src/pages/sensors/SensorTemperatureTab.vue`)
- [x] **Remove the no-op global router hook.** Every application-layout mount registers another empty callback and drops its cleanup function. (`src/components/layout/ApplicationLayout.vue`)
- [ ] **Decide the registration feature explicitly.** `RegisterPage.vue` is entirely archived in comments while route constants and auth APIs remain. Remove it or restore executable, validated, tested code. (`src/pages/auth/RegisterPage.vue`, `src/constants/routes.ts`, `src/data/auth.ts`)
- [x] **Remove or implement the misleading history API.** `getDeviceStateWithHistory` is unused and requests only one record. (`src/data/index.ts`)
- [ ] **Consolidate duplicate user models.** The data-layer user includes fields missing from the canonical store model. (`src/data/index.ts`, `src/models/models.ts`)
- [ ] **Remove or adopt unused parallel sensor types.** Keeping a second domain shape encourages schema drift. (`src/types/sensor.ts`)
- [x] **Remove dead landing state/styles.** The unused auth computed currently fails ESLint; hero-height state and scoped animation rules also contain obsolete state/style paths. (`src/pages/LandingPage.vue`)
- [ ] **Remove or repair the stale duplicate header.** `TheHeader.vue` is unused and bypasses Pinia when logging out. (`src/components/TheHeader.vue`)
