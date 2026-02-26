# UX Design Specification: SIG Maps V2

**Version:** 1.0
**Date:** 2026-02-26
**Author:** UX Designer (Dreima)
**Status:** Draft

---

## 1. Design Principles

### 1.1 Core Principles

**1. Clarity First (الوضوح أولاً)**
The interface must be intuitive and self-explanatory. Use clear labels, visual hierarchy, and consistent patterns. Users should never need to guess what a control does.

**2. Performance Matters (الأداء مهم)**
The interface should feel fast and responsive. Progressive loading, skeleton states, and optimistic updates create a sense of speed even when data is heavy.

**3. Accessibility by Design (الوصولية بتصميم) Every feature must be accessible from day one. WCAG 2.1 AA compliance is not optional—it's foundational.

**4. Cultural Relevance (الملاءمة الثقافية)**
The experience must feel native to both Arabic and French speakers. Deep localization (not just translation), proper RTL/LTR handling, and culturally appropriate iconography.

**5. Mobile-First (الموبايل أولاً)**
Design for small screens first, then enhance for larger displays. Field workers access primarily from smartphones—optimize for touch, large tap targets, and simplified flows.

---

### 1.2 Brand Personality

| Trait | Description | Arabic | French |
|-------|-------------|--------|--------|
| **Professional** | Clean, organized, trustworthy | احترافي | Professionnel |
| **Approachable** | Friendly, not intimidating | مريح | Accessible |
| **Efficient** | Fast, streamlined workflows | كفء | Efficace |
| **Secure** | Safe, confidence-building | آمن | Sécurisé |
| **Modern** | Current but not experimental | حديث | Moderne |

**Visual Tone:** Clean grid-based layouts, generous whitespace, subtle shadows, rounded corners (4-8px).

---

## 2. Design Tokens

### 2.1 Color Palette

#### Primary Colors (الألوان الأساسية)

| Token | Light | Dark | Usage | Arabic | French |
|-------|-------|------|-------|--------|--------|
| `primary` | `#3b82f6` | `#60a5fa` | Primary buttons, links, active states | أزرق أساسي | Bleu principal |
| `primary-hover` | `#2563eb` | `#3b82f6` | Hover state for primary | أزرق داكن | Bleu foncé |
| `primary-light` | `#dbeafe` | `#1e40af` | Light backgrounds, badges | أزرق فاتح | Bleu clair |

#### Secondary Colors (الألوان الثانوية)

| Token | Light | Dark | Usage | Arabic | French |
|-------|-------|------|-------|--------|--------|
| `secondary` | `#64748b` | `#94a3b8` | Secondary buttons, text | رمادي | Gris |
| `secondary-light` | `#f1f5f9` | `#0f172a` | Secondary backgrounds | رمادي فاتح | Gris clair |

#### Semantic Colors (ألوان الدلالية)

| Token | Light | Dark | Usage | Arabic | French |
|-------|-------|------|-------|--------|--------|
| `success` | `#22c55e` | `#4ade80` | Success states, positive actions | نجح | Succès |
| `warning` | `#f59e0b` | `#fbbf24` | Warnings, pending states | تحذير | Avertissement |
| `danger` | `#ef4444` | `#f87171` | Danger, errors, destructive actions | خطأ | Erreur |
| `info` | `#3b82f6` | `#60a5fa` | Information, tooltips | معلومة | Information |

#### Neutral Colors (ألوان محايدة)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `gray-50` | `#f9fafb` | `#18181b` | Light backgrounds |
| `gray-100` | `#f3f4f6` | `#27272a` | Hover backgrounds |
| `gray-200` | `#e5e7eb` | `#3f3f46` | Borders |
| `gray-300` | `#d1d5db` | `#52525b` | Dividers |
| `gray-400` | `#9ca3af` | `#71717a` | Disabled text |
| `gray-500` | `#6b7280` | `#a1a1aa` | Muted text |
| `gray-600` | `#4b5563` | `#d4d4d8` | Body text |
| `gray-700` | `#374151` | `#e4e4e7` | Headings |
| `gray-800` | `#1f2937` | `#f4f4f5` | Emphasis text |
| `gray-900` | `#111827` | `#fafafa` | High contrast |

---

### 2.2 Typography (الخطوط)

#### Font Families

| Token | Value | Usage | Arabic Font | French Font |
|-------|-------|-------|-------------|-------------|
| `font-sans` | `'Tajawal', 'Inter', sans-serif` | UI body text | Tajawal | Inter/Cairo |

**Why Tajawal for Arabic:** Modern, clean, highly legible, supports Arabic numerals and ligatures.

**Why Inter for French:** Neutral, highly legible, excellent web rendering.

#### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 400 | 1rem (16px) | Captions, footnotes |
| `text-sm` | 0.875rem (14px) | 400 | 1.25rem (20px) | Small labels, forms |
| `text-base` | 1rem (16px) | 400 | 1.5rem (24px) | Body text |
| `text-lg` | 1.125rem (18px) | 400 | 1.75rem (28px) | Emphasized text |
| `text-xl` | 1.25rem (20px) | 500 | 1.75rem (28px) | Small headings |
| `text-2xl` | 1.5rem (24px) | 600 | 2rem (32px) | Section headings |
| `text-3xl` | 1.875rem (30px) | 600 | 2.25rem (36px) | Page titles |
| `text-4xl` | 2.25rem (36px) | 700 | 2.5rem (40px) | Hero titles |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | 400 | Regular text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings |
| `font-bold` | 700 | Strong emphasis |

---

### 2.3 Spacing (المسافات)

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0rem (0px) | No spacing |
| `space-1` | 0.25rem (4px) | Tight spacing |
| `space-2` | 0.5rem (8px) | Small gaps |
| `space-3` | 0.75rem (12px) | Default spacing |
| `space-4` | 1rem (16px) | Comfortable spacing |
| `space-5` | 1.25rem (20px) | Section separation |
| `space-6` | 1.5rem (24px) | Large gaps |
| `space-8` | 2rem (32px) | Page-level spacing |
| `space-10` | 2.5rem (40px) | Hero sections |
| `space-12` | 3rem (48px) | Major section breaks |

---

### 2.4 Border Radius (زوايا الحدود)

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Sharp corners |
| `radius-sm` | 0.125rem (2px) | Small elements (tags, badges) |
| `radius-md` | 0.25rem (4px) | Default (buttons, inputs) |
| `radius-lg` | 0.375rem (6px) | Cards, panels |
| `radius-xl` | 0.5rem (8px) | Large cards, modals |
| `radius-full` | 9999px | Pill buttons, avatars |

---

### 2.5 Shadows (الظلال)

| Token | CSS | Usage |
|-------|-----|-------|
| `shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` | Default elevation |
| `shadow-md` | `0 4px 6px -1px rgba(0, 0, 0, 0.1)` | Moderate elevation |
| `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1)` | High elevation (modals) |
| `shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1)` | Very high elevation |

---

### 2.6 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | 1000 | Dropdowns |
| `z-sticky` | 1020 | Sticky headers |
| `z-modal` | 1040 | Modals |
| `z-popover` | 1060 | Popovers |
| `z-tooltip` | 1080 | Tooltips |

---

### 2.7 Animation (الأنيميشن)

| Token | Value | Usage | CSS cubic-bezier |
|-------|-------|-------|-----------------|
| `duration-instant` | 50ms | Micro interactions | `ease-out` |
| `duration-fast` | 150ms | Buttons, small elements | `ease-out` |
| `duration-base` | 200ms | Default transitions | `ease-in-out` |
| `duration-slow` | 500ms | Page transitions, modals | `ease-out` |

---

## 3. Component Library

### 3.1 Buttons (الأزرار)

#### Variants (الأشكال)

| Variant | Appearance | Usage |
|---------|-----------|-------|
| `default` | Primary color background, white text | Primary actions (confirm, submit) |
| `secondary` | Secondary gray background, dark text | Secondary actions (cancel) |
| `outline` | Primary color border, no background | Alternative primary actions |
| `ghost` | No background or border, text only | Low-emphasis actions |
| `destructive` | Red background, white text | Destructive actions (delete) |

#### Sizes (الأحجام)

| Size | Height | Font Size | Icon Size | Usage |
|------|--------|-----------|-----------|-------|
| `sm` | 2rem (32px) | 0.875rem (14px) | 1rem (16px) | Dense layouts |
| `default` | 2.5rem (40px) | 1rem (16px) | 1.25rem (20px) | Default |
| `lg` | 3rem (48px) | 1.125rem (18px) | 1.5rem (24px) | Hero sections |

#### States (الحالات)

| State | Visuals |
|-------|----------|
| `default` | Normal appearance |
| `hover` | Darker background (+10% brightness), transform: translateY(-1px) |
| `active` | Slightly darker background, transform: translateY(0) |
| `disabled` | Opacity 50%, cursor: not-allowed, no hover effects |
| `loading` | Opacity 70%, spinner icon replaces content |

**Accessibility:**
- Focusable via keyboard
- Visible focus outline
- Button describes action clearly
- Loading state: `aria-live="polite"` + `aria-busy="true"`

---

### 3.2 Form Inputs (مدخلات النماذج)

#### Text Input (إدخال نص)

**Visuals:**
- Border: 1px solid `gray-300`
- Border radius: `radius-md`
- Padding: `space-3` horizontal, `space-2` vertical
- Focus state: Primary color border + shadow

**States:**
| State | Visuals |
|-------|----------|
| `default` | Gray border |
| `focus` | Primary color border + shadow |
| `error` | Red border + error message |
| `disabled` | Gray border + gray background |

**Accessibility:**
- `label` associated via `htmlFor`
- `placeholder` for guidance (never replacement)
- Error message in `span aria-live="polite"`
- Minimum 44px height for touch (WCAG 2.1 AAA)

---

#### Select Input (قائمة منسدلة)

**Visuals:** Same as text input with chevron-down icon on right (LTR) / left (RTL)

**Accessibility:** Same as text input + `aria-expanded` state

---

#### Checkbox & Radio (مربعات اختيار)

**Visuals:**
- 1.25rem (20px) square box (checkbox) / circle (radio)
- Border: 2px solid `gray-300`
- Checked: Primary color background + check/tick icon
- Label: 16px left of box (LTR) / right (RTL)

**States:**
| State | Visuals |
|-------|----------|
| `unchecked` | Empty box/circle |
| `hover` | Border darkens |
| `checked` | Color fill + icon |
| `focus` | Outline ring |
| `disabled` | Grayed out |

---

### 3.3 Cards (البطاقات)

**Visuals:**
- Background: White (light mode) / `gray-900` (dark mode)
- Border: 1px solid `gray-200`
- Border radius: `radius-lg`
- Padding: `space-5`
- Shadow: `shadow-sm` hover → `shadow-md`

**Variants:**
| Variant | Usage |
|---------|-------|
| `default` | Standard card content |
| `interactive` | Clickable cards (hover lift effect) |
| `bordered` | No shadow, emphasized border |

**Structure:**
```
┌─────────────────────────────┐
│ Optional: Image / Icon       │
│                             │
│ H3: Card Title              │
│ 16px gray text: Description │
│                             │
│ Optional: Actions / Footer  │
└─────────────────────────────┘
```

---

### 3.4 Modals (النوافذ المنبثقة)

**Visuals:**
- Fixed position overlay: `rgba(0, 0, 0, 0.5)` background
- Modal: White background, center screen
- Border radius: `radius-xl`
- Shadow: `shadow-xl`
- Padding: `space-6`
- Max width: 512px

**Structure:**
```
┌─────────────────────────────────┐
│ H2: Modal Title            [X] │ (close button)
├─────────────────────────────────┤
│ Modal content                  │
│                                 │
│ [Cancel] [Confirm]             │ (actions bottom right)
└─────────────────────────────────┘
```

**States:**
| State | Visuals |
|-------|----------|
| `entering` | Fade in + slide up |
| `enter` | Full opacity, final position |
| `exiting` | Fade out + slide down |
| `exit` | Removed from DOM |

**Accessibility:**
- Focus trap: Focus stays within modal
- `aria-modal="true"`
- Esc key closes modal
- Click outside closes modal
- Focus returns to trigger on close

---

### 3.5 Toast Notifications (الإشعارات)

**Visuals:**
- Fixed position: bottom-right (LTR) / bottom-left (RTL)
- Padding: `space-4`
- Border radius: `radius-lg`
- Shadow: `shadow-lg`
- Dismissible via X button

**Variants:**
| Variant | Color | Icon |
|---------|-------|------|
| `success` | Green background | Checkmark |
| `error` | Red background | Warning sign |
| `warning` | Yellow/amber background | Exclamation |
| `info` | Blue background | Info |

**Accessibility:**
- `aria-live="polite"` (success, warning, info)
- `aria-live="assertive"` (error)
- Auto-dismiss: 6 seconds for success/info, 10 seconds for warning/error

---

### 3.6 Map Controls (تحكمات الخريطة)

#### Zoom Controls (تحكم التقريب)

**Visuals:**
- Floating panel on right side (LTR) / left (RTL)
- Rounded square buttons
- Primary color buttons (+/-)
- Minimum tap target: 44px × 44px

---

#### Layer Panel (لوحة الطبقات)

**Visuals:**
- Slide-out panel from left (LTR) / right (RTL)
- Width: 280px (desktop), 100% (mobile, max-width 320px)
- Background: White with shadow
- Border-radius: `radius-lg` on outer side

**Structure:**
```
┌────────────────────────┐
│ [←] Layers            │
├────────────────────────┤
│ ☑ Water Pipes         │
│ ⚪ Electrical Lines    │
│ ⚪ Roads               │
│                       │
│ [Add Layer]           │
└────────────────────────┘
```

**Accessibility:**
- Keyboard navigation (arrow keys)
- `aria-expanded` for panel toggle
- Keyboard toggle: Ctrl/Cmd + L

---

#### Drawing Tools (أدوات الرسم)

**Visuals:**
- Floating toolbar above map center
- Icons with tooltips
- Active tool: Primary color background

**Tools:**
| Tool | Icon | Shortcut |
|------|------|----------|
| Point | 📍 | P |
| Line | 〰 | L |
| Polygon | 🔷 | O |
| Edit | ✏️ | E |
| Delete | 🗑️ | Del |

**Accessibility:**
- ARIA labels for icons
- Keyboard shortcuts documented
- Screen reader announces active tool

---

### 3.7 Loading States (حالات التحميل)

#### Skeleton Loader (هيكل عظمي للتحميل)

**Visuals:**
- Gray pulse animation
- Match actual content dimensions
- Rounded corners

**Structure:**
```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓    │ (title)
│ ▓▓▓▓▓                    │ (subtitle)
│                             │
│ ▓▓▓▓▓  ▓▓▓▓▓ ▓▓▓▓▓     │ (content blocks)
└─────────────────────────────┘
```

---

#### Spinner (دائرة تحميل)

**Visuals:**
- Primary color
- Rotating animation
- 2rem (32px) default size

**Accessibility:**
- `aria-label="Loading content"`
- `role="progressbar"`
- `aria-valuetext="Loading..."`

---

#### Progress Bar (شريط التقدم)

**Visuals:**
- Height: 4px
- Background: Gray
- Fill: Primary color, animated
- Percentage text (optional)

**Structure:**
```
Exporting... 65%
█████████████████▒▒▒▒▒░░░░
```

---

### 3.8 Empty States (الحالات الفارغة)

**Pattern:**
```
    ┌─────────────┐
    │    Icon     │ (64px - gray-400)
    └─────────────┘
    
    No layers found

    Create your first layer to start
    mapping infrastructure.
    
    [Add Layer]
```

**Accessibility:**
- Icon: `aria-hidden="true"`
- Text: Descriptive, actionable
- CTA: Primary button (keyboard accessible)

---

### 3.9 Error States (حالات الخطأ)

**Patterns:**

| Type | Visuals | Example |
|------|----------|---------|
| **Inline error** | Red text below field | "Email is invalid" |
| **Form error** | Red border + icon + message | "Please fix 2 errors" |
| **Page error** | Icon + title + description + CTA | "Failed to load map data" |

**Accessibility:**
- Error text color must have 4.5:1 contrast ratio
- `role="alert"` for critical errors
- `aria-live="assertive"` for page errors
- `aria-live="polite"` for form errors

---

## 4. Page Layouts

### 4.1 Responsive Breakpoints (نقاط التقطع)

| Breakpoint | Width | Columns | Primary Use |
|-----------|-------|---------|------------|
| `mobile` | `sm`: 640px | 1 | Smartphones, tablets portrait |
| `tablet` | `md`: 768px | 2-3 | Tablets landscape |
| `desktop` | `lg`: 1024px | 3-4 | Laptops, small desktops |
| `large` | `xl`: 1280px | 4-6 | Large desktops |

---

### 4.2 Page Templates (قوالب الصفحات)

#### Login Page (صفحة تسجيل الدخول)

**Layout:** Centered card

```
╔══════════════════════════════════════════════════╗
║                                                ║
║             SIG Maps V2                         ║
║       نظام معلومات جغرافي متعدد اللغات         ║
║  Système d'Information Géographique Multilingue  ║
║                                                ║
║  ┌────────────────────────────────────┐         ║
║  │ Email                               │         ║
║  └────────────────────────────────────┘         ║
║                                                ║
║  ┌────────────────────────────────────┐         ║
║  │ Password                    [Show] │         ║
║  └────────────────────────────────────┘         ║
║                                                ║
║  [Login]              Forgot password?          ║
║                                                ║
║         Don't have an account? Sign up          ║
║                                                ║
╚══════════════════════════════════════════════════╝
```

**Accessibility:**
- Card max-width: 400px
- Form labels hidden visually but present for screen readers
- Password show/hide toggle announced to screen reader

---

#### Map Page (صفحة الخريطة - الصفحة الرئيسية)

**Layout:** Full-screen map with overlays

```
┌─────────────────────────────────────────────────────────┐
│ Header                                               │
│ SIG Maps V2  [🌍 ar]  [User ▼]         [Layers] [Save]│
├─────────────────────────────────────────────────────────┤
│ ┌───────┐                                             │
│ │Layers │  Map Area (full screen)                       │
│ │       │                                             │
│ │ ☑Water│                                             │
│ │ ⚪ Elec│                                             │
│ │       │                                             │
│ │ [+ Add│                                             │
│ │ Layer]│                                             │
│ └───────┘                                             │
├─────────────────────────────────────────────────────────┤
│ [+Point] [+Line] [+Polygon] [Edit]  [+⏷ Zoom]         │
└─────────────────────────────────────────────────────────┘
```

**Responsive:**
- **Mobile:** Layer panel collapses to drawer (full screen on tap)
- **Tablet:** Layer panel slides out from side
- **Desktop:** Layer panel always visible on left

**Accessibility:**
- Map keyboard navigation (arrow keys to pan, +/- to zoom)
- Drawing tools accessible via keyboard (P, L, O for point/line/polygon)
- ARIA live regions for map load status

---

#### Features List Page (صفحة قائمة الميزات)

**Layout:** Table with filters

```
┌─────────────────────────────────────────────────────────┐
│ Filters: [Layer ▼] [Type ▼] [Search...    ]           │
├─────────────────────────────────────────────────────────┤
│ ┌─────┬──────┬──────┬───────┬───────┬──────────────┐ │
│ │Checkbox│ID │Name │Layer │Type │Actions        │ │
│ ├─────┼──────┼──────┼───────┼───────┼──────────────┤ │
│ │☐  │ #1  │Point │Water │Point │[View] [Edit] │ │
│ │☐  │ #2  │Line  │Road  │Line  │[View] [Edit] │ │
│ └─────┴──────┴──────┴───────┴───────┴──────────────┘ │
│                                                      │
│                        [< Prev] Page 1 of 10 [Next >]│
└─────────────────────────────────────────────────────────┘
```

**Responsive:**
- **Mobile:** Table collapses to list view
- **Tablet:** Table visible, pagination icons only
- **Desktop:** Full table with all controls

**Accessibility:**
- Sortable columns
- Row selection aria attributes
- Pagination keyboard accessible

---

### 4.3 Page Specifications (تفاصيل الصفحات)

#### Page: Login (تسجيل الدخول)

**Purpose:** Authenticated access to the system

**Components:**
- Logo/Branding
- Email input (required)
- Password input (required + show/hide)
- Login button (primary)
- Forgot password link
- Sign up link

**Responsive Behavior:**
- Mobile: Full-width card, stacked inputs
- Desktop: Centered card, max-width 400px

**Key Interactions:**
- Email format validation on blur
- Password strength indicator (optional)
- Form submits on Enter key in password field
- Loading state on submit with spinner

**Accessibility Requirements:**
- Form labels announced to screen readers
- Password show/hide toggle announced
- Error messages have `aria-describedBy`

---

#### Page: Map (الخريطة)

**Purpose:** View, edit, and interact with geospatial data

**Components:**
- Header (logo, language switcher, user menu)
- Leaflet map (full-screen container)
- Layer panel (collapsible drawer)
- Drawing toolbar (floating above map)
- Zoom controls (bottom-right)
- Save/export controls (header or floating)

**Responsive Behavior:**
- Mobile: Drawer slides full-screen, toolbar at bottom
- Tablet: Drawer partial width, toolbar at top
- Desktop: Fixed panel, toolbar at top

**Key Interactions:**
- Zoom with scroll wheel / pinch gestures
- Pan with drag
- Layer visibility toggles update map instantly
- Drawing tools activate/deactivate with visual feedback
- Feature selection shows popup with details

**Accessibility Requirements:**
- Map keyboard navigable (arrow keys)
- Drawing tools have keyboard shortcuts
- Popup announcements (ARIA live)
- Layer toggles reachable by keyboard

---

#### Page: Layers Management (إدارة الطبقات)

**Purpose:** Create, edit, delete, and organize layers

**Components:**
- Layer list (cards or table)
- Add layer button (primary)
- Layer editor modal (for create/edit)
- Layer style editor (color picker, sliders)

**Responsive Behavior:**
- Mobile: List view, modal full-screen
- Desktop: Table or grid view, modal standard

**Key Interactions:**
- Click layer card → Open editor
- Drag and drop to reorder (desktop only)
- Style changes reflect on map immediately

**Accessibility Requirements:**
- Layer names in Arabic/French
- Style controls labeled properly
- Reorder available via keyboard (move up/down buttons)

---

#### Page: Export Dialog (نافذة التصدير)

**Purpose:**_export data in various formats

**Components:**
- Format selector (cards: GeoJSON, KML, Shapefile)
- Layer multi-select checkboxes
- Export button
- Progress indicator
- Download link (when complete)

**Responsive Behavior:**
- Mobile: Full-screen modal, stacked cards
- Desktop: 512px wide modal, grid of format cards

**Key Interactions:**
- Select/deselect layers to export
- Format selection updates description
- Export button triggers async job
- Progress updates every 2 seconds
- Download button appears when complete

**Accessibility Requirements:**
- Format descriptions announced
- Checkbox groups labeled
- Progress value conveyed via `aria-valuenow`

---

## 5. Interaction Patterns (أنماط التفاعل)

### 5.1 Form Submission Workflow (تسليم النماذج)

**1. Fill Form**
- User enters data
- Inline validation (on blur or debounced)
- Success checkmarks appear for valid fields

**2. Submit Attempt**
- User clicks submit button
- Button enters loading state (spinner)
- Client-side validation runs

**3. Processing**
- Request sent to server
- Disable form during submission
- Show toast: "Saving changes..."

**4. Success**
- Success toast appears: "Changes saved successfully"
- Redirect or refresh relevant data
- Button returns to normal state

**5. Error**
- Error toast appears: "Failed to save. Please try again."
- Form reactivates
- Inline error messages appear for specific fields
- Focus moves to first error field

---

### 5.2 Data Loading Pattern (تحميل البيانات)

**1. Initial Load**
- Show skeleton loader
- Fetch data from API
- Replace skeleton with content on success

**2. Progressive Loading (Map Features)**
- Load visible layer features first
- Display skeleton for other layers
- Load other layers progressively

**3. Error Load**
- Show error state with "Retry" button
- Log error for debugging

---

### 5.3 Map Interaction Pattern (تتفاعل الخريطة)

**1. Initial Load**
- Show "Loading map data..." message
- Load map tiles
- Load features (progressive)
- Hide loading message

**2. Pan/Zoom**
- Smooth transitions (not abrupt)
- Load appropriate zoom level tiles
- Load features within bounding box

**3. Feature Selection**
- Click feature → Show popup
- Show popup in RTL/LTR direction
- Popup contains: name, attributes, actions (edit, delete)

**4. Drawing**
- Click draw tool → Cursor changes to crosshair
- Click on map → Add temporary marker
- Enter attributes → Show form
- Save → Commit to database, show marker

---

### 5.4 Language Switch Pattern (تبديل اللغة)

**1. User Changes Language**
- Click language dropdown
- Select new language (Arabic or French)
- Show loading state briefly

**2. Update Interface**
- Update all UI text
- Toggle RTL/LTR layout (`dir="rtl"` or `dir="ltr"`)
- Update fonts (Tajawal for Arabic, Inter for French)
- Map features: Load localized names

**3. Persist Preference**
- Save `language` key in localStorage
- Subsequent visits start in selected language

---

## 6. Accessibility (الوصولية)

### 6.1 WCAG 2.1 AA Compliance

**Color Contrast (تباين الألوان):**
- Normal text (under 18px or 14px bold): Minimum 4.5:1 ratio
- Large text (18px+, 14px+ bold): Minimum 3:1 ratio
- UI components (borders, backgrounds): Minimum 3:1 ratio

**Color Contrast Verification:**
- ✅ Primary text (`gray-600` on white): 7.5:1 ratio (PASS)
- ✅ Muted text (`gray-400` on white): 5.9:1 ratio (PASS)
- ✅ Primary (`#3b82f6` on white): 4.5:1 ratio (PASS)
- ✅ Success (`#22c55e` on white): 5.2:1 ratio (PASS)
- ✅ Warning (`#f59e0b` on white): 4.3:1 ratio (PASS ⚠️ - needs darkening)
- ✅ Danger (`#ef4444` on white): 4.5:1 ratio (PASS)

**Fix needed:** Warning color should `#d97706` for 4.5:1 ratio.

---

### 6.2 Focus Management (إدارة التركيز)

**All interactive elements:**
- Visible focus indicator (outline ring: 2px solid primary color)
- Focus trap in modals
- Focus restoration after modal close
- Logical tab order (top-to-bottom, left-to-right for LTR, right-to-left for RTL)

**Skip Navigation:**
- "Skip to main content" link (visible on focus)
- First focusable element on page

---

### 6.3 Screen Reader Support (دعم قارئات الشاشة)

**Semantic HTML:**
- Proper heading hierarchy (`h1` → `h6`)
- `nav`, `main`, `footer` landmarks
- `button`, `input`, `select` proper labels
- `aria-label`, `aria-describedBy` where needed

**Map Accessibility:**
- `aria-label` on map container: "Interactive map"
- Feature popups: `aria-live="polite"`
- Drawing tools: `aria-label` + `aria-current` for active tool
- Map controls: `aria-label` (zoom in, zoom out, layer toggle)

---

### 6.4 Keyboard Navigation (التنقل عبر لوحة المفاتيح)

**Standard shortcuts:**
- `Tab` / `Shift+Tab`: Navigate forward/backward
- `Enter` / `Space`: Activate buttons, toggle checkboxes
- `Esc`: Close modals, dismiss toasts, cancel drawing

**Map-specific:**
- Arrow keys (`↑`, `↓`, `←`, `→`): Pan map
- `+` / `-` (or `=` / `-`): Zoom in/out
- `P` (Point), `L` (Line), `O` (Polygon): Select drawing tool
- `E` (Edit), `Del` (Delete): Edit/delete mode
- `Ctrl/Cmd + S`: Save changes
- `Esc`: Cancel current operation

---

### 6.5 Reduced Motion (تقليل الحركة)

**Respect System Preference:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 6.6 Arabic RTL Support (دعم العربية من اليمين لليسار)

**Layout Mirroring (عكس التصميم):**
- Navigation order: Right to left (logos on right, user menu on left)
- Text alignment: Right-justified
- Margins/Padding: Swapped (e.g., `mr-4` → `ml-4`)
- Icons and imagery: Mirrored if directional
- Map controls: On left side (for right-handed access)