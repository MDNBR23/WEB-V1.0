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