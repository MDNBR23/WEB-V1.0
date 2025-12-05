# Med Tools Hub - v2.3 (PostgreSQL Edition)

## ESTADO: MIGRADO A POSTGRESQL - LISTO PARA PRODUCCION

### Migracion a PostgreSQL (v2.3)
- **Base de Datos**: Migrado de archivos JSON a PostgreSQL para mejor escalabilidad
- **Conexion Pooling**: Servicio dbService.js con pool de conexiones
- **Consultas Seguras**: Todas las consultas usan parametros para prevenir SQL injection
- **Tablas Creadas**: users, shifts, medications, anuncios, guias, sugerencias, biometric_credentials, tools_status, maintenance, feature_updates
- **Indices Optimizados**: idx_shifts_username_date para consultas de turnos
- **Archivos JSON eliminados**: Los archivos de respaldo en data/ y backups/ fueron eliminados ya que PostgreSQL es la fuente de datos

### Optimizaciones de Rendimiento (v2.2)
- **Lazy Loading de Pestañas**: Las infusiones solo se cargan cuando el usuario accede a la pestaña
- **Sistema de Caché**: Medicamentos cacheados evitando recargas innecesarias
- **Lazy Loading de Presentaciones**: Presentaciones cargadas solo bajo demanda
- **Actualizaciones Locales**: Ediciones/eliminaciones actualizan caché sin recargar todo
- **Reducción de API Calls**: De 7 requests a 1 inicial + lazy por presentación

### Sistema Final Optimizado

#### Arquitectura Simplificada
Cada medicamento tiene presentaciones con:
- **Descripcion**: Formato de presentacion (ej: "500MCG/10ML = 50MCG/ML")
- **Concentraciones**: Array de concentraciones por dilucion O valor unico
- **Diluciones**: Array de opciones de volumen (12CC, 24CC, 50CC, 100CC)

#### Medicamentos Disponibles (6 Total)

**SEDOANALGESIA**
| Medicamento | Dosis | Presentacion | Concentracion |
|-------------|-------|--------------|----------------|
| FENTANILO | 1-5 MCG/KG/HORA | 500MCG/10ML | 50 MCG/ML |
| MIDAZOLAM | 0.05-0.2 MG/KG/HORA | 15MG/3ML | 5 MG/ML |
| MORFINA | 0.02-0.2 MG/KG/HORA | 10MG/1ML | 10 MG/ML |

**VASOPRESORES**
| Medicamento | Dosis | Presentacion | Concentracion |
|-------------|-------|--------------|----------------|
| DOPAMINA | 5-20 MCG/KG/MIN | 200MG/5ML | 40 MG/ML |
| ADRENALINA | 0.05-1 MCG/KG/MIN | 1MG/1ML | 1000 MCG/ML |

**INOTROPICOS**
| Medicamento | Dosis | Presentacion | Concentracion |
|-------------|-------|--------------|----------------|
| DOBUTAMINA | 5-20 MCG/KG/MIN | 250MG/20ML | 12.5 MG/ML |

---

### Formula de Calculo

**Entrada del usuario:**
- Medicamento
- Presentacion
- Dosis (ej: 1 MCG/KG/HORA)
- Peso (ej: 10 KG)
- Dilucion seleccionada (ej: 50CC)

**Calculo:**
```
Dosis/Dia = Dosis x Peso x 24
CC Medicamento = Dosis/Dia / Concentracion
CC Diluyente = Dilucion Total - CC Medicamento
Razon CC/HORA = (Dosis x Peso) / (Dosis/Dia / Dilucion Total)
```

---

### Mejoras Implementadas (v2.1)

#### Seguridad Clinica
- **Validacion de Dosis Pediatricas**: Rangos seguros definidos para cada medicamento
- **Indicadores Visuales**: Badges de color (azul=bajo, verde=normal, naranja=alto, rojo=peligroso)
- **Alertas de Compatibilidad**: Verifica interacciones entre medicamentos

#### Funcionalidades Avanzadas
- **Historial de Calculos**: Ultimos 5 calculos guardados en localStorage
- **Botones de Peso Rapido**: 2kg, 3kg, 5kg, 10kg, 15kg, 20kg, 30kg
- **Tabla Paso a Paso**: Desglose detallado del calculo
- **Conversion de Unidades**: mcg <-> mg <-> g
- **Multi-medicamento**: Calcular varios farmacos simultaneamente
- **Base de Datos**: Preparado para guardar calculos por paciente (auditoria)

#### Correccion Critica (v2.1.1)
- **Lookup de Concentracion**: Usa `data-dilution-index` en botones para siempre obtener la concentracion correcta
- **Compatibilidad**: Funciona con tanto arrays `concentraciones` como valores unicos `concentracion`
- **Fallback**: Si no hay concentracion, la parsea de la descripcion

---

### API Endpoints

**Medicamentos:**
- GET /api/medications/infusions/list - Todos los medicamentos
- GET /api/medications/presentations/:id - Presentaciones por medicamento
- POST /api/medications/infusions - Crear medicamento
- PUT /api/medications/infusions/:id - Actualizar medicamento
- DELETE /api/medications/infusions/:id - Eliminar medicamento

**Presentaciones:**
- POST /api/medications/presentations - Crear presentacion
- PUT /api/medications/presentations/:id - Actualizar presentacion
- DELETE /api/medications/presentations/:id - Eliminar presentacion

---

### Verificacion

**API Status:**
- 6 medicamentos activos con rangos de dosis pediatricos
- Presentaciones con concentraciones correctas
- Diluciones: 12CC, 24CC, 50CC, 100CC

**Calculadora:**
- Carga medicamentos dinamicamente
- Muestra presentaciones disponibles
- Calculos precisos con validacion de seguridad
- Orden medica copiable
- Historial accesible
- Multi-medicamento con compatibilidad

**Seguridad:**
- Validacion de rangos terapeuticos
- Alertas de dosis fuera de rango
- Incompatibilidades de farmacos detectadas

---

### Estructura del Proyecto

```
/
├── server.js                 # Servidor principal Express
├── herramientas.html         # Pagina de herramientas con calculadora
├── src/
│   ├── config/
│   │   └── database.js       # Configuracion PostgreSQL
│   ├── controllers/          # Controladores (todos usando PostgreSQL)
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── shiftsController.js
│   │   ├── medicationsController.js
│   │   └── ...
│   ├── services/
│   │   ├── dbService.js      # Servicio de base de datos PostgreSQL
│   │   ├── initService.js    # Inicializacion de tablas
│   │   └── infusionInitService.js
│   └── utils/
│       └── infusionAdmin.js
├── scripts/
│   └── migrate-to-postgres.js  # Script de migracion JSON -> PostgreSQL
├── data/                     # Archivos JSON originales (backup)
├── public/                   # Archivos estaticos
└── styles.css               # Estilos globales
```

---

### Correcciones Recientes (v2.2.1)
- **Error showTool resuelto**: Función global accesible desde onclick handlers
- **Unidades en paso a paso**: Cada paso del cálculo muestra unidades correctas (mcg/mL, CC/hora, etc)
- **Concentración en cálculos**: Valor real de concentración mostrado en paso 3 del desglose
- **Velocidad de infusión**: Paso 6 con fórmula y unidades correctas

---

---

### Replit Setup (December 2025)

**Environment Configuration:**
- PostgreSQL database provisioned using Replit's built-in database
- DATABASE_URL and related PG* environment variables configured automatically
- Port 5000 configured for frontend web access with 0.0.0.0 binding
- Cache-Control headers configured for proper preview functionality in Replit iframe

**Default Credentials:**
- Username: `admin`
- Password: `1234`

**Deployment:**
- Configured for autoscale deployment
- Production-ready with database migrations on startup
- WebAuthn configured for Replit cross-origin support

---

**Ultima actualizacion:** 2025-12-05 05:20 UTC
**Estado:** Completamente migrado a PostgreSQL y configurado para Replit
