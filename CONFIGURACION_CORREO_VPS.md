# 📧 Guía de Configuración de Correo para VPS

## Problema Actual
El envío de correo funciona en Replit pero no en tu VPS. Esto es muy común debido a restricciones de puertos y firewall en servidores de producción.

## 🔍 Diagnóstico del Problema

### 1. Verificar Conexión SMTP desde tu VPS

Conecta a tu VPS por SSH y ejecuta estos comandos:

```bash
# Verificar si el puerto 465 está accesible
telnet smtp.hostinger.com 465

# Si telnet no está instalado, usa nc (netcat)
nc -vz smtp.hostinger.com 465

# También verifica el puerto 587 (alternativa)
nc -vz smtp.hostinger.com 587
```

**Resultado esperado:**
- ✅ Si conecta: "Connected to smtp.hostinger.com"
- ❌ Si falla: "Connection timed out" o "Connection refused" → Puerto bloqueado

### 2. Verificar Firewall del VPS

```bash
# Ver estado del firewall UFW
sudo ufw status

# Ver todas las reglas del firewall
sudo iptables -L -n
```

---

## ✅ Solución: Configuración Paso a Paso

### Paso 1: Abrir Puertos SMTP en el Firewall

Si tu VPS usa **UFW (Ubuntu/Debian)**:

```bash
# Permitir tráfico SMTP saliente en puerto 465 (SSL)
sudo ufw allow out 465/tcp

# Permitir puerto 587 (TLS) como alternativa
sudo ufw allow out 587/tcp

# Permitir DNS (necesario para resolver smtp.hostinger.com)
sudo ufw allow out 53

# Recargar firewall
sudo ufw reload

# Verificar cambios
sudo ufw status verbose
```

Si tu VPS usa **iptables**:

```bash
# Permitir tráfico saliente en puerto 465
sudo iptables -A OUTPUT -p tcp --dport 465 -j ACCEPT

# Permitir tráfico saliente en puerto 587
sudo iptables -A OUTPUT -p tcp --dport 587 -j ACCEPT

# Guardar reglas (Ubuntu/Debian)
sudo netfilter-persistent save

# O en CentOS/RHEL
sudo service iptables save
```

### Paso 2: Configurar Variables de Entorno en el VPS

Asegúrate de que tu archivo `.env` en el VPS tenga las credenciales correctas:

```bash
# Editar archivo .env en tu VPS
nano .env
```

Contenido del archivo `.env`:

```env
# Configuración SMTP de Hostinger
SMTP_USER=tuusuario@tudominio.com
SMTP_PASS=tu_contraseña_aqui

# Configuración de Base de Datos (si aplica)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_bd
DB_USER=usuario_bd
DB_PASSWORD=contraseña_bd
```

**IMPORTANTE:** 
- Usa tu email **completo** como `SMTP_USER` (ejemplo: `admin@medtoolshub.cloud`)
- Verifica que la contraseña sea correcta (sin espacios extra)

### Paso 3: Verificar Configuración de Nodemailer en tu Código

Tu código en `server.js` ya tiene la configuración correcta:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,  // SSL en puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### Paso 4: Agregar Verificación y Debug

Agrega esta verificación en `server.js` para diagnosticar problemas:

```javascript
// Añadir después de crear el transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error de configuración SMTP:', error);
  } else {
    console.log('✅ Servidor SMTP configurado correctamente');
  }
});
```

O con debug más detallado:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,    // Activar logs detallados
  logger: true    // Mostrar en consola
});
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Puerto 465 Bloqueado por el Proveedor VPS

**Algunos proveedores (DigitalOcean, Hetzner, AWS) bloquean puertos SMTP por defecto.**

**Solución A:** Usar puerto 587 en lugar de 465

Modifica tu `server.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,           // Cambiar a 587
  secure: false,       // false para STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: true
  }
});
```

**Solución B:** Contactar a tu proveedor VPS

Abre un ticket de soporte solicitando desbloquear puertos SMTP (25, 465, 587). Explica que necesitas enviar correos desde tu aplicación.

### Problema 2: Error de Autenticación

```
Error: Invalid login: 535 Authentication failed
```

**Causas:**
- Email o contraseña incorrectos
- No estás usando el email completo como usuario
- IP del VPS no está autorizada en Hostinger

**Soluciones:**
1. Verifica que `SMTP_USER` sea tu email **completo** (ej: `admin@medtoolshub.cloud`)
2. Verifica que la contraseña sea correcta (cópiala directamente sin espacios)
3. En el panel de Hostinger, verifica si hay restricciones de IP
4. Prueba iniciar sesión en webmail de Hostinger desde tu VPS para verificar credenciales

### Problema 3: Connection Timeout

```
Error: Connection timeout
```

**Causas:**
- Puerto bloqueado por firewall
- Red del VPS sin acceso a internet saliente
- DNS no resuelve smtp.hostinger.com

**Soluciones:**

```bash
# Verificar que el DNS funciona
nslookup smtp.hostinger.com

# Ping al servidor SMTP
ping smtp.hostinger.com

# Verificar conectividad con curl
curl -v telnet://smtp.hostinger.com:465
```

Si el DNS no resuelve, configura DNS públicos:

```bash
# Editar resolv.conf
sudo nano /etc/resolv.conf

# Agregar:
nameserver 8.8.8.8
nameserver 8.8.4.4
```

### Problema 4: SSL/TLS Certificate Error

```
Error: self signed certificate in certificate chain
```

**Solución temporal (solo para pruebas):**

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false  // SOLO para pruebas
  }
});
```

**Solución permanente:**

```bash
# Actualizar certificados CA en Ubuntu/Debian
sudo apt update
sudo apt install ca-certificates
sudo update-ca-certificates

# En CentOS/RHEL
sudo yum update ca-certificates
```

---

## 🧪 Probar el Envío de Correo

### Desde el servidor VPS con Node.js

Crea un archivo `test-email.js`:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,
  logger: true
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  console.log('✅ Servidor listo para enviar correos');
  
  // Enviar correo de prueba
  transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER, // Enviarse a sí mismo
    subject: 'Prueba desde VPS',
    text: 'Este correo se envió exitosamente desde el VPS',
    html: '<h1>✅ Éxito</h1><p>El correo funciona correctamente en el VPS</p>'
  }, (err, info) => {
    if (err) {
      console.error('❌ Error enviando:', err);
      process.exit(1);
    }
    console.log('✅ Correo enviado:', info.messageId);
    process.exit(0);
  });
});
```

Ejecutar:

```bash
node test-email.js
```

### Probar con telnet

```bash
# Conectar manualmente al servidor SMTP
telnet smtp.hostinger.com 465

# Si conecta exitosamente, verás:
# Trying 123.45.67.89...
# Connected to smtp.hostinger.com
```

---

## 🚀 Configuración Recomendada para Producción

### Usar Variables de Entorno Seguras

```bash
# Crear archivo .env (nunca lo subas a Git)
nano .env
```

```env
SMTP_USER=admin@medtoolshub.cloud
SMTP_PASS=tu_contraseña_segura_aqui
```

### Configuración Completa en server.js

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: true,              // Usar pool de conexiones
  maxConnections: 5,       // Máximo 5 conexiones simultáneas
  maxMessages: 100,        // Máximo 100 mensajes por conexión
  rateDelta: 1000,         // Tiempo entre mensajes
  rateLimit: 5             // Máximo 5 mensajes por segundo
});

// Verificar al iniciar
transporter.verify((error) => {
  if (error) {
    console.error('❌ Error SMTP:', error.message);
  } else {
    console.log('✅ Servidor SMTP listo');
  }
});
```

---

## 📋 Checklist de Diagnóstico

Sigue esta lista en orden:

1. ✅ Verificar conectividad al servidor SMTP
   ```bash
   nc -vz smtp.hostinger.com 465
   ```

2. ✅ Verificar firewall del VPS permite salida SMTP
   ```bash
   sudo ufw status
   ```

3. ✅ Verificar que el archivo `.env` existe y tiene las credenciales
   ```bash
   cat .env | grep SMTP
   ```

4. ✅ Verificar que Node.js carga el `.env`
   ```javascript
   console.log(process.env.SMTP_USER); // Debe mostrar tu email
   ```

5. ✅ Probar con script de prueba
   ```bash
   node test-email.js
   ```

6. ✅ Revisar logs del servidor
   ```bash
   pm2 logs  # Si usas PM2
   journalctl -u tu-servicio -f  # Si usas systemd
   ```

---

## 🆘 Si Nada Funciona

### Alternativa 1: Usar un Servicio SMTP Dedicado

Los servicios especializados tienen mejor deliverability y no sufren bloqueos de puertos:

- **SendGrid** (gratis hasta 100 emails/día)
- **Mailgun** (gratis hasta 5,000 emails/mes)
- **AWS SES** (muy económico)
- **Brevo** (ex Sendinblue, gratis hasta 300 emails/día)

### Alternativa 2: Relay SMTP Local

Instalar un relay SMTP local que reenvíe a Hostinger:

```bash
# Instalar Postfix como relay
sudo apt install postfix

# Configurarlo en modo relay
sudo dpkg-reconfigure postfix
```

---

## 📞 Contacto y Soporte

Si sigues teniendo problemas después de seguir esta guía:

1. Contacta al soporte de **Hostinger** para verificar:
   - Que tu cuenta de email está activa
   - Que no hay restricciones de IP
   - Que SMTP está habilitado

2. Contacta al soporte de tu **proveedor VPS** para verificar:
   - Que los puertos SMTP no están bloqueados
   - Que no hay restricciones de red saliente

---

## 🔧 Resumen de Comandos Rápidos

```bash
# 1. Probar conectividad
nc -vz smtp.hostinger.com 465

# 2. Abrir puertos
sudo ufw allow out 465/tcp
sudo ufw allow out 587/tcp
sudo ufw reload

# 3. Verificar variables de entorno
cat .env | grep SMTP

# 4. Probar envío
node test-email.js

# 5. Ver logs en tiempo real
tail -f /var/log/syslog | grep node
```

---

¡Buena suerte! Si sigues estos pasos, deberías poder enviar correos desde tu VPS sin problemas. 🚀
