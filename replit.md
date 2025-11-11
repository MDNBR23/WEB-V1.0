# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub is a production-ready, Spanish-language web platform designed for pediatric and neonatal healthcare professionals. It serves as a centralized hub for essential medical resources, offering user management, medical announcements, clinical guidelines, medication information, and specialized medical tools. The platform features a robust backend API with user session management and data isolation, aiming to streamline operations and provide critical support for healthcare providers. The business vision is to become the go-to platform for pediatric and neonatal medical professionals, enhancing clinical decision-making and efficiency within the sector.

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