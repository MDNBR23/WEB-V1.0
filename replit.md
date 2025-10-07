# NBR WEB - Medical Platform

## Overview
NBR WEB is a Spanish-language medical web platform designed for pediatric and neonatal healthcare professionals. It provides a comprehensive system for user management, medical announcements, clinical guidelines, and medication information.

**Current Status:** Fully functional and production-ready. The application now uses a complete backend API with proper user session management and data isolation.

## Project Architecture

### Technology Stack
- **Frontend:** Pure HTML5, CSS3, and vanilla JavaScript
- **Backend:** Node.js + Express with REST API
- **Data Storage:** File-based JSON storage with user isolation
- **Authentication:** Session-based auth with bcrypt password hashing
- **Email Service:** Replit Mail integration for password recovery
- **Server:** Express HTTP server on port 5000 (Replit-optimized)

### File Structure
```
.
├── index.html          - Login page (entry point)
├── register.html       - User registration page
├── reset-password.html - Password reset page
├── main.html          - Main dashboard (announcements & guides)
├── vademecum.html     - Medicine database/calculator
├── herramientas.html  - Medical tools (text formatter, ABG analyzer, document storage)
├── admin.html         - Admin panel for user/content management
├── configuracion.html - User profile settings
├── script.js          - All application JavaScript logic (API-based)
├── style.css          - All styling and themes
├── server.js          - Express server with REST API
├── data/              - User data storage (JSON files, gitignored)
└── replit.md          - This documentation
```

### Key Features

#### 1. Authentication System
- Session-based authentication with express-session
- Secure password hashing using bcrypt
- Password reset functionality with secure tokens sent via email
- Email delivery via Replit Mail with automatic fallback
- Pre-seeded admin account (username: `admin`, password: `1234`)
- Role-based access control (admin/user)

#### 2. User Management (Admin only)
- Approve/reject new user registrations
- Edit user profiles and roles
- Manage user status (approved/pending/rejected/suspended)
- View all users in the system

#### 3. Data Isolation
- **Users:** Each user has private data stored separately
- **Anuncios (Announcements):**
  - Global announcements visible to all users
  - Personal announcements visible only to creator
  - Admin can create/edit/delete global and all announcements
  - Users can create/edit/delete their own announcements
- **Guías (Guides):**
  - Global guides visible to all users
  - Personal guides visible only to creator
  - Admin can create/edit/delete global and all guides
  - Users can create/edit/delete their own guides
- **Medications:** Shared database accessible to all authenticated users, admin-only editing

#### 4. User Features
- Profile customization with avatar upload (base64 encoded)
- Theme switcher (light/dark mode)
- Medicine database with real-time search
- View announcements and clinical guides
- Password reset via email verification

### Data Storage
All data is stored in server-side JSON files:
- `data/users.json` - User accounts with hashed passwords
- `data/anuncios_global.json` - Global announcements
- `data/anuncios_[username].json` - User-specific announcements
- `data/guias_global.json` - Global guides
- `data/guias_[username].json` - User-specific guides
- `data/medications.json` - Shared medication database

### API Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/session` - Check session status
- `POST /api/reset-password-request` - Request password reset token
- `POST /api/reset-password` - Reset password with token

#### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:username` - Update user (admin only)
- `DELETE /api/users/:username` - Delete user (admin only)
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile

#### Content
- `GET /api/anuncios` - Get announcements (global + user's own)
- `POST /api/anuncios` - Create/update announcement
- `DELETE /api/anuncios/:id` - Delete announcement
- `GET /api/guias` - Get guides (global + user's own)
- `POST /api/guias` - Create/update guide
- `DELETE /api/guias/:id` - Delete guide
- `GET /api/medications` - Get all medications
- `POST /api/medications` - Create/update medication (admin only)
- `DELETE /api/medications/:id` - Delete medication (admin only)

## Development

### Running Locally
The server is automatically started via the configured workflow:
```bash
node server.js
```

The application will be available at `http://0.0.0.0:5000/`

### Deployment
Configured for Replit's autoscale deployment:
- Deployment type: Autoscale (stateless web app)
- Run command: `node server.js`
- No build step required

### Default Admin Access
- Username: `admin`
- Password: `1234`
- **Important:** Change the admin password after first login via the configuration page

## UI/UX Improvements

### Design Enhancements
1. **Typography:** Enhanced contrast with darker text colors, text shadows, and bolder fonts
2. **Page Transitions:** Smooth transitions without white flash using optimized CSS animations
3. **Sidebar:** Icons and NBR WEB title remain visible even when collapsed
4. **Toggle Button:** Modern circular button with dynamic icon (☰/→)
5. **Background:** Full-page gradient with fixed attachment for consistent appearance
6. **Theme Support:** Light and dark themes with proper contrast ratios

### Performance
- Optimized CSS transitions with cubic-bezier easing
- No-cache headers for immediate content updates
- Efficient session management
- Fast API responses with file-based storage

## Recent Changes

### 2025-10-07: Template System & Notification Badges
- **Template Storage System:**
  - Renamed "Almacenamiento de Documentos" to "Plantillas" for better clarity
  - Implemented global/predefined templates system for administrators
  - Admin can create templates visible to all users
  - Users can create their own personal templates
  - Templates stored separately in localStorage (global and user-specific keys)
  - Maximum 10MB file size per template
  - Category filtering and full-text search functionality
  
- **Admin Notification System:**
  - Added notification badge to "Administración" link in sidebar
  - Badge shows total count of pending actions (users + unanswered suggestions)
  - Badge visible only to admin users
  - Subtle pulse animation for better visibility
  - Separate counters in admin panel for users and suggestions
  - Real-time updates when approving/rejecting users or answering suggestions
  - Auto-refreshes on page load for admin users

### 2025-10-06: Medical Tools Section & File Reorganization
- **New Medical Tools Page:**
  - Text Space Corrector: Normalizes and removes extra spaces in medical texts
  - Arterial Blood Gas Analyzer: Interprets ABG results (pH, PaCO₂, PaO₂, HCO₃, SatO₂, BE)
    - Based on standard clinical interpretation algorithms
    - Shows diagnostic classification (acidosis/alkalosis, respiratory/metabolic)
    - Indicates acute, partially compensated, or compensated states
    - Evaluates oxygenation status
  - Document Storage System: Store and edit clinical evolution templates by pathology and age group
    - Maximum 10MB per document
    - Category filtering (Pediatrics, Adults, Geriatrics, Neonatology, Others)
    - Full-text search functionality
    - In-browser editing with modal interface
    - Download documents as plain text files
    - Uses browser localStorage for data persistence
  
- **File Reorganization:**
  - Renamed `calculadora.html` to `vademecum.html` (medicine database)
  - Updated all navigation references across all HTML files
  - Improved semantic naming for better clarity

- **Security Enhancement:**
  - Protected admin user against status/role changes
  - Backend API prevents modification of admin status and role
  - Frontend UI disables status/role fields when editing admin user
  - Disabled approve/reject/delete buttons for admin user in management table

### 2025-10-06: UI Refresh & Email Integration
- **Color Palette Update:**
  - Changed from purple/indigo to modern teal/cyan theme (#008B8B → #008080)
  - All button colors now meet WCAG AA accessibility standards (≥4.5:1 contrast)
  - Primary: Teal (#008080), Success: Forest Green (#1a6b1a), Warning: Dark Orange (#B85C00)
  - Info: Blue (#2563eb), Danger: Red (#dc2626), Secondary: Gray (#475569)
  
- **Sidebar Improvements:**
  - Collapsed sidebar now shows "NBR" instead of vertical "NBR WEB"
  - Icons are larger (22px) and centered when sidebar is collapsed
  - Toggle button uses consistent ☰ icon in all states
  - Smoother transitions and better visual feedback
  
- **Typography Enhancements:**
  - Login/register titles now use dark color (var(--text)) for visibility on white backgrounds
  - Improved font sizes and spacing across all forms
  - Better contrast on all text elements
  
- **Email Integration (Replit Mail):**
  - Password reset codes are now sent via email automatically
  - Professional HTML email template with NBR WEB branding
  - Automatic fallback to on-screen display if email fails
  - Uses Replit's built-in mail service (no external dependencies)
  - Email includes user's name, reset code, and 1-hour expiry notice
  
- **Button Consistency:**
  - All admin panel buttons now have semantic colors (Edit=Blue, Approve=Green, Reject=Orange, Delete=Red)
  - Symmetric sizing with consistent min-width (90px for small buttons)
  - Better spacing and alignment in tables and modals

### 2025-10-05: Major Backend & UX Overhaul
- **Backend API Implementation:**
  - Migrated from localStorage to Express-based REST API
  - Implemented session-based authentication with bcrypt
  - Added file-based JSON storage with user data isolation
  - Created complete CRUD endpoints for all resources
  
- **Security Enhancements:**
  - Password hashing with bcrypt (10 rounds)
  - Secure session management with express-session
  - Password reset functionality with time-limited tokens
  - API authentication middleware
  
- **User Data Isolation:**
  - Each user has separate data files for anuncios and guías
  - Global content system where admin can share with all users
  - Admin can view and manage all user data
  - Regular users only see global + their own content
  
- **UI/UX Improvements:**
  - Enhanced typography contrast and readability
  - Smooth page transitions without white flash
  - Modern circular sidebar toggle button
  - Sidebar shows icons/title when collapsed
  - Background extends to full page height
  - Improved glassmorphic design with better backdrop filters

- **New Features:**
  - Password reset page with secure token system
  - Link on login page for forgotten passwords
  - Admin checkboxes to mark content as global/personal
  - Real-time session validation
  - Better error handling and user feedback

### 2025-10-05: Initial Replit Setup
- Installed Node.js 20
- Created basic HTTP server with cache-control headers
- Configured workflow to run on port 5000
- Set up deployment configuration
- Added .gitignore for Node.js

## Security Notes
- All passwords are hashed with bcrypt before storage
- Sessions are server-side with httpOnly cookies
- Password reset tokens expire after 1 hour
- API endpoints validate authentication for protected routes
- Admin-only endpoints check role before allowing access
- Data files are excluded from git via .gitignore
- **Admin user protection:** The main admin account cannot have its status or role modified through the UI or API, preventing accidental lockout

## User Preferences
None recorded yet.

## Notes
- Data persists in server-side JSON files
- Users must be approved by admin before they can log in
- Each user has their own isolated data storage
- Admin can view and manage all content
- Perfect for small to medium medical teams or institutions
- Scalable to PostgreSQL database if needed in the future
