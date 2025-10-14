# NBR WEB - Medical Platform

## Overview
NBR WEB is a Spanish-language medical web platform designed for pediatric and neonatal healthcare professionals. It provides a comprehensive system for user management, medical announcements, clinical guidelines, and medication information. The platform is fully functional, production-ready, and features a robust backend API with user session management and data isolation. Its purpose is to centralize essential resources and tools for healthcare providers.

## User Preferences
None recorded yet.

## System Architecture
NBR WEB is built with a focus on simplicity, security, and performance using a pure web stack.

### UI/UX Decisions
- **Design:** Modern teal/cyan theme with enhanced contrast, clear typography, and accessible color palettes (WCAG AA compliant).
- **Navigation:** Smooth page transitions, a collapsible sidebar with persistent icons and title, and a modern circular toggle button.
- **Responsiveness:** Optimized for various screen sizes, ensuring a consistent user experience.
- **Theming:** Supports both light and dark modes.

### Technical Implementations
- **Frontend:** Pure HTML5, CSS3, and vanilla JavaScript for a lightweight and fast client-side experience.
- **Backend:** Node.js with Express.js implementing a RESTful API.
- **Authentication:** Session-based authentication using `express-session`, secure password hashing with `bcrypt` (10 rounds), and role-based access control (admin/user).
- **Data Isolation:** User-specific data (announcements, guides) is isolated, while global content (medications, admin-created guides/announcements) is shared.
- **Email Service:** Integrated for password recovery using Replit Mail.
- **Medical Tools:** Includes a text space corrector, an arterial blood gas analyzer (vertical layout), and a template system for clinical evolution notes.
- **Infusion Calculator:** Calculates medication volumes, diluent, and flow rates based on patient parameters and medication presentations. Supports multiple dosing units including mg/kg/h, mcg/kg/h, mcg/kg/min, and UI/kg/min with automatic unit conversion and precise medical orders (1 decimal place).
- **Medical Shift Management:** Integrated shift scheduling tool with reminders, monthly tracking, financial summary, and localStorage persistence for personal organization.
- **AI Medical Integration:** Open Evidence integration for accessing medical research and evidence-based medicine resources.

### Feature Specifications
- **Authentication:** User registration, login, logout, password reset via email, and session management.
- **User Management (Admin):** Approve/reject registrations, edit user profiles/roles, manage user status, and view all users. The primary admin account is protected from status/role changes.
- **Content Management:** Create, edit, and delete announcements and clinical guides (global or personal).
- **Medication Database:** Shared database with real-time search, editable by administrators.
- **Profile Customization:** User profile updates with avatar upload.
- **Template System:** Global and personal templates for clinical notes, with category filtering and full-text search.
- **Admin Notifications:** Badges for pending actions (user approvals, suggestions) with real-time updates.

### System Design Choices
- **Data Storage:** File-based JSON storage (`data/` directory) for simplicity and rapid prototyping, designed to be scalable to a PostgreSQL database if needed.
- **API Endpoints:** Comprehensive set of RESTful API endpoints for authentication, user management, and content manipulation.
- **Deployment:** Optimized for Replit's autoscale deployment with `node server.js` as the run command.

## External Dependencies
- **Replit Mail:** Used for sending password reset emails and other notifications.