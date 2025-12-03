# Med Tools Hub - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Copy example
cp .env.example .env

# Edit with your settings
nano .env
```

### 3. Start Server
```bash
npm start
# Server runs at http://localhost:5000
```

### 4. Access Platform
- **Main App**: http://localhost:5000/main.html
- **Admin Panel**: http://localhost:5000/admin.html
- **Login**: http://localhost:5000/ (Iniciar sesión)

## 👤 Default Test Users

After first run, database initializes with:
- **Username**: `admin`
- **Email**: `admin@test.com`
- **Role**: Administrator

## 📝 Quick Features

### AI Assistant
- Click 🤖 Herramientas → Asistente Médico IA
- **Languages**: ES/EN/PT selector in header
- **Queries**: Medical dosages, neonatology, contraindications
- **Analytics**: Admin → 📊 Analítica IA

### Shift Calendar
- Click 📅 Turnos
- Add shifts with OPS/Nómina split
- Multi-currency support (COP, EUR, USD)
- PDF export with statistics

### Medical Tools
- Text corrector (Corrector de Espacios)
- ABG analyzer (Analizador de Gases Arteriales)
- Infusion calculator (Calculadora de Infusiones)
- Clinical evolution notes (Evoluciones Clínicas)

### Admin Features
- User management & approval
- Announcements & feature updates
- Medical database (Vademecum)
- Backup & restore system
- System maintenance mode

### Biometric Login
- Click 📱 "Ingresar con huella o Face ID"
- Register biometric in Configuración
- Login with fingerprint/Face ID

## 🌐 Language Support

Switch languages anytime with ES/EN/PT buttons in header:
- **ES** - Español (default)
- **EN** - English
- **PT** - Português

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost/db` |
| `GROQ_API_KEY` | AI service API key | `gsk_xxxx` |
| `SESSION_SECRET` | Session encryption | Random 32+ chars |
| `SMTP_HOST` | Email server | `smtp.hostinger.com` |
| `RP_ID` | WebAuthn domain | `localhost` or `medtoolshub.cloud` |

## 📊 Key Endpoints

### Public
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /maintenance` - Check maintenance status

### Authenticated
- `GET /api/session` - Current session
- `GET /api/profile` - User profile
- `POST /api/logout` - Logout

### AI Features
- `POST /api/ai/query` - Send query to AI
- `GET /api/ai/stats` - AI statistics
- `GET /api/ai/logs` - Conversation history
- `POST /api/ai/rate` - Rate response

### Admin Only
- `GET /api/users` - All users
- `POST /api/anuncios` - Create announcement
- `POST /api/maintenance` - Set maintenance mode

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Change port in server.js or use:
PORT=3000 npm start
```

**Database not connecting?**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**WebAuthn not working?**
- Must use HTTPS in production
- RP_ID must match domain exactly
- Desktop: works with Windows Hello, Apple Touch ID
- Mobile: works with Face ID, fingerprint

## 📚 Next Steps

1. **Create users** - Admin → Users tab → Approve registrations
2. **Add announcements** - Admin → Anuncios tab
3. **Setup AI** - Configure GROQ_API_KEY
4. **Customize** - Edit configuracion.html for branding

## 🆘 Need Help?

- Check logs: `npm run logs`
- Database issues: See `docs/DEPLOYMENT_GUIDE.md`
- WebAuthn setup: See `docs/WEBAUTHN_SETUP.md`
- API errors: See browser console (F12)

---

**Status**: Ready to use
**Version**: 2.0.0
**Last Updated**: November 26, 2025
