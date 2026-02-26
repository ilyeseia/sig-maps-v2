# Epics & Stories: SIG Maps V2

**Version:** 1.0
**Date:** 2026-02-26
**Author:** Scrum Master (Dreima)
**Status:** Draft

---

## Overview

الجدول الكامل للـ Epics و Stories في SIG Maps V2. كل Epic قابل للنشر بشكل مستقل ويقدم قيمة واضحة للمستخدم.

| Epic | Stories | Priority | Dependencies | Estimated Duration |
|------|---------|----------|--------------|-------------------|
| **Epic 1: Foundation & Authentication** | 6 | P0 | None | 1-2 weeks |
| **Epic 2: Core Map Features** | 7 | P0 | Epic 1 | 2-3 weeks |
| **Epic 3: Drawing Tools** | 5 | P0 | Epic 2 | 1-2 weeks |
| **Epic 4: Data Export** | 4 | P1 | Epic 2 | 1 week |
| **Epic 5: User Management** | 4 | P1 | Epic 1 | 1 week |
| **Epic 6: Localization** | 3 | P1 | Epic 2 | 1 week |

**مجموع Stories:** 29
**المدة المقدرة:** 7-11 أسابيع (تطوير MVP)

---

## Epic 1: Foundation & Authentication

**Goal:** إنشاء البنية الأساسية للمشروع مع نظام مصادقة آمن

**Value:** ضروري لأي تطبيق — بدون الأساس، أين لا يكون أي شيء لنبنيها. Authentication ضروري للتحكم في الوصول.

**Dependencies:** لا شيء — هذا هو البداية

---

### Stories

#### Story 1.1: Project Setup (إعداد المشروع)

**As a** developer
**I want** the project structure and build pipeline set up
**So that** the development environment is ready to start building features

**Acceptance Criteria:**

```gherkin
Given the project repository is initialized
When I run 'npm install' in the frontend directory
Then all dependencies install successfully without errors

Given the project repository is initialized
When I run 'npm install' in the backend directory
Then all dependencies install successfully without errors

Given the project repository is initialized
When I run 'docker-compose up -d'
Then all containers start successfully
And I can access the frontend at http://localhost:3000
And I can access the backend API at http://localhost:3001

Given the Prisma schema exists
When I run 'npx prisma migrate dev'
Then the database schema is applied to PostgreSQL
And PostGIS extension is enabled

Given the git repository is initialized
When I create a commit
Then husky runs pre-commit hooks
And the commit is rejected if linting fails
```

**Technical Notes:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Express, TypeScript, Prisma ORM
- Database: PostgreSQL 15 + PostGIS 3.3
- Docker: 5 containers (postgres, backend, frontend, redis, nginx)
- ESLint + Prettier configured
- husky + lint-staged for git hooks

**Dependencies:** None

**Requirements Covered:**
- None (infrastructure only)

**Estimated Effort:** S (Small) — 2-3 days

---

#### Story 1.2: User Registration (تسجيل مستخدم جديد)

**As a** new user
**I want** to create an account
**So that** I can access SIG Maps V2 and start using the system

**Acceptance Criteria:**

```gherkin
Given I am on the login page
When I click "Sign up" link
Then I am redirected to the registration page

Given I am on the registration page
When I enter my email "fatima@example.com"
And I enter a password "SecurePassword123!"
And I enter my name "فاطمة"
And I select language "Arabic"
And I click "Create account"
Then my account is created successfully
And I am redirected to the map page
And a welcome toast appears with Arabic text

Given I enter an invalid email format
When I attempt to submit the form
Then I see an inline error message "البريد الإلكتروني غير صالح"

Given I enter a weak password (less than 8 characters)
When I attempt to submit the form
Then I see an inline error message "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"

Given I enter a password without uppercase letters
When I attempt to submit the form
Then I see an inline error message "كلمة المرور يجب أن تحتوي على حرف كبير"

Given the email is already registered
When I attempt to submit the form
Then I see an error message "البريد الإلكتروني مسجل بالفعل"

Given registration is successful
When I verify the database
Then the user table contains a new record
And the user's password is hashed using bcrypt (not plaintext)
And the user's role is set to "viewer" by default
And the user's language preference is "ar"
```

**Technical Notes:**
- Frontend: React Hook Form for form handling
- Backend: POST /api/auth/register endpoint
- Password hash: bcrypt with 12 rounds
- User role: default "viewer" (read-only)
- Language: default "ar" (can be "fr")
- Email validation: regex pattern
- Password validation: Zod schema (8+ chars, mixed case, number)

**Dependencies:** 1.1 (Project Setup)

**Requirements Covered:**
- FR-AUTH-005 (Password reset via email link)
- FR-AUTH-006 (Password complexity)
- FR-AUTH-007 (Session timeout handling)

**Estimated Effort:** M (Medium) — 1-2 days

---

#### Story 1.3: User Login (تسجيل الدخول)

**As a** registered user
**I want** to log in to SIG Maps V2
**So that** I can access my account and use the system

**Acceptance Criteria:**

```gherkin
Given I am a registered user with email "ahmed@example.com"
When I navigate to the login page
Then I see an email input field
And I see a password input field
And I see a "Login" button
And I see a "Forgot password?" link

Given I enter my email "ahmed@example.com"
And I enter my password "SecurePassword123!"
And I click "Login"
Then I am redirected to the map page
And a welcome toast appears: "مرحباً بك، أحمد"
And my user information is stored in localStorage

Given login is successful
When I check the localStorage
Then I find an access_token
And I find a refresh_token
And the access_token contains my user_id and role

Given I enter an incorrect password
When I click "Login"
Then I see an error message "كلمة المرور خاطئة"
And I am not redirected
And no tokens are stored in localStorage

Given I have been locked out (too many failed attempts)
When I attempt to log in
Then I see an error message "الحساب مقفل لمدة 15 دقيقة"

Given the access token expires (24 hours)
When I try to access a protected endpoint
Then I am redirected to the login page
And I see a message "انتهت الجلسة"

Given the refresh token is still valid (7 days)
When the access token expires
Then the system automatically refreshes the access token
Using the refresh token
And the user is prompted to log in again when the refresh token expires
```

**Technical Notes:**
- Frontend: JWT tokens stored in localStorage
- Backend: JWT verification middleware on all protected routes
- JWT secret: JWT_SECRET environment variable (>= 32 chars)
- Access token expiry: 24 hours
- Refresh token expiry: 7 days
- Rate limiting: 5 attempt per 15 minutes per IP
- Password: bcrypt.compare() for verification

**Dependencies:** 1.2 (User Registration)

**Requirements Covered:**
- FR-AUTH-001 (User login via email/password)
- FR-AUTH-002 (Password bcrypt hashing)
- FR-AUTH-003 (JWT access tokens 24h)
- FR-AUTH-004 (JWT refresh tokens 7d)
- FR-AUTH-007 (Session timeout)

**Estimated Effort:** M (Medium) — 1-2 days

---

#### Story 1.4: Password Reset (إعادة تعيين كلمة المرور)

**As a** user who forgot my password
**I want** to reset my password
**So that** I can regain access to my account

**Acceptance Criteria:**

```gherkin
Given I am on the login page
When I click "Forgot password?"
Then I am redirected to the password reset page
And I see an email input field
And I see a "Send Reset Link" button

Given I enter my registered email "ahmed@example.com"
And I click "Send Reset Link"
Then I see a success message "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني"
And a password reset token is generated in the database
And the token expires in 1 hour

Given I check my email
When I receive the password reset email
Then I see a URL with the reset token as a query parameter

Given I click the reset link in the email
When I am redirected to the reset password page
And I see the email field is pre-filled with "ahmed@example.com"
And I see a password input field
And I see a "Confirm Password" input field
And I see a "Reset Password" button

Given the reset token is valid
When I enter a new password "NewSecure123!"
And I confirm the password "NewSecure123!"
And I click "Reset Password"
Then my password is updated in the database (hashed with bcrypt)
And I see a success message "تم تحديث كلمة المرور بنجاح"
And I am redirected to the login page
And the reset token is deleted from the database

Given the passwords do not match
When I click "Reset Password"
Then I see an error message "كلمات المرور غير متطابقة"

Given the reset token is expired (> 1 hour)
When I try to reset my password
Then I see an error message "رابط إعادة التعيين منتهي الصلاحية"

Given the reset token has already been used
When I try to reset my password again
Then I see an error message "رابط غير صالح"
```

**Technical Notes:**
- Backend: POST /api/auth/reset-password endpoint
- Reset token: UUID with 1-hour expiry
- Password validation: same as registration
- Database: Add `reset_token`, `reset_token_expires_at` columns to users table
- Email: Simulated for MVP (send email to console/log)

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-AUTH-005 (Password reset via email)
- FR-AUTH-006 (Password complexity)
- FR-AUTH-011 (Log authentication events)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 1.5: Logout (تسجيل الخروج)

**As a** authenticated user
**I want** to log out of my account
**So that** my session is terminated and others cannot access my data

**Acceptance Criteria:**

```gherkin
Given I am logged in as "ahmed@example.com"
When I click on the user menu in the header
Then I see a "Logout" option

Given I click "Logout"
When the logout request completes
Then I am redirected to the login page
And the access_token is removed from localStorage
And the refresh_token is removed from localStorage
And a toast message appears: "تم تسجيل الخروج بنجاح"

Given I have already logged out
When I try to access a protected endpoint
Then I am redirected to the login page
And I am prompted to log in again
```

**Technical Notes:**
- Frontend: Remove tokens from localStorage on logout
- Backend: POST /api/auth/logout endpoint (optional - can just destroy tokens client-side)
- JWT blacklist: Not required for MVP (let tokens expire naturally)

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-AUTH-011 (Log authentication events)

**Estimated Effort:** S (Small) — <1 day

---

#### Story 1.6: Session Management (إدارة الجلسة)

**As a** authenticated user
**I want** the system to keep me logged in across page refreshes
**So that** I don't have to log in again every time I refresh the page

**Acceptance Criteria:**

```gherkin
Given I am logged in and have a valid access_token
When I refresh the browser page
Then I am still logged in
And my user information is still available

Given my access_token has expired
When I refresh the browser page
And I have a valid refresh_token
Then the system automatically fetches a new access_token
Using the refresh token
And I am still logged in

Given both tokens have expired
When I refresh the browser page
Then I am redirected to the login page
And I must log in again

Given I am logged in on one browser tab
When I open a second browser tab and navigate to SIG Maps V2
Then I am logged in on the second tab
Because the tokens are stored in localStorage (shared across tabs)
```

**Technical Notes:**
- Frontend: Check token expiry on page load
- Frontend: Refresh token automatically if near expiry
- Backend: JWT middleware validates tokens on every request
- Backend: Refresh token endpoint: POST /api/auth/refresh

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-AUTH-003 (JWT access tokens 24h)
- FR-AUTH-004 (JWT refresh tokens 7d)

**Estimated Effort:** S (Small) — <1 day

---

## Epic 2: Core Map Features

**Goal:** تصميم وإنشاء نظام عرض الخريطة التفاعلي مع إدارة الطبقات والميزات

**Value:** هذه هي القيمة الأساسية للمشروع — بدون العرض التفاعلي، النظام لا يوفر أية فائدة للمستخدمين.

**Dependencies:** Epic 1 (Foundation & Authentication)

---

### Stories

#### Story 2.1: Map Initialization (تهيئة الخريطة)

**As a** user
**I want** to see the map loaded when I log in
**So that** I can start viewing geospatial data immediately

**Acceptance Criteria:**

```gherkin
Given I am logged in as an authenticated user
When I am redirected to the map page after login
Then a Leaflet map is rendered in the center of the page
And the map covers the full viewport (minus header)
And I see a base layer (OpenStreetMap tiles)
And I can pan the map using mouse drag
And I can zoom the map using scroll wheel

Given the map is loaded
When I look at the URL in the browser
Then the URL contains the map's center coordinates and zoom level
And the format is: /map?lat=36.7732&lng=3.0588&zoom=12

Given I open the map page for the first time
When the map center is not specified
Then the map defaults to Algiers center (lat: 36.7732, lng: 3.0588)
And the zoom level defaults to 12

Given the map is loading
When I check the console
Then there are no errors related to Leaflet initialization
And the Leaflet library loads successfully
And the base layer tiles load successfully
```

**Technical Notes:**
- Frontend: Leaflet.map() initialized on mount
- Frontend: Map container: div with id="map"
- Frontend: Base layer: OpenStreetMap (no API key)
- Frontend: React State: stores map center coordinates and zoom level
- Frontend: useEffect: sync map state to URL
- UX: "Loading map data..." message until base layer loads

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-MAP-001 (Leaflet map)
- FR-MAP-002 (Zoom levels 1-20)
- FR-MAP-007 (Responsive on mobile)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 2.2: Layer Panel (لوحة الطبقات)

**As a** user
**I want** to see a list of all available layers
**So that** I can toggle their visibility and understand the map's organization

**Acceptance Criteria:**

```gherkin
Given I am logged in
When the map page loads
Then I see a "Layers" toggle button in the header

Given I click the "Layers" button
When the layer panel opens
Then I see a drawer sliding in from the right (LTR) / left (RTL)
And I see a list of all layers in the database
And each layer shows: icon, name (in Arabic or French), checkbox for visibility

Given there are 3 layers in the database
When I view the layer panel
Then I see 3 layer items
And each layer item shows:
- A checkbox indicating visibility (checked if visible, unchecked if not)
- An icon representing the geometry type (📍 for point, 〰 for line, 🔷 for polygon)
- The layer name (localized: Arabic or French)

Given I uncheck the checkbox for "أنابيب المياه"
When I click the checkbox
Then the "Water Pipes" layer disappears from the map immediately
And the checkbox is unchecked in the UI

Given I check the checkbox again
When I click the checkbox
Then the "Water Pipes" layer reappears on the map immediately
And the checkbox is checked in the UI

Given I close the layer panel
When I click the "Layers" button again
Then the drawer slides closed
And the button shows a different icon indicating the panel is closed

Given I am on a mobile device (screen width < 640px)
When I open the layer panel
Then the panel opens as a full-screen modal
And I can close it by clicking the "Close" button in the top-left corner
```

**Technical Notes:**
- Frontend: Zustand store for layer visibility state
- Frontend: Sidebar component (slide-in drawer)
- Frontend: API: GET /api/layers to fetch layers
- Frontend: Layer visibility toggles map layer visibility (Leaflet layerGroup)
- Frontend: Responsive: full-screen panel on mobile

**Dependencies:** 2.1 (Map Initialization)

**Requirements Covered:**
- FR-LAYR-004 (Toggle layer visibility)
- FR-LAYR-008 (Layer name unique)
- FR-MAP-010 (Display layer attribution)
- FR-I18N-001 (Arabic interface)
- FR-I18N-002 (French interface)

**Estimated Effort:** M (Medium) — 1-2 days

---

#### Story 2.3: Features Display (عرض الميزات)

**As a** user
**I want** to see geospatial features (points, lines, polygons) on the map
**So that** I can visualize the actual data that exists in the system

**Acceptance Criteria:**

```gherkin
Given I am logged in and the map is loaded
And there is a layer "أنابيب المياه" with 100 point features
When the "Water Pipes" layer is visible
Then I see 100 markers on the map representing the water pipes
And each marker has a blue circle icon (configurable color)

Given I zoom in on a specific area
When I zoom to zoom level 15+
Then the map tiles load at the higher resolution
And the map is crisp and clear

Given I zoom out
When I zoom to zoom level 5-
Then the map tiles load at the lower resolution
And the map covers a larger area

Given the layer contains > 100 features
When I view the map
Then I see marker clusters (groups of markers)
And each cluster shows a number indicating how many markers are in the cluster
And each cluster has a blue background with white text

Given I hover over a feature (marker, line, or polygon)
When I move the mouse cursor over the feature
Then a popup appears showing the feature's name and key attributes
And the popup is positioned at the marker (offset above)

Given I click on a feature
When I click the marker, line, or polygon
Then a popup appears with full details
And the popup contains: name (localized), description (localized), attributes
And the popup has an "Edit" button (if user has permission)
And the popup has a "Delete" button (if user has permission)

Given the layer contains line features
When I view the map
Then I see polylines representing the lines
And the lines are styled according to the layer's configuration (color, width)

Given the layer contains polygon features
When I view the map
Then I see polygons representing the areas
And the polygons are styled according to the layer's configuration (fill color, opacity, border)
```

**Technical Notes:**
- Frontend: API: GET /api/features?layer_id=xxx to fetch features
- Frontend: PostGIS query: Uses ST_Intersects(bbox, geometry) to fetch features within visible area
- Frontend: Leaflet: L.markerClusterGroup for clustering
- Frontend: Leaflet: L.Polyline for lines
- Frontend: Leaflet: L.Polygon for polygons
- Frontend: Performance: Lazy load features as user pans/zooms

**Dependencies:** 2.2 (Layer Panel)

**Requirements Covered:**
- FR-MAP-001 (Leaflet map)
- FR-MAP-003 (Display 10K+ points in <2 seconds)
- FR-MAP-004 (Marker clustering >100 points)
- FR-MAP-008 (Pan with mouse drag)
- FR-MAP-009 (Zoom with scroll wheel)
- FR-MAP-011 (Show scale bar)
- FR-DATA-001 (Store features with PostGIS)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 2.4: Feature Selection Selection (اختيار الميزة)

**As a** user
**I want** to select a feature on the map
**So that** I can view its details and perform actions (edit, delete)

**Acceptance Criteria:**

```gherkin
Given I am viewing the map
And there are features visible
When I click on a feature (marker, line, or polygon)
Then the feature becomes visually selected (highlighted border or color)
And a popup appears with the feature's details
And the popup is always positioned within the viewport (not cut off)

Given I click on another feature
When I click the second feature
Then the first feature is deselected (highlighted border removed)
And the second feature is selected (highlighted border appears)
And the popup updates to show the second feature's details

Given I click on a feature
When I view the popup
Then the popup contains:
- The feature's name (in Arabic or French, based on my language preference)
- The feature's description (if any)
- The feature's attributes (custom key-value pairs)
- The feature's geometry type (point, line, or polygon)
- The feature's coordinates (for debugging)
- An "Edit" button (if I have permission to edit)
- A "Delete" button (if I have permission to delete)

Given I click on the close button (X) in the popup
When the popup closes
Then the feature remains selected (highlighted border)

Given I click elsewhere on the map (not on a feature)
When I click on empty space
Then the feature is deselected (highlighted border removed)
And the popup closes

Given I am a viewer role user
When I view the popup
Then I do not see an "Edit" button
And I do not see a "Delete" button

Given I am an editor or admin role user
When I view the popup
Then I see both "Edit" and "Delete" buttons
```

**Technical Notes:**
- Frontend: Leaflet popup with bindPopup() method
- Frontend: Selected feature state in Zustand
- Frontend: Selected feature visual: add/remove class (e.g., 'selected')
- Frontend: Popup content dynamically generated based on feature data
- Frontend: RBAC: Check user role before showing edit/delete buttons

**Dependencies:** 2.3 (Features Display)

**Requirements Covered:**
- FR-MAP-001-Related (Map interaction)
- FR-USER-008 (RBAC: Viewers see only)

**Estimated Effort:** M (Medium) — 1-2 days

---

#### Story 2.5: Feature Filter (تصفية الميزات)

**As a** user
**I want** to filter features by layer or search by name
**So that** I can find specific features quickly

**Acceptance Criteria:**

```gherkin
Given I am viewing the map
And there are multiple layers
When I look at the layer panel
Then I see a search input field at the top of the layer panel

Given I type "مياه" in the search field
When I press Enter
Then the layer list is filtered to show only layers matching "مياه"
And the map immediately updates to show only features from the filtered layers
And other layers are hidden

Given I clear the search field
When I delete the text
Then all layers are shown again
And all features are visible again

Given there are >100 features on the map
When I view the features
Then I see a pagination control (if needed)
But for MVP, pagination is optional (features can all be shown)
```

**Technical Notes:**
- Frontend: Search input in layer panel
- Frontend: Filter layer list based on search query
- Frontend: Update map layers based on filtered list
- Frontend: Optional: Feature search (search within attributes)

**Dependencies:** 2.2 (Layer Panel)

**Requirements Covered:**
- FR-LAYR-009 (Export individual layers)
- FR-DATA-006 (Track creation/modification timestamps)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 2.6: Map Controls (تحكمات الخريطة)

**As a** user
**I want** standard map controls (zoom buttons, fullscreen, scale bar)
**So that** I can navigate and understand the map easily

**Acceptance Criteria:**

```gherkin
Given I am viewing the map
When I look at the map controls
Then I see zoom buttons (+ and -) in the bottom-right corner (LTR) / bottom-left (RTL)
And I see a "Fullscreen" button next to the zoom buttons
And I see a scale bar at the bottom of the map

Given I click the "+" button
When I click
Then the map zooms in by one level
And the animation is smooth (<200ms)

Given I click the "-" button
When I click
Then the map zooms out by one level
And I can only zoom to the minimum zoom level (1)
And I can only zoom to the maximum zoom level (20)

Given I click the "Fullscreen" button
When I click
Then the map enters fullscreen mode
And the browser header and other UI are hidden
And the map takes up the entire viewport
And the button icon changes to indicate "Exit fullscreen"

Given I am in fullscreen mode
When I press the Esc key
Then the map exits fullscreen mode
And the UI is restored

Given I press the keyboard "+" key
When I press
Then the map zooms in
And the pan operation is the same as clicking the zoom button

Given I press the keyboard "-" key
For example, "P" for point, "L" for line, "O" for polygon
Then nothing happens (invalid shortcut ignored)
```

**Technical Notes:**
- Frontend: Leaflet's built-in zoom control (L.control.zoom)
- Frontend: Fullscreen API: element.requestFullscreen()
- Frontend: Esc key listener: document.exitFullscreen()
- Frontend: Scale bar: L.control.scale()
- Frontend: Keyboard shortcuts: Listen for keydown events

**Dependencies:** 2.1 (Map Initialization)

**Requirements Covered:**
- FR-MAP-002 (Zoom levels 1-20)
- FR-MAP-005 (Fullscreen mode)
- FR-MAP-011 (Show scale bar)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 2.7: Feature Pagination (ترقيمق الميزات)

**As a** user
**I want** to paginate through large datasets
**So that** the map remains performant with thousands of features

**Acceptance Criteria:**

```gherkin
Given a layer contains 10,000 features
When I load the map
Then the map initially loads only 100 features (first page)
And the map shows a "Load more" button at the bottom
And the map indicates "Showing 1-100 of 10,000 features"

Given I click "Load more"
When I click
Then 100 more features are loaded and displayed (total 200)
And the map updates to "Showing 1-200 of 10,000 features"

Given I continue to click "Load more"
When I load all 10,000 features
Then the map shows "Showing all 10,000 features"
And the "Load more" button is disabled

Given I am on a mobile device
When I load large datasets
Then the pagination handles automatically (using scroll)
And features are loaded as I scroll down the page
```

**Technical Notes:**
- Frontend: Virtual scrolling or infinite scrolling for large datasets
- Frontend: PostGIS: LIMIT/OFFSET for pagination
- Frontend: Map clustering helps with performance anyway

**Dependencies:** 2.3 (Features Display)

**Requirements Covered:**
- FR-MAP-003 (Display 10K+ points in <2s) - Progressive loading
- FR-PERF-004 (Support 50+ concurrent users)

**Estimated Effort:** M (Medium) — 2 days — may defer to post-MVP

---

## Epic 3: Drawing Tools

**Goal:** إنشاء أدوات رسم النقاط والخطوط والمناطق لتمكين المستخدمين من إضافة وتحرير البيانات المكانية

**Value:** هذه هي الوظيفة الأساسية لـ GIS — إضافة وتحرير البيانات المكانية.

**Dependencies:** Epic 2 (Core Map Features)

---

### Stories

#### Story 3.1: Draw Points (رسم النقاط)

**As a** user
**I want** to draw point features on the map
**So that** I can add markers representing point locations (e.g., water stations)

**Acceptance Criteria:**

```gherkin
Given I am on the map page
When I click the "Draw Point" button (📍)
Then the drawing mode activates
And a toast appears with message "انقر على الخريطة لإضافة نقطة"
And my cursor changes to a crosshair icon

Given I click on the map at location (lat: 36.7732, lng: 3.0588)
When I click
Then a temporary blue circle marker appears at the clicked location
And a form opens in a sidebar or modal requesting feature details

Given the point drawing form opens
When I view the form
Then I see:
- A "Name" input field (required)
- A "Description" text area (optional)
- An "Attribute" key-value pair section (optional)
- A "Save" button
- A "Cancel" button

Given I enter the name "محطة ضخم مياه"
And I enter the description "محطة في العاصمة"
And I click "Save"
Then the point is saved to the database
And the marker is visually updated to show it is saved (remove temporary red border)
And a success toast appears: "تم حفظ النقطة بنجاح"
And the form closes

Given I click on another location
When I click
Then another temporary marker appears
And the form opens for the new point

Given I decide to cancel
When I click "Cancel" in the form
Then the temporary marker is removed from the map
And the form closes
And no data is saved

Given I click the "Draw Point" button again
When I click
Then the drawing mode is deactivated
And my cursor returns to normal
And no new points are created when I click the map
```

**Technical Notes:**
- Frontend: L.Draw plugin (for drawing tools) or custom implementation
- Frontend: Leaflet: L.marker for markers
- Frontend: API: POST /api/features endpoint
- Frontend: Request body: { layer_id, geometry: { type: "Point", coordinates: [lng, lat] }, attributes: { name, description } }
- Frontend: Validation: Validate geometry type matches layer's geometry_type

**Dependencies:** 2.3 (Features Display)

**Requirements Covered:**
- FR-DRAW-001 (Draw point features)
- FR-DRAW-005 (Delete features)
- FR-I18N-007 (All UI text in Arabic/French)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 3.2: Draw Lines (رسم الخطوط)

**As a** user
**I want** to draw line features on the map
**So that** I can add pipes, roads, or other linear features

**Acceptance Criteria:**

```gherkin
Given I am on the map page
When I click the "Draw Line" button (〰)
Then the drawing mode activates
And a toast appears: "انقر على الخريطة لرسم خط"
And my cursor changes to a crosshair icon

Given I click on the first location
When I click
Then a starting point marker appears
And a thin blue line dynamically follows my cursor

Given I click on the second location
When I click
Then a line is drawn from the first point to the second point
And the line continues to follow my cursor

Given I continue clicking to add more vertices
When I click
Then the line extends to the new vertex
And I can add as many vertices as needed

Given I double-click on the last vertex
When I double-click
Then the line is completed
And the temporary line becomes a permanent line
And a form opens requesting line details

Given I click on any vertex before double-clicking
When I click
Then I can still add more vertices
And the line preview continues

Given I decide to cancel drawing
When I press the Esc key
Then the line is removed from the map
And the drawing mode is deactivated
And my cursor returns to normal

Given I complete the line and open the form
When I enter the name "خط مياه رئيسي"
And I click "Save"
Then the line is saved to the database
And the line is visually updated (remove temporary red border)
And a success toast appears: "تم حفظ الخط بنجاح"
```

**Technical Notes:**
- Frontend: Leaflet: L.polyline for lines
- Frontend: Double-click to complete drawing
- Frontend: API: POST /api/features endpoint
- Frontend: Request body: { layer_id, geometry: { type: "LineString", coordinates: [[lng1, lat1], [lng2, lat2], ...]] }, attributes: { name } }
- Frontend: UX: Show line distance (optional)

**Dependencies:** 3.1 (Draw Points)

**Requirements Covered:**
- FR-DRAW-002 (Draw polyline features)
- FR-DRAW-006 (Cancel drawing with ESC)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 3.3: Draw Polygons (رسم المناطق)

**As a** user
**I want** to draw polygon features on the map
**So that** I can add areas such as zones, neighborhoods, or site boundaries

**Acceptance Criteria:**

```gherkin
Given I am on the map page
When I click the "Draw Polygon" button (🔷)
Then the drawing mode activates
And a toast appears: "انقر على الخريطة لرسم منطقة"
And my cursor changes to a crosshair icon

Given I click on the first location
When I click
Then a starting point marker appears
And a line connects my cursor to the starting point

Given I click on the second location
When I click
Then a line is drawn from the first point to the second point

Given I click on the third location
When I click
Then a line is drawn from the second point to the third point

Given I continue clicking to add more vertices
When I click
Then the polygon shape forms with each new vertex

Given I double-click on the last vertex
When I double-click
Then the polygon is completed
And a form opens requesting polygon details

Given I decide to cancel drawing
When I press the Esc key
Then the polygon is removed from the map
And the drawing mode is deactivated

Given I complete the polygon and open the form
When I enter the name "منطقة سكنية"
And I click "Save"
Then the polygon is saved to the database
And a success toast appears: "تم حفظ المنطقة بنجاح"
```

**Technical Notes:**
- Frontend: Leaflet: L.polygon for areas
- Frontend: Double-click to complete drawing
- Frontend: API: POST /api/features endpoint
- Frontend: Request body: `{ layer_id, geometry: { type: "Polygon", coordinates: [[[lng1, lat1], [lng2, lat2], ...]]] }, attributes: { name } }`

**Dependencies:** 3.2 (Draw Lines)

**Requirements Covered:**
- FR-DRAW-003 (Draw polygon features)
- FR-DRAW-006 (Cancel drawing with ESC)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 3.4: Edit Features (تحرير الميزات)

**As a** user with editor permission
**I want** to edit existing features on the map
**So that** I can update their geometry or attributes

**Acceptance Criteria:**

```gherkin
Given I am logged in as an editor or admin
And I have selected a feature on the map
When I click the "Edit" button in the popup
Then the feature enters edit mode
And I see draggable vertices on the feature
And I see a toolbar with: "Save", "Cancel", "Delete"

Given I drag a vertex to a new location
When I release the mouse
Then the vertex is moved to the new location
And the feature preview updates immediately

Given I click "Save"
When I click
Then the updated geometry is saved to the database
And a success toast appears: "تم تحديث الميزة بنجاح"
And the feature exits edit mode

Given I click "Cancel"
When I click
Then the feature reverts to its original geometry
And the feature exits edit mode
And no changes are saved

Given I am a viewer role user
When I view a feature popup
Then I do not see an "Edit" button
```

**Technical Notes:**
- Frontend: Leaflet: enableEdit() method from Leaflet.draw
- Frontend: API: PUT /api/features/:id endpoint
- Frontend: Optimistic update: Update UI immediately, revert on error

**Dependencies:** 3.3 (Draw Polygons)

**Requirements Covered:**
- FR-DRAW-004 (Edit existing features)
- FR-USER-008 (RBAC: Only editors/admins can edit)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 3.5: Delete Features (حذف الميزات)

**As a** user with editor permission
**I want** to delete features from the map
**So that** I can remove outdated or incorrect data

**Acceptance Criteria:**

```gherkin
Given I am logged in as an editor or admin
And I have selected a feature on the map
When I click the "Delete" button in the popup
Then a confirmation modal appears
And the modal asks: "هل أنت متأكد من حذف هذه الميزة؟"
And I see "Cancel" and "Delete" buttons

Given I click "Delete" in the confirmation modal
When I click
Then the feature is removed from the map immediately
And the feature is deleted from the database
And a success toast appears: "تم حذف الميزة بنجاح"

Given I click "Cancel" in the confirmation modal
When I click
Then the modal closes
And the feature remains on the map

Given I am a viewer role user
When I view a feature popup
Then I do not see a "Delete" button
```

**Technical Notes:**
- Frontend: Confirmation modal before delete
- Frontend: API: DELETE /api/features/:id endpoint
- Frontend: Optimistic delete: Remove from UI immediately

**Dependencies:** 3.4 (Edit Features)

**Requirements Covered:**
- FR-DRAW-005 (Delete features)
- FR-USER-008 (RBAC: Only editors/admins can delete)

**Estimated Effort:** S (Small) — 1 day

---

## Epic 4: Data Export

**Goal:** تصدير البيانات المكانية بتنسيقات متعددة (GeoJSON, KML, Shapefile)

**Value:** تمكين المستخدمين من استخدام البيانات في أنظمة GIS أخرى (QGIS, ArcGIS, إلخ)

**Dependencies:** Epic 2 (Core Map Features)

---

### Stories

#### Story 4.1: Export GeoJSON (تصدير GeoJSON)

**As a** user
**I want** to export features as GeoJSON
**So that** I can use the data in other GIS applications

**Acceptance Criteria:**

```gherkin
Given I am viewing the map
When I click the "Export" button in the header
Then an export modal appears

Given the export modal is open
When I select "GeoJSON" as the format
And I select the layers to export (checkboxes)
And I click "Export"
Then a GeoJSON file is generated
And the file downloads automatically
And the file name is: "sig-maps-export-2026-02-26.geojson"

Given I open the downloaded GeoJSON file
When I inspect the content
Then the file contains valid GeoJSON
And the file contains all features from the selected layers
And each feature has: type, geometry, properties (attributes)

Given I export a large dataset (>1000 features)
When the export is processing
Then I see a progress bar
And I can cancel the export
```

**Technical Notes:**
- Backend: GET /api/export?format=geojson&layers=1,2,3
- Backend: PostGIS: ST_AsGeoJSON() for geometry conversion
- Frontend: File download: Create blob and trigger download
- File naming: `sig-maps-export-{date}.geojson`

**Dependencies:** 2.3 (Features Display)

**Requirements Covered:**
- FR-EXP-001 (Export to GeoJSON)
- FR-EXP-004 (Progress indication for large exports)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 4.2: Export KML (تصدير KML)

**As a** user
**I want** to export features as KML
**So that** I can view the data in Google Earth

**Acceptance Criteria:**

```gherkin
Given the export modal is open
When I select "KML" as the format
And I select the layers to export
And I click "Export"
Then a KML file is generated
And the file downloads automatically
And the file name is: "sig-maps-export-2026-02-26.kml"

Given I open the downloaded KML file in Google Earth
When I view the data
Then all features are displayed correctly
And the layer names appear as KML folder names
And feature names appear as placemark names
```

**Technical Notes:**
- Backend: Use tj (terraformer) or similar library for KML conversion
- Backend: PostGIS: ST_AsKML() for geometry conversion
- File naming: `sig-maps-export-{date}.kml`

**Dependencies:** 4.1 (Export GeoJSON)

**Requirements Covered:**
- FR-EXP-002 (Export to KML)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 4.3: Export Shapefile (تصدير Shapefile)

**As a** user
**I want** to export features as Shapefile
**So that** I can use the data in ArcGIS or QGIS

**Acceptance Criteria:**

```gherkin
Given the export modal is open
When I select "Shapefile" as the format
And I select the layers to export
And I click "Export"
Then a ZIP file is generated containing:
- .shp (geometry)
- .shx (index)
- .dbf (attributes)
- .prj (projection: EPSG:4326)
And the file downloads automatically
And the file name is: "sig-maps-export-2026-02-26.zip"

Given I open the downloaded ZIP file in QGIS
When I view the data
Then all features are displayed correctly
And the attribute table shows all feature attributes
```

**Technical Notes:**
- Backend: Use shp-write or GDAL for Shapefile conversion
- Backend: Note: Shapefile has limitations (single geometry type per file)
- Frontend: If mixed geometry types, show warning or create multiple shapefiles

**Dependencies:** 4.1 (Export GeoJSON)

**Requirements Covered:**
- FR-EXP-003 (Export to Shapefile)

**Estimated Effort:** M (Medium) — 2 days

---

#### Story 4.4: Export Progress & History (تقدم التصدير والسجل)

**As a** user
**I want** to see export progress and history
**So that** I know the status of my export jobs

**Acceptance Criteria:**

```gherkin
Given I start a large export (>1000 features)
When the export is processing
Then I see a progress bar with percentage
And I see "Exporting... 45%"
And I can click "Cancel" to stop the export

Given the export completes
When the file is ready
Then the progress bar shows 100%
And a "Download" button appears
And a success toast appears: "تم التصدير بنجاح"

Given the export fails
When an error occurs
Then I see an error message: "فشل التصدير. يرجى المحاولة مرة أخرى."
And I can retry the export

Given I want to see previous exports
When I navigate to the export history page
Then I see a list of all my past exports
And each entry shows: date, format, layers, file size, download link
```

**Technical Notes:**
- Backend: Create `export_jobs` table to track export jobs
- Backend: Background job processing with Bull or similar
- Frontend: WebSocket or polling for progress updates

**Dependencies:** 4.1 (Export GeoJSON)

**Requirements Covered:**
- FR-EXP-004 (Progress indication)
- FR-EXP-005 (Export history)

**Estimated Effort:** M (Medium) — 2 days

---

## Epic 5: User Management

**Goal:** إدارة المستخدمين والأدوار والصلاحيات

**Value:** التحكم في الوصول والأمان — ضروري للأنظمة متعددة المستخدمين

**Dependencies:** Epic 1 (Foundation & Authentication)

---

### Stories

#### Story 5.1: User List (قائمة المستخدمين)

**As an** admin user
**I want** to see a list of all users
**So that** I can manage who has access to the system

**Acceptance Criteria:**

```gherkin
Given I am logged in as an admin
When I navigate to the User Management page
Then I see a table with all users
And each row shows: name, email, role, status, created_at

Given there are more than 20 users
When I view the user list
Then I see pagination controls
And I can navigate between pages

Given I want to find a specific user
When I type in the search field
Then the list is filtered to show matching users
```

**Technical Notes:**
- Frontend: API: GET /api/users?page=1&limit=20&search=xxx
- Frontend: Table with pagination and search
- Backend: RBAC: Only admins can access this endpoint

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-USER-001 (User management)
- FR-USER-004 (Role-based access control)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 5.2: User Role Management (إدارة أدوار المستخدمين)

**As an** admin user
**I want** to change a user's role
**So that** I can control their permissions

**Acceptance Criteria:**

```gherkin
Given I am viewing the user list
When I click on a user's role dropdown
Then I see options: "Viewer", "Editor", "Admin"
And I can select a new role

Given I change a user's role from "Viewer" to "Editor"
When I confirm the change
Then the user's role is updated in the database
And a success toast appears: "تم تحديث دور المستخدم"
And the user's new permissions take effect immediately

Given I try to change my own role
When I select a new role for myself
Then I see a warning: "لا يمكنك تغيير دورك الخاص"
And the change is not allowed
```

**Technical Notes:**
- Frontend: API: PATCH /api/users/:id/role
- Frontend: Role options: viewer, editor, admin
- Backend: RBAC: Only admins can change roles
- Backend: Cannot change own role

**Dependencies:** 5.1 (User List)

**Requirements Covered:**
- FR-USER-004 (Role-based access control)
- FR-USER-005 (Admin manages users)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 5.3: User Status Management (إدارة حالة المستخدم)

**As an** admin user
**I want** to deactivate or activate users
**So that** I can control who can access the system

**Acceptance Criteria:**

```gherkin
Given I am viewing the user list
When I click the "Deactivate" button for a user
Then a confirmation modal appears: "هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟"

Given I confirm the deactivation
When I click "Deactivate"
Then the user's status changes to "inactive"
And the user cannot log in anymore
And the user's existing sessions are invalidated
And a success toast appears: "تم إلغاء تفعيل المستخدم"

Given I want to reactivate a user
When I click "Activate"
Then the user's status changes to "active"
And the user can log in again

Given I try to deactivate myself
When I click "Deactivate" on my own account
Then I see a warning: "لا يمكنك إلغاء تفعيل حسابك الخاص"
And the action is not allowed
```

**Technical Notes:**
- Frontend: API: PATCH /api/users/:id/status
- Frontend: Status options: active, inactive
- Backend: Invalidate all sessions for deactivated user

**Dependencies:** 5.1 (User List)

**Requirements Covered:**
- FR-USER-002 (User activation/deactivation)
- FR-USER-006 (Admin can deactivate users)

**Estimated Effort:** S (Small) — 1 day

---

#### Story 5.4: User Profile (ملف المستخدم)

**As a** user
**I want** to view and edit my profile
**So that** I can update my information

**Acceptance Criteria:**

```gherkin
Given I am logged in
When I click on my name in the header
Then a dropdown menu appears
And I see "Profile" and "Logout" options

Given I click "Profile"
When the profile page loads
Then I see my: name, email, language preference, created_at
And I can edit my name and language preference
And I cannot edit my email (requires verification)

Given I change my name to "أحمد بن علي"
And I click "Save"
Then my name is updated in the database
And a success toast appears: "تم تحديث الملف الشخصي"
And my name is updated in the header

Given I change my language preference to "Français"
And I click "Save"
Then the interface switches to French immediately
And my language preference is saved for future sessions
```

**Technical Notes:**
- Frontend: API: GET /api/users/me (current user info)
- Frontend: API: PATCH /api/users/me (update profile)
- Frontend: Language change triggers UI update

**Dependencies:** 1.3 (User Login)

**Requirements Covered:**
- FR-USER-003 (User profile management)
- FR-I18N-003 (Language preference per user)

**Estimated Effort:** S (Small) — 1 day

---

## Epic 6: Localization

**Goal:** دعم كامل للغة العربية والفرنسية مع RTL/LTR

**Value:** الوصول للمستخدمين في الجزائر — ضروري للقبول

**Dependencies:** Epic 2 (Core Map Features)

---

### Stories

#### Story 6.1: Arabic RTL Interface (واجهة عربية RTL)

**As a** user who prefers Arabic
**I want** the entire interface in Arabic with RTL layout
**So that** I can use the system comfortably in my native language

**Acceptance Criteria:**

```gherkin
Given my language preference is "Arabic"
When I log in to SIG Maps V2
Then the entire interface is in Arabic
And the layout is right-to-left (RTL)
And the sidebar appears on the right side
And text is right-aligned
And icons and arrows are mirrored

Given I navigate to the map page
When I view the layer panel
Then all layer names are in Arabic
And all buttons are in Arabic
And all toast messages are in Arabic

Given I switch my language preference to "Français"
When I refresh the page
Then the entire interface switches to French
And the layout becomes left-to-right (LTR)
And the sidebar appears on the left side
```

**Technical Notes:**
- Frontend: Use `dir="rtl"` attribute on `<html>` for Arabic
- Frontend: CSS: Use logical properties (margin-inline-start instead of margin-left)
- Frontend: i18n library: react-i18next or similar
- Frontend: Store language in localStorage and user preferences

**Dependencies:** 2.1 (Map Initialization)

**Requirements Covered:**
- FR-I18N-001 (Arabic interface)
- FR-I18N-004 (RTL layout for Arabic)

**Estimated Effort:** M (Medium) — 2-3 days

---

#### Story 6.2: French LTR Interface (واجهة فرنسية LTR)

**As a** user who prefers French
**I want** the entire interface in French with LTR layout
**So that** I can use the system comfortably in my preferred language

**Acceptance Criteria:**

```gherkin
Given my language preference is "French"
When I log in to SIG Maps V2
Then the entire interface is in French
And the layout is left-to-right (LTR)
And the sidebar appears on the left side

Given I navigate to the map page
When I view the layer panel
Then all layer names are in French
And all buttons are in French
And all toast messages are in French
```

**Technical Notes:**
- Frontend: Use `dir="ltr"` attribute on `<html>` for French
- Frontend: i18n: French translations in fr.json

**Dependencies:** 6.1 (Arabic RTL Interface)

**Requirements Covered:**
- FR-I18N-002 (French interface)

**Estimated Effort:** S (Small) — 1 day (reuses Arabic infrastructure)

---

#### Story 6.3: Localized Feature Names (أسماء الميزات المحلية)

**As a** user
**I want** feature names and descriptions in my preferred language
**So that** I can understand the data

**Acceptance Criteria:**

```gherkin
Given a feature has both Arabic and French names
When my language is Arabic
Then I see the Arabic name in the popup
And I see the Arabic description

Given my language is French
When I view the same feature
Then I see the French name in the popup
And I see the French description

Given a feature does not have a translation in my language
When I view the feature
Then I see the default language name (Arabic fallback)
And I see an indicator that translation is missing
```

**Technical Notes:**
- Backend: Features table has `name_ar`, `name_fr`, `description_ar`, `description_fr` columns
- Frontend: API returns localized content based on Accept-Language header
- Frontend: Fallback to Arabic if translation missing

**Dependencies:** 2.3 (Features Display)

**Requirements Covered:**
- FR-I18N-005 (Localized feature names)
- FR-I18N-006 (Localized feature descriptions)

**Estimated Effort:** M (Medium) — 2 days

---

## Story Dependency Graph

```
Epic 1: Foundation & Authentication
├── 1.1 Project Setup
├── 1.2 User Registration (depends on 1.1)
├── 1.3 User Login (depends on 1.2)
├── 1.4 Password Reset (depends on 1.3)
├── 1.5 Logout (depends on 1.3)
└── 1.6 Session Management (depends on 1.3)

Epic 2: Core Map Features
├── 2.1 Map Initialization (depends on 1.3)
├── 2.2 Layer Panel (depends on 2.1)
├── 2.3 Features Display (depends on 2.2)
├── 2.4 Feature Selection (depends on 2.3)
├── 2.5 Feature Filter (depends on 2.2)
├── 2.6 Map Controls (depends on 2.1)
└── 2.7 Feature Pagination (depends on 2.3)

Epic 3: Drawing Tools
├── 3.1 Draw Points (depends on 2.3)
├── 3.2 Draw Lines (depends on 3.1)
├── 3.3 Draw Polygons (depends on 3.2)
├── 3.4 Edit Features (depends on 3.3)
└── 3.5 Delete Features (depends on 3.4)

Epic 4: Data Export
├── 4.1 Export GeoJSON (depends on 2.3)
├── 4.2 Export KML (depends on 4.1)
├── 4.3 Export Shapefile (depends on 4.1)
└── 4.4 Export Progress & History (depends on 4.1)

Epic 5: User Management
├── 5.1 User List (depends on 1.3)
├── 5.2 User Role Management (depends on 5.1)
├── 5.3 User Status Management (depends on 5.1)
└── 5.4 User Profile (depends on 1.3)

Epic 6: Localization
├── 6.1 Arabic RTL Interface (depends on 2.1)
├── 6.2 French LTR Interface (depends on 6.1)
└── 6.3 Localized Feature Names (depends on 2.3)
```

---

## Requirement Traceability

| Story | Requirements Covered |
|-------|---------------------|
| 1.1 | Infrastructure |
| 1.2 | FR-AUTH-005, FR-AUTH-006, FR-AUTH-007 |
| 1.3 | FR-AUTH-001, FR-AUTH-002, FR-AUTH-003, FR-AUTH-004, FR-AUTH-007 |
| 1.4 | FR-AUTH-005, FR-AUTH-006, FR-AUTH-011 |
| 1.5 | FR-AUTH-011 |
| 1.6 | FR-AUTH-003, FR-AUTH-004 |
| 2.1 | FR-MAP-001, FR-MAP-002, FR-MAP-007 |
| 2.2 | FR-LAYR-004, FR-LAYR-008, FR-MAP-010, FR-I18N-001, FR-I18N-002 |
| 2.3 | FR-MAP-001, FR-MAP-003, FR-MAP-004, FR-MAP-008, FR-MAP-009, FR-MAP-011, FR-DATA-001 |
| 2.4 | FR-MAP-001, FR-USER-008 |
| 2.5 | FR-LAYR-009, FR-DATA-006 |
| 2.6 | FR-MAP-002, FR-MAP-005, FR-MAP-011 |
| 2.7 | FR-MAP-003, FR-PERF-004 |
| 3.1 | FR-DRAW-001, FR-DRAW-005, FR-I18N-007 |
| 3.2 | FR-DRAW-002, FR-DRAW-006 |
| 3.3 | FR-DRAW-003, FR-DRAW-006 |
| 3.4 | FR-DRAW-004, FR-USER-008 |
| 3.5 | FR-DRAW-005, FR-USER-008 |
| 4.1 | FR-EXP-001, FR-EXP-004 |
| 4.2 | FR-EXP-002 |
| 4.3 | FR-EXP-003 |
| 4.4 | FR-EXP-004, FR-EXP-005 |
| 5.1 | FR-USER-001, FR-USER-004 |
| 5.2 | FR-USER-004, FR-USER-005 |
| 5.3 | FR-USER-002, FR-USER-006 |
| 5.4 | FR-USER-003, FR-I18N-003 |
| 6.1 | FR-I18N-001, FR-I18N-004 |
| 6.2 | FR-I18N-002 |
| 6.3 | FR-I18N-005, FR-I18N-006 |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Epics** | 6 |
| **Total Stories** | 29 |
| **Estimated Effort** | S: 9, M: 18, L: 2 |
| **Estimated Duration** | 7-11 weeks |
| **Priority P0 (Must Have)** | 18 stories |
| **Priority P1 (Should Have)** | 11 stories |

---

## Recommended Development Order

1. **Epic 1: Foundation & Authentication** (1-2 weeks)
2. **Epic 2: Core Map Features** (2-3 weeks)
3. **Epic 3: Drawing Tools** (1-2 weeks)
4. **Epic 4: Data Export** (1 week)
5. **Epic 5: User Management** (1 week)
6. **Epic 6: Localization** (1 week)

---

**Status:** ✅ Complete
**Next Step:** Run Readiness Check to validate planning completeness.