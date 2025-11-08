# Solución: No se pueden guardar turnos en VPS

## Problema Identificado

Cuando importas el backup a tu VPS, **las tablas de turnos NO se están creando** porque:

1. El código de `server.js` solo crea automáticamente la tabla `plantillas` (línea 156-178)
2. Las tablas `shifts` y `shift_config` **NO se crean automáticamente**
3. El sistema de backup **NO exporta ni importa** los datos de turnos (solo exporta `plantillas`)

Por eso, cuando intentas guardar un turno en tu VPS, el servidor intenta hacer INSERT en una tabla que no existe y falla.

## Solución

Debes ejecutar este script SQL en tu base de datos PostgreSQL del VPS para crear las tablas necesarias:

```sql
-- Tabla de turnos
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  shift_date DATE NOT NULL,
  shift_type VARCHAR(100) NOT NULL,
  hours DECIMAL(10, 2) DEFAULT 0,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);

-- Tabla de configuración de turnos
CREATE TABLE IF NOT EXISTS shift_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  ops_entity_name VARCHAR(255),
  ops_frequency_days INTEGER DEFAULT 6,
  ops_hours DECIMAL(10, 2) DEFAULT 12,
  ops_hourly_rate DECIMAL(10, 2) DEFAULT 0,
  last_ops_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para configuración
CREATE INDEX IF NOT EXISTS idx_shift_config_user_id ON shift_config(user_id);
```

## Cómo ejecutar el script en tu VPS

### Opción 1: Usando psql (línea de comandos)

```bash
psql -U tu_usuario -d nombre_base_datos -f script_turnos.sql
```

### Opción 2: Desde psql interactivo

```bash
# Conectarte a PostgreSQL
psql -U tu_usuario -d nombre_base_datos

# Luego copiar y pegar el script SQL completo
```

### Opción 3: Usando pgAdmin o herramienta gráfica

1. Abre pgAdmin o tu herramienta de administración de PostgreSQL
2. Conéctate a tu base de datos
3. Abre el Query Tool
4. Pega el script SQL
5. Ejecuta

## Verificar que funcionó

Después de ejecutar el script, puedes verificar que las tablas se crearon:

```sql
-- Ver las tablas creadas
\dt

-- Verificar estructura de shifts
\d shifts

-- Verificar estructura de shift_config
\d shift_config
```

## Mejora Recomendada para el Futuro

Para evitar este problema en el futuro, te recomiendo:

1. **Modificar `server.js`** para que cree automáticamente las tablas de turnos al iniciar
2. **Modificar el sistema de backup** para que incluya las tablas `shifts` y `shift_config`

¿Quieres que te ayude a implementar estas mejoras en tu código?
