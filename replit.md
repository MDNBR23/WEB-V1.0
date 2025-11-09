# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub is a production-ready, Spanish-language web platform for pediatric and neonatal healthcare professionals. It centralizes essential resources, offering user management, medical announcements, clinical guidelines, medication information, and specialized medical tools. The platform features a robust backend API with user session management and data isolation, aiming to streamline operations and provide critical support for healthcare providers. The business vision is to become the go-to platform for pediatric and neonatal medical professionals, enhancing clinical decision-making and efficiency.

## User Preferences
None recorded yet.

## System Architecture
Med Tools Hub is built with a focus on simplicity, security, and performance using a pure web stack.

### UI/UX Decisions
- **Design:** Modern professional theme with slate grey color scheme in light mode and purple accents in dark mode. Enhanced contrast, clear typography, and accessible color palettes (WCAG AA compliant). Features a redesigned authentication box with modern styling and responsive design.
- **Navigation:** Smooth page transitions, a collapsible sidebar with persistent icons and title, and a modern circular toggle button.
- **Responsiveness:** Optimized for various screen sizes, ensuring a consistent user experience. All input fields use 16px font-size to prevent automatic zoom on mobile devices (iOS/Android).
- **Theming:** Supports both light and dark modes with smooth CSS transitions. Light mode uses slate grey (#475569, #64748b) for a professional appearance.
- **Mobile Optimization:** Safe area insets for iPhone notches, touch-optimized scrolling, and proper viewport configuration for iOS and Android devices.

### Technical Implementations
- **Frontend:** Pure HTML5, CSS3, and vanilla JavaScript for a lightweight and fast client-side experience.
- **Backend:** Node.js with Express.js implementing a RESTful API.
- **Authentication:** Session-based authentication using `express-session`, secure password hashing with `bcrypt` (10 rounds), and role-based access control (admin/user).
- **Data Isolation:** User-specific data (announcements, guides) is isolated, while global content (medications, admin-created guides/announcements) is shared.
- **Email Service:** Integrated SMTP email service using Hostinger for account verification, password recovery, password change notifications, user approval notifications, and account deletion confirmations. Configured with secure credentials stored in environment variables. Password recovery uses 6-digit codes with 10-minute expiration. All email URLs are dynamically generated from request context to ensure compatibility across all deployment environments. Users receive security notifications when their password is changed.
- **Medical Tools:** Includes a text space corrector, an interactive arterial blood gas analyzer, a template system for clinical evolution notes, an infusion calculator, a drug interaction checker, and an interactive shift calendar.
- **Infusion Calculator:** Calculates medication volumes, diluent, and flow rates based on patient parameters and medication presentations. Supports multiple dosing units with automatic unit conversion and precise medical orders. Uses exclusively admin-managed medications.
- **Medical Shift Management:** Integrated shift scheduling tool with comprehensive shift tracking, financial summaries, and automatic OPS shift generation. Features include:
  - Create, edit, and delete shifts with entity tracking
  - Filter shifts by date range
  - Monthly summary with totals by entity
  - Export to PDF and text formats with professional formatting
  - Automatic OPS (Obra Social Provincial) shift generation with configurable frequency
  - Database persistence with PostgreSQL backend
  - **7 Integrated Tabs in turnos.html:**
    1. 📋 Lista de Turnos (shift list with date filters)
    2. 📊 Resumen (statistics and summary)
    3. ⚙️ Configuración OPS (OPS configuration)
    4. 📅 Calendario (interactive month-by-month calendar view with API integration)
    5. 💰 Nómina (monthly salary with recurring work days)
    6. 🔄 Secuencias OPS (automatic OPS shift sequence generation)
    7. 🔄 Cambios de Turno (shift exchanges with colleagues using localStorage)
- **AI Medical Integration:** TinyLlama integration via Ollama for local, privacy-focused medical AI assistance. Supports streaming responses for real-time interaction. Configured through OLLAMA_HOST and OLLAMA_MODEL environment variables. Open Evidence integration for accessing medical research and evidence-based medicine resources. See CONFIGURACION_TINYLLAMA.md for setup instructions.

### Feature Specifications
- **Authentication:** User registration with email verification (with separate first and last names), login with email verification check, logout, password reset, and session management. New registrations require:
  1. Email verification via link sent to user's email address
  2. Admin approval after email verification
  3. Email notification upon admin approval
  Users accept Terms and Conditions upon email verification. Only one email address per account is allowed to prevent spam.
- **User Management (Admin):** Approve/reject registrations (sends automatic email upon approval), edit user profiles/roles, manage user status, and view all users. The primary admin account is protected.
- **Account Deletion:** Users can request account deletion from the configuration page. Requires password confirmation and sends a confirmation email. Admin accounts cannot be deleted through this process.
- **User Activity Tracking:** Real-time tracking of user online status and last login timestamp. Automatic timeout of inactive sessions (5-minute window) with heartbeat mechanism (2-minute interval). Admin panel displays online indicators (green dot) and relative time since last login.
- **Content Management:** Create, edit, and delete announcements and clinical guides (global or personal).
- **Medication Database:** Shared database with real-time search, editable by administrators, and consolidated to a single source (`data/medications.json`).
- **Profile Customization:** User profile updates with avatar upload.
- **Template System:** Global and personal templates for clinical notes, with category filtering and full-text search.
- **Admin Notifications:** Badges for pending actions (user approvals, suggestions) with real-time updates and sound notifications. Intelligent notification system that marks suggestions as "seen" when viewed, preventing persistent notifications for already-answered suggestions.
- **Maintenance Mode:** Admin-controlled system-wide maintenance mode with backend persistence, custom messages, and admin-only access.
- **Legal Footer:** Comprehensive legal disclaimer across all pages.

### System Design Choices
- **Data Storage:** File-based JSON storage (`data/` directory) for simplicity and rapid prototyping, designed to be scalable to a PostgreSQL database if needed.
- **API Endpoints:** Comprehensive set of RESTful API endpoints for authentication, user management, and content manipulation.
- **URL Structure:** Professional clean URLs without .html extensions using Express middleware with automatic 301 redirects. All HTML pages are accessible without file extensions (e.g., /main instead of /main.html). Visiting /page.html automatically redirects to /page for a more professional appearance.
- **Deployment:** Optimized for Replit's autoscale deployment.

## External Dependencies
- **Hostinger SMTP:** Used for sending password reset emails, password change notifications, and other security/account notifications via secure SMTP connection.
- **Ollama:** Local LLM server for TinyLlama AI integration. Requires OLLAMA_HOST and OLLAMA_MODEL environment variables.

## Recent Changes (November 2025)
- ✅ **Monthly Salary Distribution for Payroll Shifts (November 9, 2025):**
  - Implemented proper salary distribution for recurring payroll ("nómina") shifts
  - When creating bulk shifts with payment type "Nómina", the entered value is now interpreted as the MONTHLY TOTAL SALARY
  - System automatically divides the monthly salary among all created shifts
  - Formula: hourly_rate = (monthly_salary / number_of_shifts) / hours_per_shift
  - Updated UI: Field label changes dynamically to "Salario Mensual Total ($)" for nómina vs "Valor por Turno ($)" for OPS
  - Enhanced preview showing:
    * Monthly salary total
    * Number of shifts to create
    * Value per shift
    * Hourly rate
    * Indication when holidays are excluded
  - Preview now accurately reflects the same holiday exclusion logic used during shift creation
  - Protected against division-by-zero errors for shifts with 0 hours
- ✅ **Multi-currency PDF Export System (November 9, 2025):**
  - Refactored PDF export to separate shifts by currency (COP, USD, EUR)
  - Implemented locale-specific currency formatting with proper thousand/decimal separators
    * COP: $1.500.000,50 (dot for thousands, comma for decimals)
    * USD: $1,500,000.50 (comma for thousands, dot for decimals)
    * EUR: €1.500.000,50 (dot for thousands, comma for decimals)
  - Each currency gets its own section in the PDF with independent totals for OPS and Nómina
  - Changed PDF logo from image to SVG text "Med Tools Hub" without black background
  - Fixed TypeError bug: Added null-safe checks before `.toLowerCase()` calls on `shift_type`
  - Removed invalid legacy shift records without required fields
- ✅ **Enhanced Shift Management System (November 8, 2025) - v4:**
  - **Dual-mode bulk creation:** Two pattern options for shift sequences:
    * Weekday selection: Choose specific days (Lun, Mar, Mié, etc.) within date range
    * Interval-based: Create shifts every N days (e.g., every 6 nights for rotating schedules)
  - **Automatic time defaults:** Selecting shift type auto-populates appropriate start/end times
    * Mañana: 07:00-13:00 | Tarde: 13:00-19:00 | Corrido: 07:00-19:00
    * Noche: 19:00-07:00 | Consulta: 08:00-12:00
  - **Optimized calendar UI:** 
    * Calendar cells reduced from 80px to 70px for better screen usage
    * Badge font reduced to 8px with 2px padding
    * Day numbers reduced to 14px (16px for today)
  - **Improved form layout:** Compact grid design prevents field overlap
    * 2-column grid for dates, 4-column for weekdays, 3-column for times
    * Reduced font sizes (12px) and spacing for better mobile experience
  - Updated Colombian holidays: Removed 2024, added 2027-2029 (now covers 2025-2029, 5 years)
- ✅ **Enhanced Shift Management System (November 8, 2025) - v2:**
  - Updated shift types: Mañana, Tarde, Corrido, Noche, Consulta, Cambio de Turno
  - Implemented OPS vs Nómina differentiation with visual badges and color-coded borders
  - Added dedicated shift exchange system with colleague tracking and exchange details
  - Multiple shifts per day with time-based sorting and hour display in calendar badges
  - Separate statistics for OPS (red) and Nómina (blue) with independent totals
  - New "Cambios de Turno" tab for tracking all shift exchanges
  - Simplified title to "Gestión de Turnos"
  - Enhanced PDF export with payment type column and detailed summaries
- ✅ **Optimized Shift Management System (November 8, 2025) - v1:**
  - Completely redesigned turnos.html with calendar as the primary view
  - Integrated Colombian holidays for 2024-2026 with visual indicators
  - Implemented dynamic color system that adapts to selected theme (light/dark mode)
  - Simplified interface with tabbed navigation
  - Added visual legend for shift types with gradient badges
  - Implemented accent-safe normalization for shift type comparisons
  - Enhanced UX with larger calendar grid, hover effects, and better mobile responsiveness
- ✅ **Consolidated shift management:** Integrated all 4 additional tabs (Calendario, Nómina, Secuencias OPS, Cambios de Turno) into turnos.html sidebar version with unified API-based data flow
  - Refactored all calendar functions to use API instead of localStorage/global variables
  - All generation functions (payroll, OPS sequences, calendar shifts) now reload data after creating records
  - Removed duplicate turno section from herramientas.html to avoid redundancy
- ✅ Implemented PDF export functionality for shift management system with professional formatting
- ✅ Enhanced shift management with complete CRUD operations and PostgreSQL backend
- ✅ Added automatic OPS shift generation with configurable frequency settings
- ✅ Changed light mode color scheme from teal/cyan to professional slate grey (#475569, #64748b)
- ✅ Fixed emailVerified field for legacy users: All existing users now have emailVerified: true
- ✅ Fixed mobile zoom issue: All input fields now use 16px font-size to prevent automatic zoom on iOS/Android devices
- ✅ Fixed infinite reload loops: Updated route detection to support clean URLs (without .html extension)
- ✅ Added email notifications for password changes (security feature)
- ✅ Migrated AI integration from OpenAI to TinyLlama via Ollama for local, cost-free operation
- ✅ Implemented clean URL system (removes .html extensions from all pages)