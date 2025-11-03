# 🔄 Sistema de Backups Automáticos - Med Tools Hub

## 📋 Configuración en tu VPS Hostinger

### 1. Variables de Entorno Necesarias

Asegúrate de tener estas variables configuradas en tu VPS:

```bash
export DB_HOST=72.61.3.239
export DB_PORT=5432
export DB_NAME=medtoolshub
export DB_USER=mthuser
export DB_PASSWORD=MTHpassword123
```

Agrégalas a tu archivo `.bashrc` o `.env` según tu configuración.

### 2. Configurar Backup Automático con Cron

#### Editar crontab:
```bash
crontab -e
```

#### Ejemplos de configuración:

**Backup diario a las 3:00 AM:**
```bash
0 3 * * * cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js >> /ruta/a/tu/proyecto/logs/backup.log 2>&1
```

**Backup cada 12 horas:**
```bash
0 */12 * * * cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js >> /ruta/a/tu/proyecto/logs/backup.log 2>&1
```

**Backup cada 6 horas:**
```bash
0 */6 * * * cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js >> /ruta/a/tu/proyecto/logs/backup.log 2>&1
```

**Backup semanal (domingos a las 2:00 AM):**
```bash
0 2 * * 0 cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js >> /ruta/a/tu/proyecto/logs/backup.log 2>&1
```

### 3. Crear directorio de logs (opcional pero recomendado)

```bash
mkdir -p /ruta/a/tu/proyecto/logs
```

### 4. Prueba manual del backup

```bash
cd /ruta/a/tu/proyecto
node backup-auto.js
```

Deberías ver algo como:
```
Iniciando backup automático...
✓ Backup creado exitosamente: medtools-backup-2025-11-03T20-30-00.json
  - Archivos JSON: 7
  - Plantillas: 5
  - Tamaño: 145.23 KB
```

## 📁 Ubicación de los Backups

Los backups se guardan en: `/ruta/a/tu/proyecto/backups/`

Ejemplo de archivos:
```
backups/
├── medtools-backup-2025-11-03T03-00-00.json
├── medtools-backup-2025-11-04T03-00-00.json
├── medtools-backup-2025-11-05T03-00-00.json
└── ...
```

## 🔧 Configuración Avanzada

### Cambiar el número máximo de backups guardados:

Edita `backup-auto.js` línea 7:
```javascript
const MAX_BACKUPS = 7;  // Cambia este número
```

### Cambiar la ubicación de backups:

Edita `backup-auto.js` línea 5:
```javascript
const BACKUP_DIR = path.join(__dirname, 'backups');  // Cambia la ruta
```

## 🔍 Verificar que el cron está funcionando

```bash
# Ver logs de cron
grep CRON /var/log/syslog

# Ver tus trabajos programados
crontab -l

# Ver logs del backup
cat /ruta/a/tu/proyecto/logs/backup.log
```

## 📊 Restaurar un Backup

### Opción 1: Desde la interfaz web
1. Ingresa como admin
2. Ve a Administración
3. Selecciona el archivo de backup desde la carpeta `backups/`
4. Haz clic en "Importar Backup"

### Opción 2: Manualmente
```bash
# Copiar el backup a tu computadora
scp usuario@tu-vps:/ruta/a/tu/proyecto/backups/medtools-backup-YYYY-MM-DD.json ./

# Luego importar desde la interfaz web
```

## ⚠️ Recomendaciones

1. **Monitorea el espacio en disco**: Los backups pueden acumular espacio
2. **Prueba la restauración**: Verifica que los backups funcionen correctamente
3. **Backup adicional externo**: Considera copiar los backups a otro servidor o nube
4. **Notificaciones**: Puedes agregar notificaciones por email si falla el backup

## 🚀 Backup adicional a nube (opcional)

Si quieres sincronizar automáticamente con Google Drive, Dropbox o S3, puedes agregar al final del cron:

```bash
# Ejemplo con rclone (Google Drive)
0 4 * * * cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js && rclone copy backups/ gdrive:MedToolsHub-Backups/
```

## 📞 Soporte

Si tienes problemas con los backups automáticos:
1. Verifica los permisos de escritura en la carpeta
2. Revisa los logs: `cat logs/backup.log`
3. Verifica que las variables de entorno estén configuradas
4. Prueba ejecutar manualmente: `node backup-auto.js`
