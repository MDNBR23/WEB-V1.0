# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub is a Spanish-language medical web platform designed for pediatric and neonatal healthcare professionals. It provides a comprehensive system for user management, medical announcements, clinical guidelines, and medication information. The platform is fully functional, production-ready, and features a robust backend API with user session management and data isolation. Its purpose is to centralize essential resources and tools for healthcare providers.

## Recent Changes (October 31, 2025)
1. **Enhanced Legal Footer:** Updated footer across all 9 HTML pages (index, register, reset-password, main, herramientas, sugerencias, admin, vademecum, configuracion) with comprehensive legal disclaimer:
   - Full text: "Las herramientas de Med Tools Hub son de apoyo clínico y no sustituyen el criterio profesional. El uso y aplicación de los resultados son responsabilidad exclusiva de cada profesional de la salud. NBR® 2025 | Med Tools Hub | administrador@medtoolshub.com"
   - Consistent styling via CSS classes (.legal-footer, .legal-disclaimer) for responsive design
2. **Colombia Clock Flicker Fix:** Eliminated clock flickering when switching browser tabs:
   - Changed from innerHTML (DOM reconstruction) to persistent DOM elements (dateSpan, separator, timeSpan)
   - Updates now use textContent for performance and stability
   - Maintains theme-aware colors and America/Bogota timezone (UTC-5)
3. **Oxygenation Index Formula Correction:** Fixed critical medical calculation error:
   - Corrected formula: IO = (FiO₂ × MAP × 100) / PaO₂ (added missing ×100 multiplier)
   - Updated pediatric/neonatal severity ranges: <4 Normal, 4-8 Leve, 8-16 Moderado, 16-25 Severo, >25 Crítico
   - Improved result display with color-coded severity indicators
4. **Shift Calendar Timezone Fix:** Calendar now correctly highlights current day using Colombia timezone (America/Bogota) instead of browser's local timezone, ensuring consistent day highlighting for all users
5. **Drug Interaction Checker Tool:** Added new medical tool for checking medication interactions:
   - Interactive interface to add multiple medications with visual pills display
   - Real-time medication list management (add/remove)
   - Verification system with medical warnings and recommendations
   - Direct links to specialized databases (Drugs.com, Medscape, UpToDate)
   - Placeholder for future API integration with medical interaction databases
   - Comprehensive user guidance and clinical safety reminders

## Previous Changes (October 31, 2025)
1. **Platform Rebranding:** Successfully migrated and rebranded entire platform from "NBR WEB" to "Med Tools Hub" across all pages:
   - Updated all HTML files (index, register, main, admin, vademecum, configuracion, sugerencias, herramientas, reset-password)
   - Updated server.js with new platform name
   - Updated all metadata, titles, and UI references
2. **Colombia Clock Enhancement:** Fixed theme-aware colors for the Colombia timezone clock:
   - Dark text (rgba(15,23,42,0.95)) for light mode ensuring visibility
   - Light text (rgba(255,255,255,0.85)) for dark mode
   - Dynamic theme detection and automatic color switching
3. **Shift Management UX Improvement:** Removed "(Variable)" and "(Fijo)" labels from OPS and Nómina payment type options for cleaner interface

## Previous Changes (October 16, 2025)
1. **Corrector de Texto Mejorado:** Renombrado de "Corrector de Espacios" a "Corrector de Texto" con nuevas funcionalidades:
   - Transformación a MAYÚSCULAS, minúsculas, Capitalizar Palabras y oraciones
   - Invertir texto y eliminar líneas duplicadas
   - Contador en tiempo real de caracteres, palabras y líneas
   - Interfaz interactiva con botones individuales para cada operación
2. **Calculadora de Infusiones - Corrección Crítica:**
   - **CORREGIDO:** La calculadora ahora usa EXCLUSIVAMENTE medicamentos del localStorage (infusion_medications_global) gestionados por el admin
   - **CORREGIDO:** Se eliminó completamente la mezcla incorrecta con medicamentos del vademécum (medications.json)
   - **CORREGIDO:** El selector de dilución ahora actualiza correctamente la orden médica al hacer clic
   - Los medicamentos de la calculadora y el vademécum son ahora sistemas completamente separados e independientes
   - La orden médica se actualiza automáticamente al cambiar peso, dosis o seleccionar dilución con animaciones visuales
3. **Corrección de Errores:** Fixed JavaScript scope issue con la función `api()` ahora expuesta globalmente via `window.api`

## Previous Changes (October 16, 2025)
1. **Medication Database Consolidation:** Unified medication storage to single source (data/medications.json), eliminating data duplication and ensuring consistency across the platform.
2. **Enhanced Medication Loading:** Removed restrictive regex filtering that prevented many medications from appearing in the infusion calculator selector. Now all medications with valid names are displayed, sorted alphabetically for better UX.
3. **Interactive Infusion Calculator UI:** Completely redesigned the infusion calculator interface with:
   - Interactive input cards similar to the gas analyzer tool
   - Real-time validation for weight (0.5-150 kg) and dose inputs with visual feedback (✓ OK, ⚠️ warnings)
   - Color-coded status indicators (green for normal, orange for warnings, red for errors)
   - Interactive button-based dilution selection instead of radio buttons
   - Enhanced visual design with icons and better information display
   - Robust error handling with proper fallback to localStorage when needed

## Previous Changes (October 14, 2025)
1. **Tools Section Enhancement:** Changed "Infusiones" to "Calculadora" with description "Calculadora de sedoanalgesia e infusiones" for better clarity.
2. **Arterial Blood Gas Analyzer Improvement:** Removed SatO₂ and BE fields, added interactive visual feedback with real-time validation and color-coded status indicators (normal/low/high).
3. **Infusion Calculator Formula Fix:** Corrected medication cc volume calculation to use proper concentration formulas with improved regex pattern that handles both simple (/ML) and complex (/50ML) formats.
4. **Notification Sound System:** Implemented ding-dong sound for login, admin notifications (new users/suggestions), and user suggestion responses with sidebar badges. Improved AudioContext handling with async/await for better browser compatibility.
5. **Maintenance Mode:** Created admin-controlled maintenance mode with backend persistence (maintenance.json). Fixed login flow so non-admin users immediately see maintenance page without accessing main.html.
6. **Interactive Shift Calendar:** Implemented visual monthly calendar for medical shifts with click-to-add functionality, color-coded shift types (guardia/consulta/cirugía/otro), hover effects, monthly navigation, and support for multiple shifts per day with detailed view.
7. **Shift Exchange System:** Added dedicated tab for recording shift exchanges with other doctors, including original date, assumed date, doctor name, shift type, and notes. Complete history with color-coded visualization.
8. **Admin Menu Security:** Fixed issue where non-admin users could see admin menu during page transitions. Admin link now hidden by default and only shown to administrators.

## User Preferences
None recorded yet.

## System Architecture
Med Tools Hub is built with a focus on simplicity, security, and performance using a pure web stack.

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
- **Medical Tools:** Includes a text space corrector, an interactive arterial blood gas analyzer with real-time validation and visual feedback, and a template system for clinical evolution notes.
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
- **Admin Notifications:** Badges for pending actions (user approvals, suggestions) with real-time updates and sound notifications.
- **Maintenance Mode:** Admin-controlled system-wide maintenance mode with backend persistence, custom messages, and admin-only access during maintenance periods.

### System Design Choices
- **Data Storage:** File-based JSON storage (`data/` directory) for simplicity and rapid prototyping, designed to be scalable to a PostgreSQL database if needed.
- **API Endpoints:** Comprehensive set of RESTful API endpoints for authentication, user management, and content manipulation.
- **Deployment:** Optimized for Replit's autoscale deployment with `node server.js` as the run command.

## External Dependencies
- **Replit Mail:** Used for sending password reset emails and other notifications.