# Med Tools Hub - Medical Platform

## Overview
Med Tools Hub es una plataforma de producción, en español, diseñada para profesionales de salud pediátrica y neonatología. Ofrece gestión de usuarios, anuncios médicos, guías clínicas, información de medicamentos y herramientas médicas especializadas. Sistema backend robusto con gestión de sesiones y aislamiento de datos.

## Recent Changes - November 26, 2025
**SESIÓN FINAL - Legibilidad de Textos COMPLETADA:**

### Resolución de Problema de Legibilidad
- **Problema identificado**: Textos en modo claro no se veían bien en algunos elementos con fondos oscuros
- **Solución implementada**:
  - Cambié TODOS los backgrounds oscuros fijos a backgrounds claros en modo light
  - `.btn.secondary`: de rgba(71,85,105,.85) a rgba(229,231,235,.95)
  - Campos de input/select: backgrounds claros en light mode
  - Modales y elementos superpuestos: ahora tienen fondos claros
  - Mantuve backgrounds oscuros SOLO dentro de bloques html[data-theme="dark"]

### Optimización de Paletas de Colores
- Reconstrucción completa de todos los 7 HTML (main, vademecum, herramientas, turnos, sugerencias, configuracion, admin)
- Script inline correcto en HEAD con themeColors definida para 6 temas
- Texto negro (#000000) en TODOS los temas en modo light (máxima legibilidad)
- Texto claro en TODOS los temas en modo dark (máxima legibilidad)
- Paletas completas: 12 variables de color por modo

### Arreglos Técnicos
- Eliminados scripts duplicados que causaban errores de sintaxis
- Funciones `aplicarTema()` y `cambiarIdioma()` definidas globalmente
- CSS forzado con `!important` para garantizar aplicación correcta
- Headers no-cache en servidor para evitar problemas de caché

### Verificación Final
- ✅ Servidor corriendo sin errores críticos
- ✅ Todos los temas tienen texto legible en light y dark mode
- ✅ Multi-idioma (ES/EN/PT) operativo
- ✅ Botones de tema funcionales
- ✅ Contraste WCAG AAA en todos los temas

## User Preferences
None recorded yet.

## System Architecture
Plataforma web con stack puro: HTML5, CSS3, vanilla JavaScript + Node.js/Express backend.

### Color System (Finalized)
- **Light Mode**: Fondos claros + texto negro = máximo contraste
- **Dark Mode**: Fondos oscuros + texto claro = máximo contraste
- 6 temas: Slate, Médico, Océano, Bosque, Atardecer, Lavanda
- Cada tema: 12 variables de color (fondo, texto, primario, secundario, etc.)

### Multi-Language System (i18n)
- Archivo: `src/utils/i18n.js`
- 150+ traduciones
- Idiomas: ES, EN, PT
- Aplicado a TODOS los 7 pages (main, vademecum, herramientas, turnos, sugerencias, configuracion, admin)

### Technical Stack
- **Frontend**: HTML5, CSS3, vanilla JavaScript + i18n system
- **Backend**: Node.js + Express.js + PostgreSQL (Neon)
- **Authentication**: Session-based + bcrypt + WebAuthn biometrics
- **Medical Tools**: Corrector, gasometría, infusión, interacciones, plantillas, AI, evaluaciones
- **AI Integration**: Groq API para asistente médico inteligente

### Deployment Status
**LISTO PARA PRODUCCIÓN** 🚀
- URL de destino: medtoolshub.cloud
- Todas las características operacionales
- Interfaz completamente funcional
- Sin errores críticos

## External Dependencies
- Hostinger SMTP (email)
- Groq API (AI)
- SimpleWebAuthn (biometrics)
- PDFMake (reports)

