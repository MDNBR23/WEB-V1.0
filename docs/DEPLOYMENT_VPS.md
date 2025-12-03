# Guía de Despliegue en VPS (Hostinger)

## Pasos para desplegar Med Tools Hub en tu VPS

### 1. Preparar el código en tu VPS

```bash
# Clonar o copiar el código a tu VPS
cd /ruta/donde/quieras/instalar
# (copia tu código aquí)

# Instalar dependencias
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales:

```bash
cp .env.example .env
nano .env
```

Edita el archivo `.env` con tus valores reales:

```
# Database Configuration
DB_HOST=72.61.3.239
DB_PORT=5432
DB_NAME=medtoolshub
DB_USER=mthuser
DB_PASSWORD=MTHpassword123

# Email Configuration (configura tu SMTP)
SMTP_USER=administrador@medtoolshub.cloud
SMTP_PASS=tu_contraseña_smtp

# Session Secret (genera uno nuevo por seguridad)
SESSION_SECRET=tu_secreto_generado

# Server Configuration
PORT=5000
NODE_ENV=production
```

### 3. Modificar server.js para usar .env

Instala el paquete dotenv:

```bash
npm install dotenv
```

Luego, agrega al inicio de `server.js` (después de los require):

```javascript
require('dotenv').config();
```

### 4. Inicializar la Base de Datos

La tabla `plantillas` se creará automáticamente cuando inicies el servidor por primera vez.

### 5. Iniciar el Servidor

**Para desarrollo/pruebas:**
```bash
node server.js
```

**Para producción (recomendado - con PM2):**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start server.js --name medtoolshub

# Configurar PM2 para iniciar automáticamente al reiniciar el servidor
pm2 startup
pm2 save
```

**Comandos útiles de PM2:**
```bash
pm2 status              # Ver estado de la aplicación
pm2 logs medtoolshub    # Ver logs en tiempo real
pm2 restart medtoolshub # Reiniciar la aplicación
pm2 stop medtoolshub    # Detener la aplicación
```

### 6. Configurar Nginx como Proxy Reverso (Recomendado)

Crea un archivo de configuración en `/etc/nginx/sites-available/medtoolshub`:

```nginx
server {
    listen 80;
    server_name medtoolshub.cloud www.medtoolshub.cloud;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/medtoolshub /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configurar SSL con Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d medtoolshub.cloud -d www.medtoolshub.cloud

# Certbot renovará automáticamente el certificado
```

### 8. Backup Automático (Opcional)

Para ejecutar backups automáticos diariamente:

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * cd /ruta/a/tu/proyecto && /usr/bin/node backup-auto.js
```

## Notas Importantes

- ✅ El archivo `.env` nunca se sube a git (está en `.gitignore`)
- ✅ Asegúrate de que los puertos necesarios estén abiertos en el firewall
- ✅ La carpeta `data/` contiene archivos JSON importantes - haz backups regulares
- ✅ La carpeta `backups/` contiene los backups automáticos del sistema

## Verificación

Una vez desplegado, verifica:

1. El servidor está corriendo: `pm2 status`
2. La base de datos se conecta correctamente
3. Puedes acceder a la aplicación desde tu dominio
4. El sistema de login/registro funciona
5. El sistema de backup funciona correctamente
