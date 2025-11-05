# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub is a production-ready, Spanish-language web platform for pediatric and neonatal healthcare professionals. It centralizes essential resources, offering user management, medical announcements, clinical guidelines, medication information, and specialized medical tools. The platform features a robust backend API with user session management and data isolation, aiming to streamline operations and provide critical support for healthcare providers. The business vision is to become the go-to platform for pediatric and neonatal medical professionals, enhancing clinical decision-making and efficiency.

## User Preferences
None recorded yet.

## System Architecture
Med Tools Hub is built with a focus on simplicity, security, and performance using a pure web stack.

### UI/UX Decisions
- **Design:** Modern teal/cyan theme with enhanced contrast, clear typography, and accessible color palettes (WCAG AA compliant). Features a redesigned authentication box with modern styling and responsive design.
- **Navigation:** Smooth page transitions, a collapsible sidebar with persistent icons and title, and a modern circular toggle button.
- **Responsiveness:** Optimized for various screen sizes, ensuring a consistent user experience.
- **Theming:** Supports both light and dark modes with smooth CSS transitions.

### Technical Implementations
- **Frontend:** Pure HTML5, CSS3, and vanilla JavaScript for a lightweight and fast client-side experience.
- **Backend:** Node.js with Express.js implementing a RESTful API.
- **Authentication:** Session-based authentication using `express-session`, secure password hashing with `bcrypt` (10 rounds), and role-based access control (admin/user).
- **Data Isolation:** User-specific data (announcements, guides) is isolated, while global content (medications, admin-created guides/announcements) is shared.
- **Email Service:** Integrated for password recovery, capable of operating with or without SMTP credentials.
- **Medical Tools:** Includes a text space corrector, an interactive arterial blood gas analyzer, a template system for clinical evolution notes, an infusion calculator, a drug interaction checker, and an interactive shift calendar.
- **Infusion Calculator:** Calculates medication volumes, diluent, and flow rates based on patient parameters and medication presentations. Supports multiple dosing units with automatic unit conversion and precise medical orders. Uses exclusively admin-managed medications.
- **Medical Shift Management:** Integrated shift scheduling tool with reminders, monthly tracking, financial summary, and localStorage persistence. Includes a shift exchange system.
- **AI Medical Integration:** Open Evidence integration for accessing medical research and evidence-based medicine resources. Documentation for Ollama AI integration is prepared for future implementation.

### Feature Specifications
- **Authentication:** User registration (with separate first and last names), login, logout, password reset, and session management.
- **User Management (Admin):** Approve/reject registrations, edit user profiles/roles, manage user status, and view all users. The primary admin account is protected.
- **Content Management:** Create, edit, and delete announcements and clinical guides (global or personal).
- **Medication Database:** Shared database with real-time search, editable by administrators, and consolidated to a single source (`data/medications.json`).
- **Profile Customization:** User profile updates with avatar upload.
- **Template System:** Global and personal templates for clinical notes, with category filtering and full-text search.
- **Admin Notifications:** Badges for pending actions (user approvals, suggestions) with real-time updates and sound notifications.
- **Maintenance Mode:** Admin-controlled system-wide maintenance mode with backend persistence, custom messages, and admin-only access.
- **Legal Footer:** Comprehensive legal disclaimer across all pages.

### System Design Choices
- **Data Storage:** File-based JSON storage (`data/` directory) for simplicity and rapid prototyping, designed to be scalable to a PostgreSQL database if needed.
- **API Endpoints:** Comprehensive set of RESTful API endpoints for authentication, user management, and content manipulation.
- **Deployment:** Optimized for Replit's autoscale deployment.

## External Dependencies
- **Replit Mail:** Used for sending password reset emails and other notifications.