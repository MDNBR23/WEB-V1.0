# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub is a production-ready, Spanish-language web platform designed for pediatric and neonatal healthcare professionals. It serves as a centralized hub for essential medical resources, offering user management, medical announcements, clinical guidelines, medication information, and specialized medical tools. The platform features a robust backend API with user session management and data isolation, aiming to streamline operations and provide critical support for healthcare providers. The business vision is to become the go-to platform for pediatric and neonatal medical professionals, enhancing clinical decision-making and efficiency within the sector.

## Recent Changes
**November 23, 2025 - Header Optimization & Mobile Layout Redesign (Evening):**
- **Integrated Descriptive Text into Headers (All Pages):**
  - Eliminated redundant banner sections that occupied ~100px of vertical space
  - Moved descriptive subtitles directly into header for cleaner, more compact design
  - Applied to all 7 application pages: main, vademecum, herramientas, turnos, sugerencias, configuracion, admin
  - Desktop: Title and subtitle appear side-by-side in a single line
  - Mobile: Optimized grid layout for efficient space usage

- **Mobile Header Grid Layout (≤768px):**
  - Implemented CSS Grid for optimal horizontal space utilization
  - **Row 1**: Hamburger menu | Clock (centered) | Avatar + Logout button
  - **Row 2**: Full-width title and subtitle
  - Eliminated wasted space next to hamburger button
  - Clock and user controls now share top row for maximum efficiency

- **Clock Display Fix:**
  - Solved flickering/truncation issue when clock updates
  - Applied `font-variant-numeric: tabular-nums` for fixed-width numbers
  - Removed `overflow: hidden` and `text-overflow: ellipsis` that caused clipping
  - Clock now displays fully without dots or visual jitter

- **Mobile User Interface Optimizations:**
  - Username hidden on mobile (shows only avatar + logout button)
  - Reduced avatar size from 32px to 28px for compact layout
  - Adjusted gaps and padding for tighter, more efficient spacing
  - Removed unnecessary borders and margins in mobile view

- **Consistency Across All Pages:**
  - All 7 pages now share identical header structure and behavior
  - Uniform subtitle styling with professional medical descriptions
  - Seamless light/dark theme support maintained

**November 23, 2025 - Mobile UI Fixes (Afternoon):**
- **Turnos (Shifts Calendar) Mobile Fixes:**
  - Fixed bottom navigation bar that was being cut off in mobile devices
  - Adjusted content padding to properly account for safe-area-inset-bottom on iOS/Android
  - Main content now has proper spacing (calc(90px + env(safe-area-inset-bottom))) to prevent overlap

- **Sidebar Mobile Improvements:**
  - Reduced harsh box-shadow from rgba(0,0,0,0.5) to rgba(0,0,0,0.15) for cleaner appearance
  - Improved background with var(--card) and backdrop-filter for professional glass effect
  - Sidebar now looks modern and clean instead of opaque on mobile devices

- **Registration/Login Footer Fix:**
  - Increased auth-wrapper padding-bottom from 140px to 160px (desktop) and 180px to 220px (mobile)
  - Footer no longer overlaps with registration form content
  - Resolved recurring issue with footer positioning on authentication pages

- **Header Button Overflow Fix:**
  - Increased header padding from 12px to 14px vertically
  - "Salir" button now fits properly within header bounds
  - Fixed visual overflow issue affecting all pages

- **Sidebar Mobile Scroll Lock:**
  - Added body scroll prevention when sidebar is open on mobile devices
  - Blocks background scrolling to improve user experience
  - Automatically scrolls to top when sidebar opens to ensure content visibility
  - Automatically restores scroll when sidebar closes or when clicking overlay/links

**November 23, 2025 - Mobile-First UI Redesign & Corrections (Morning):**
- **Login Page Redesign (index.html):**
  - Implemented modern mobile-first design with circular MTH logo
  - Added "Bienvenido" welcome title with professional medical subtitle: "Accede a herramientas médicas especializadas en pediatría y neonatología"
  - Created tab navigation system (Iniciar sesión / Nuevo usuario)
  - Clean, minimal form design with placeholders and labeled fields
  - Responsive design optimized for both iOS and Android devices
  - Complete legal footer with 4 links: Cookies, Política de Privacidad, Términos y Condiciones, Aviso Legal
  - Maintained all existing authentication functionality and compatibility with script.js
  
- **Shifts Calendar Redesign (turnos.html):**
  - Added mobile bottom navigation bar with Calendar, Reports, Shifts, and More sections
  - Removed forced dark theme styles - now adapts naturally to user's theme preference (light/dark)
  - Clean, card-based design that matches medical platform aesthetic
  - Enhanced responsive design for better mobile usability on iOS and Android
  - Preserved all existing shift management functionality (calendar, statistics, PDF export, multi-currency)
  - Improved visual hierarchy with professional UI elements

**November 21, 2025 - Session Persistence Fix:**
- **Problem Fixed:** Users were losing their sessions after server restarts, preventing them from viewing their created shifts
- **Root Cause:** Sessions were stored in memory (default express-session behavior) and were lost on every server restart
- **Solution Implemented:**
  - Installed `session-file-store` package
  - Configured express-session to use FileStore for persistent session storage
  - Sessions now saved to `data/sessions/` directory with 24-hour TTL
  - Sessions persist across server restarts, ensuring users can access their shifts consistently
- **Impact:** Users can now reliably view their created shifts in the calendar without authentication issues

**November 18, 2025 - UI/UX Optimization and Multi-Currency Implementation:**
- **Visual Optimizations:**
  - Optimized summary cards for space efficiency: reduced min-width (200px→140px), padding (20px→14px), and font sizes (value 32px→24px, label 13px→11px)
  - Enhanced Statistics tab with visual hierarchy: added accent border separators, wrapped filters in background container, consistent 18px section headers
  - Optimized PDF export for single-page layout: reduced margins (40/60→30/30), smaller fonts (header 26→18, body 10→8), tighter spacing and cell padding
  - Added hover effects to summary cards with transform and shadow for better interaction feedback

- **IMPLEMENTED COMPLETE multi-currency support** (frontend code existed, backend was missing):
  - Added `currency` VARCHAR(3) field to shifts table with DEFAULT 'COP'
  - Updated `createShift` and `updateShift` endpoints to persist currency field (PostgreSQL + JSON fallback)
  - Refactored `getSummary` endpoint to GROUP BY currency and entity, returning separate totals per currency
  - Implemented JSON fallback with identical multi-currency grouping logic for offline resilience
  - Calendar summary cards now show separate OPS/Nómina/Total cards for each currency (e.g., "OPS (COP)", "OPS (EUR)")
  - Statistics tab displays independent totals per currency with proper labeling
  - PDF export generates separate sections per currency with headers when multiple currencies are used
  - Single currency mode displays clean labels without redundant currency tags
  - All monetary values remain as whole numbers (no decimals)

**Previous November 2025 - Shift Management Improvements:**
- Fixed timezone issue in bulk shift creation where selecting Monday-Friday would create Tuesday-Saturday shifts due to UTC/local time conversion
- Reorganized bottom action menus to prevent overlap on smaller screens using responsive grid layouts

## User Preferences
None recorded yet.

## System Architecture
Med Tools Hub is built with a focus on simplicity, security, and performance using a pure web stack.

### UI/UX Decisions
- **Design:** Modern professional theme with a slate grey color scheme in light mode and purple accents in dark mode. Features enhanced contrast, clear typography, accessible color palettes (WCAG AA compliant), and a redesigned, responsive authentication box.
- **Navigation:** Smooth page transitions, a collapsible sidebar with persistent icons and titles, and a modern circular toggle button.
- **Responsiveness:** Optimized for various screen sizes; all input fields use 16px font-size to prevent automatic zoom on mobile devices.
- **Theming:** Supports light and dark modes with smooth CSS transitions.
- **Mobile Optimization:** Includes safe area insets for iPhone notches, touch-optimized scrolling, and proper viewport configuration for iOS and Android.

### System Design Choices
- **Code Architecture:** Modular MVC design with a clean separation of concerns.
  - **Structure:** `src/config/`, `src/services/`, `src/middleware/`, `src/controllers/`, `src/routes/`, and a streamlined `server.js`.
  - **Benefits:** Improved maintainability, testability, and scalability; each module has a single responsibility.
- **Technical Implementations:**
  - **Frontend:** Pure HTML5, CSS3, and vanilla JavaScript.
  - **Backend:** Node.js with Express.js, implementing a RESTful API.
  - **Authentication:** Session-based using `express-session`, `bcrypt` for password hashing, and role-based access control. Email verification is mandatory, followed by admin approval for new users.
  - **Data Isolation:** User-specific data is isolated, while global content is shared.
  - **Email Service:** Integrated SMTP for account verification, password recovery, and security notifications.
  - **Medical Tools:** Includes a text space corrector, arterial blood gas analyzer, clinical evolution notes template system, infusion calculator, drug interaction checker, and an interactive shift calendar.
  - **Infusion Calculator:** Calculates medication volumes, diluent, and flow rates based on patient parameters and admin-managed medications.
  - **Medical Shift Management:** Comprehensive shift scheduling tool with CRUD operations, financial summaries, PDF export, multi-currency support, dual-mode bulk creation, and automatic OPS (Obra Social Provincial) shift generation. Features 7 integrated tabs for various functionalities.
  - **AI Medical Integration:** TinyLlama via Ollama for local, privacy-focused medical AI assistance with streaming responses.
- **Feature Specifications:**
  - **Authentication:** User registration with email verification and admin approval, login, logout, password reset, and session management.
  - **User Management (Admin):** Approve/reject registrations, edit profiles, manage user status, and view users.
  - **Account Deletion:** User-initiated account deletion with password confirmation.
  - **User Activity Tracking:** Real-time online status and last login tracking with inactive session timeout.
  - **Content Management:** Create, edit, delete announcements and clinical guides (global/personal).
  - **Medication Database:** Shared, admin-editable database with real-time search.
  - **Profile Customization:** User profile updates with avatar upload.
  - **Template System:** Global and personal templates for clinical notes with filtering and search.
  - **Admin Notifications:** Badges for pending actions with real-time updates and sound notifications.
  - **Maintenance Mode:** Admin-controlled system-wide maintenance mode.
  - **Legal Footer:** Comprehensive legal disclaimer.
- **Data Storage:** File-based JSON storage, designed for scalability to PostgreSQL.
- **API Endpoints:** Comprehensive set of RESTful API endpoints.
- **URL Structure:** Clean URLs without `.html` extensions using Express middleware and 301 redirects.
- **Deployment:** Optimized for Replit's autoscale deployment.

## External Dependencies
- **Hostinger SMTP:** Used for secure email communication (password resets, account verification, notifications).
- **Ollama:** Local LLM server integrated for TinyLlama AI functionalities. Requires `OLLAMA_HOST` and `OLLAMA_MODEL` environment variables.