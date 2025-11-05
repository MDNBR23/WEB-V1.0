require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

async function sendEmail(message) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured - email not sent');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Med Tools Hub" <${process.env.SMTP_USER}>`,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html || message.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

const app = express();
const PORT = 5000;
const HOST = '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, {recursive: true});
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

async function readJSON(filename, defaultValue = []) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

async function writeJSON(filename, data) {
  try {
    await fs.writeFile(
      path.join(DATA_DIR, filename),
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    throw err;
  }
}

async function initializeDatabase() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS plantillas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        contenido TEXT NOT NULL,
        fecha DATE,
        tamanio INTEGER NOT NULL,
        global BOOLEAN DEFAULT false,
        creador VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('Database table "plantillas" initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function initializeData() {
  await ensureDataDir();
  
  const users = await readJSON('users.json', []);
  if (!users.find(u => u.username === 'admin')) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    users.push({
      username: 'admin',
      password: hashedPassword,
      name: 'Administrador',
      email: 'admin@medtoolshub.local',
      phone: '',
      institucion: 'Med Tools Hub',
      role: 'admin',
      status: 'aprobado',
      cat: 'Pediatra',
      avatar: '',
      createdAt: new Date().toISOString()
    });
    await writeJSON('users.json', users);
  }
  
  const globalAnuncios = await readJSON('anuncios_global.json', []);
  if (globalAnuncios.length === 0) {
    globalAnuncios.push({
      id: crypto.randomUUID(),
      titulo: 'Bienvenidos a Med Tools Hub',
      fecha: new Date().toISOString().slice(0, 10),
      texto: 'Plataforma médica para profesionales de pediatría y neonatología.',
      img: '',
      global: true
    });
    await writeJSON('anuncios_global.json', globalAnuncios);
  }
  
  const globalGuias = await readJSON('guias_global.json', []);
  if (globalGuias.length === 0) {
    globalGuias.push({
      id: crypto.randomUUID(),
      titulo: 'Guía RCP Neonatal 2024',
      fecha: new Date().toISOString().slice(0, 10),
      texto: 'Protocolo actualizado de reanimación cardiopulmonar neonatal.',
      url: '',
      global: true
    });
    await writeJSON('guias_global.json', globalGuias);
  }
  
  const medications = await readJSON('medications.json', []);
  if (medications.length === 0) {
    const meds = [
      {id:crypto.randomUUID(),nombre:'Adrenalina',grupo:'Vasopresores',dilucion:'1 ampolla (1mg/1ml) en 9ml SF = 0.1mg/ml',comentarios:'Dosis: 0.01-0.03 mg/kg IV. RCP: 0.01-0.03 mg/kg cada 3-5 min'},
      {id:crypto.randomUUID(),nombre:'Amikacina',grupo:'Antibióticos',dilucion:'Diluir en SF o SG 5% para infusión',comentarios:'Neonatos: 15-20 mg/kg/día c/24h. Niños: 15-22.5 mg/kg/día dividido c/8-12h'},
      {id:crypto.randomUUID(),nombre:'Ampicilina',grupo:'Antibióticos',dilucion:'Reconstituir con agua estéril, diluir en SF o SG 5%',comentarios:'Neonatos <7 días: 50-100 mg/kg c/12h. >7 días: 50-100 mg/kg c/8h. Meningitis: dosis más altas'},
      {id:crypto.randomUUID(),nombre:'Cafeína',grupo:'Estimulantes SNC',dilucion:'Citrato de cafeína 20mg/ml (oral o IV)',comentarios:'Carga: 20mg/kg. Mantenimiento: 5-10mg/kg/día. Para apnea del prematuro'},
      {id:crypto.randomUUID(),nombre:'Cefotaxima',grupo:'Antibióticos',dilucion:'Reconstituir y diluir en SF o SG 5%',comentarios:'Neonatos: 50mg/kg c/8-12h. Niños: 50-100mg/kg/día dividido c/6-8h. Meningitis: hasta 200mg/kg/día'},
      {id:crypto.randomUUID(),nombre:'Dexametasona',grupo:'Corticoides',dilucion:'Puede diluirse en SF o SG 5%',comentarios:'Antiinflamatorio: 0.15-0.6 mg/kg/día. Edema cerebral: 0.5-1 mg/kg dosis inicial'},
      {id:crypto.randomUUID(),nombre:'Dobutamina',grupo:'Inotrópicos',dilucion:'1 ampolla (250mg/20ml) + SF hasta 50ml = 5mg/ml',comentarios:'Dosis: 2-20 mcg/kg/min en infusión continua. Ajustar según respuesta hemodinámica'},
      {id:crypto.randomUUID(),nombre:'Dopamina',grupo:'Vasopresores',dilucion:'1 ampolla (200mg/5ml) + SF hasta 50ml = 4mg/ml',comentarios:'Dosis baja (2-5 mcg/kg/min): renal. Media (5-10): inotrópico. Alta (>10): vasopresor'},
      {id:crypto.randomUUID(),nombre:'Fentanilo',grupo:'Analgésicos',dilucion:'Diluir en SF, concentración típica 10-50 mcg/ml',comentarios:'Analgesia: 1-2 mcg/kg IV. Sedación: 1-5 mcg/kg/h en infusión continua'},
      {id:crypto.randomUUID(),nombre:'Furosemida',grupo:'Diuréticos',dilucion:'Puede administrarse directo IV o diluido en SF',comentarios:'Neonatos: 1-2 mg/kg/dosis c/12-24h. Niños: 1-2 mg/kg/dosis c/6-12h'},
      {id:crypto.randomUUID(),nombre:'Gentamicina',grupo:'Antibióticos',dilucion:'Diluir en SF o SG 5% para infusión 30-60 min',comentarios:'Neonatos: 4-5 mg/kg/día c/24-48h según edad. Niños: 5-7.5 mg/kg/día c/8h'},
      {id:crypto.randomUUID(),nombre:'Hidrocortisona',grupo:'Corticoides',dilucion:'Reconstituir con agua estéril, puede diluirse en SF',comentarios:'Insuficiencia suprarrenal: 1-2 mg/kg c/6-8h. Shock: 50-100 mg/m²/día'},
      {id:crypto.randomUUID(),nombre:'Midazolam',grupo:'Sedantes',dilucion:'Puede diluirse en SF o SG 5%',comentarios:'Sedación: 0.05-0.15 mg/kg IV. Infusión continua: 1-6 mcg/kg/min'},
      {id:crypto.randomUUID(),nombre:'Morfina',grupo:'Analgésicos',dilucion:'Diluir en SF, concentración típica 0.1-1 mg/ml',comentarios:'Analgesia: 0.05-0.2 mg/kg c/2-4h IV. Infusión: 10-40 mcg/kg/h'},
      {id:crypto.randomUUID(),nombre:'Surfactante',grupo:'Pulmonares',dilucion:'Listo para usar intratraqueal',comentarios:'Dosis: 100-200 mg/kg intratraqueal. Puede repetirse según protocolo'},
      {id:crypto.randomUUID(),nombre:'Vancomicina',grupo:'Antibióticos',dilucion:'Reconstituir y diluir en SF o SG 5%, infusión ≥60 min',comentarios:'Neonatos: 10-15 mg/kg c/8-24h según edad. Niños: 10-15 mg/kg c/6-8h. Monitorear niveles'}
    ];
    await writeJSON('medications.json', meds);
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const {firstName, lastName, username, email, cat, phone, institucion, password} = req.body;
    
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const users = await readJSON('users.json', []);
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({error: 'Ese usuario ya existe'});
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const fullName = `${firstName} ${lastName}`;
    
    users.push({
      username,
      name: fullName,
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      email,
      phone: phone || '',
      institucion: institucion || '',
      role: 'user',
      status: 'pendiente',
      cat: cat || '',
      avatar: '',
      createdAt: new Date().toISOString()
    });
    
    await writeJSON('users.json', users);
    res.json({message: 'Registro enviado. Espera aprobación del administrador.'});
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const {username, password} = req.body;
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({error: 'Usuario no existe'});
    }
    
    if (user.status === 'pendiente') {
      return res.status(401).json({error: 'Tu registro está pendiente de aprobación por el administrador. Te notificaremos cuando sea aprobado.'});
    }
    
    if (user.status === 'suspendido') {
      return res.status(403).json({error: 'Tu cuenta ha sido suspendida. Por favor contacta al administrador para más información.'});
    }
    
    if (user.status === 'rechazado') {
      return res.status(403).json({error: 'Tu solicitud de registro ha sido rechazada. Si crees que esto es un error, contacta al administrador.'});
    }
    
    if (user.status !== 'aprobado') {
      return res.status(401).json({error: 'Tu registro no ha sido aprobado'});
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña incorrecta'});
    }
    
    req.session.user = {
      username: user.username,
      role: user.role,
      name: user.name,
      cat: user.cat
    };
    
    res.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
        role: user.role,
        cat: user.cat
      }
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({success: true});
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({authenticated: true, user: req.session.user});
  } else {
    res.json({authenticated: false});
  }
});

app.post('/api/reset-password-request', async (req, res) => {
  try {
    const {username, email} = req.body;
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username && u.email === email);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario o email no coinciden'});
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + 3600000;
    
    user.resetToken = resetToken;
    user.resetExpiry = resetExpiry;
    
    await writeJSON('users.json', users);
    
    const emailContent = `Hola ${user.name || user.username},

Has solicitado restablecer tu contraseña en Med Tools Hub.

Tu código de recuperación es: ${resetToken}

Este código es válido por 1 hora.

Si no solicitaste este cambio, puedes ignorar este mensaje.

Saludos,
Med Tools Hub`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
    .container { background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #008B8B, #008080); padding: 20px; border-radius: 8px 8px 0 0; color: white; text-align: center; }
    .content { padding: 30px; }
    .code { background: #f0f9ff; border: 2px solid #008080; border-radius: 8px; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; word-break: break-all; color: #0f172a; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Med Tools Hub</h1>
      <p>Recuperación de Contraseña</p>
    </div>
    <div class="content">
      <p>Hola <strong>${user.name || user.username}</strong>,</p>
      <p>Has solicitado restablecer tu contraseña en Med Tools Hub.</p>
      <p>Tu código de recuperación es:</p>
      <div class="code">${resetToken}</div>
      <p>Este código es válido por <strong>1 hora</strong>.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>`;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Código de Recuperación - Med Tools Hub',
      text: emailContent,
      html: htmlContent
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: `Código de recuperación enviado a ${email}. Revisa tu bandeja de entrada.`
      });
    } else {
      res.json({
        success: true,
        token: resetToken,
        message: 'Código generado. No se pudo enviar por email, pero aquí está tu código de recuperación.'
      });
    }
  } catch (err) {
    console.error('Error in reset-password-request:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const {token, newPassword} = req.body;
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.resetToken === token && u.resetExpiry > Date.now());
    
    if (!user) {
      return res.status(400).json({error: 'Código inválido o expirado'});
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    delete user.resetToken;
    delete user.resetExpiry;
    
    await writeJSON('users.json', users);
    
    res.json({success: true, message: 'Contraseña restablecida exitosamente'});
  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/users', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const users = await readJSON('users.json', []);
    const sanitized = users.map(u => ({
      username: u.username,
      name: u.name,
      email: u.email,
      phone: u.phone,
      institucion: u.institucion,
      role: u.role,
      status: u.status,
      cat: u.cat,
      avatar: u.avatar,
      createdAt: u.createdAt
    }));
    res.json(sanitized);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/users/:username', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {username} = req.params;
    const updates = req.body;
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    Object.keys(updates).forEach(key => {
      if (key !== 'username' && key !== 'password') {
        if (username === 'admin' && (key === 'status' || key === 'role')) {
          return;
        }
        user[key] = updates[key];
      }
    });
    
    await writeJSON('users.json', users);
    res.json({success: true});
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/users/:username', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {username} = req.params;
    
    if (username === req.session.user.username) {
      return res.status(400).json({error: 'No puedes eliminarte a ti mismo'});
    }
    
    const users = await readJSON('users.json', []);
    const filtered = users.filter(u => u.username !== username);
    
    await writeJSON('users.json', filtered);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === req.session.user.username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    res.json({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      institucion: user.institucion,
      cat: user.cat,
      avatar: user.avatar,
      role: user.role
    });
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const updates = req.body;
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === req.session.user.username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    ['name', 'email', 'phone', 'institucion', 'cat', 'avatar'].forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });
    
    await writeJSON('users.json', users);
    
    req.session.user.name = user.name;
    req.session.user.cat = user.cat;
    
    res.json({success: true});
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/change-password', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const {currentPassword, newPassword} = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === req.session.user.username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña actual incorrecta'});
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await writeJSON('users.json', users);
    
    res.json({success: true, message: 'Contraseña actualizada correctamente'});
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/anuncios', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const globalAnuncios = await readJSON('anuncios_global.json', []);
    
    if (req.session.user.role === 'admin') {
      return res.json(globalAnuncios);
    }
    
    const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
    const combined = [...globalAnuncios, ...userAnuncios];
    res.json(combined);
  } catch (err) {
    console.error('Error getting anuncios:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/anuncios', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const anuncio = {
      ...req.body,
      id: req.body.id || crypto.randomUUID(),
      owner: req.session.user.username
    };
    
    if (req.session.user.role === 'admin' && req.body.global) {
      const globalAnuncios = await readJSON('anuncios_global.json', []);
      const index = globalAnuncios.findIndex(a => a.id === anuncio.id);
      if (index >= 0) {
        globalAnuncios[index] = anuncio;
      } else {
        globalAnuncios.push(anuncio);
      }
      await writeJSON('anuncios_global.json', globalAnuncios);
    } else {
      const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
      const index = userAnuncios.findIndex(a => a.id === anuncio.id);
      if (index >= 0) {
        userAnuncios[index] = anuncio;
      } else {
        userAnuncios.push(anuncio);
      }
      await writeJSON(`anuncios_${req.session.user.username}.json`, userAnuncios);
    }
    
    res.json({success: true, anuncio});
  } catch (err) {
    console.error('Error saving anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/anuncios/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const {id} = req.params;
    
    if (req.session.user.role === 'admin') {
      const globalAnuncios = await readJSON('anuncios_global.json', []);
      const filtered = globalAnuncios.filter(a => a.id !== id);
      await writeJSON('anuncios_global.json', filtered);
    }
    
    const userAnuncios = await readJSON(`anuncios_${req.session.user.username}.json`, []);
    const filtered = userAnuncios.filter(a => a.id !== id);
    await writeJSON(`anuncios_${req.session.user.username}.json`, filtered);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting anuncio:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/guias', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const globalGuias = await readJSON('guias_global.json', []);
    
    if (req.session.user.role === 'admin') {
      return res.json(globalGuias);
    }
    
    const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
    const combined = [...globalGuias, ...userGuias];
    res.json(combined);
  } catch (err) {
    console.error('Error getting guias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/guias', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const guia = {
      ...req.body,
      id: req.body.id || crypto.randomUUID(),
      owner: req.session.user.username
    };
    
    if (req.session.user.role === 'admin' && req.body.global) {
      const globalGuias = await readJSON('guias_global.json', []);
      const index = globalGuias.findIndex(g => g.id === guia.id);
      if (index >= 0) {
        globalGuias[index] = guia;
      } else {
        globalGuias.push(guia);
      }
      await writeJSON('guias_global.json', globalGuias);
    } else {
      const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
      const index = userGuias.findIndex(g => g.id === guia.id);
      if (index >= 0) {
        userGuias[index] = guia;
      } else {
        userGuias.push(guia);
      }
      await writeJSON(`guias_${req.session.user.username}.json`, userGuias);
    }
    
    res.json({success: true, guia});
  } catch (err) {
    console.error('Error saving guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/guias/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const {id} = req.params;
    
    if (req.session.user.role === 'admin') {
      const globalGuias = await readJSON('guias_global.json', []);
      const filtered = globalGuias.filter(g => g.id !== id);
      await writeJSON('guias_global.json', filtered);
    }
    
    const userGuias = await readJSON(`guias_${req.session.user.username}.json`, []);
    const filtered = userGuias.filter(g => g.id !== id);
    await writeJSON(`guias_${req.session.user.username}.json`, filtered);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting guia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/medications', async (req, res) => {
  try {
    const meds = await readJSON('medications.json', []);
    res.json(meds);
  } catch (err) {
    console.error('Error getting medications:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/medications', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const med = {
      ...req.body,
      id: req.body.id || crypto.randomUUID()
    };
    
    const meds = await readJSON('medications.json', []);
    const index = meds.findIndex(m => m.id === med.id);
    if (index >= 0) {
      meds[index] = med;
    } else {
      meds.push(med);
    }
    
    await writeJSON('medications.json', meds);
    res.json({success: true, medication: med});
  } catch (err) {
    console.error('Error saving medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/medications/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {id} = req.params;
    const meds = await readJSON('medications.json', []);
    const filtered = meds.filter(m => m.id !== id);
    
    await writeJSON('medications.json', filtered);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting medication:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/sugerencias', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    if (req.session.user.role === 'admin') {
      const suggestions = await readJSON('sugerencias.json', []);
      res.json(suggestions);
    } else {
      const suggestions = await readJSON('sugerencias.json', []);
      const userSuggestions = suggestions.filter(s => s.username === req.session.user.username);
      res.json(userSuggestions);
    }
  } catch (err) {
    console.error('Error getting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/sugerencias', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    
    const newSuggestion = {
      id: crypto.randomUUID(),
      username: req.session.user.username,
      mensaje: req.body.mensaje,
      respuesta: '',
      fecha: new Date().toISOString(),
      respondida: false
    };
    
    suggestions.push(newSuggestion);
    await writeJSON('sugerencias.json', suggestions);
    
    res.json({success: true, sugerencia: newSuggestion});
  } catch (err) {
    console.error('Error saving sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/sugerencias/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {id} = req.params;
    const {respuesta} = req.body;
    
    const suggestions = await readJSON('sugerencias.json', []);
    const index = suggestions.findIndex(s => s.id === id);
    
    if (index >= 0) {
      suggestions[index].respuesta = respuesta;
      suggestions[index].respondida = true;
      suggestions[index].fechaRespuesta = new Date().toISOString();
      await writeJSON('sugerencias.json', suggestions);
      res.json({success: true, sugerencia: suggestions[index]});
    } else {
      res.status(404).json({error: 'Sugerencia no encontrada'});
    }
  } catch (err) {
    console.error('Error updating sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/sugerencias/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {id} = req.params;
    const suggestions = await readJSON('sugerencias.json', []);
    const filtered = suggestions.filter(s => s.id !== id);
    
    await writeJSON('sugerencias.json', filtered);
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting sugerencia:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/sugerencias/count', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    const pendientes = suggestions.filter(s => !s.respondida).length;
    res.json({count: pendientes});
  } catch (err) {
    console.error('Error counting sugerencias:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/maintenance', async (req, res) => {
  try {
    const maintenance = await readJSON('maintenance.json', {
      active: false,
      message: 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
    });
    res.json(maintenance);
  } catch (err) {
    console.error('Error getting maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/maintenance', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {active, message} = req.body;
    const maintenance = {
      active: active || false,
      message: message || 'Estamos realizando mejoras en el sistema para brindarte una mejor experiencia. Por favor, vuelve en unos minutos.'
    };
    await writeJSON('maintenance.json', maintenance);
    res.json({success: true, maintenance});
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/plantillas', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    let query = `
      SELECT id, nombre, categoria, contenido, fecha, tamanio, global, creador, created_at 
      FROM plantillas 
      WHERE global = true OR creador = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [req.session.user.username]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting plantillas:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/plantillas', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const { nombre, categoria, contenido, global } = req.body;
    
    if (!nombre || !categoria || !contenido) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const tamanio = Buffer.byteLength(contenido, 'utf8');
    
    if (tamanio > 10 * 1024 * 1024) {
      return res.status(400).json({error: 'La plantilla excede el tamaño máximo de 10MB'});
    }
    
    const isGlobal = req.session.user.role === 'admin' && global === true;
    
    const query = `
      INSERT INTO plantillas (nombre, categoria, contenido, tamanio, global, creador)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nombre,
      categoria,
      contenido,
      tamanio,
      isGlobal,
      req.session.user.username
    ]);
    
    res.json({success: true, plantilla: result.rows[0]});
  } catch (err) {
    console.error('Error saving plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/plantillas/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const { id } = req.params;
    const { nombre, categoria, contenido, global } = req.body;
    
    if (!nombre || !categoria || !contenido) {
      return res.status(400).json({error: 'Datos incompletos'});
    }
    
    const checkQuery = 'SELECT * FROM plantillas WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({error: 'Plantilla no encontrada'});
    }
    
    const plantilla = checkResult.rows[0];
    const isOwner = plantilla.creador === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({error: 'No tienes permiso para editar esta plantilla'});
    }
    
    const tamanio = Buffer.byteLength(contenido, 'utf8');
    
    if (tamanio > 10 * 1024 * 1024) {
      return res.status(400).json({error: 'La plantilla excede el tamaño máximo de 10MB'});
    }
    
    const isGlobal = isAdmin && global === true;
    
    const updateQuery = `
      UPDATE plantillas 
      SET nombre = $1, categoria = $2, contenido = $3, tamanio = $4, global = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      nombre,
      categoria,
      contenido,
      tamanio,
      isGlobal,
      id
    ]);
    
    res.json({success: true, plantilla: result.rows[0]});
  } catch (err) {
    console.error('Error updating plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.delete('/api/plantillas/:id', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const { id } = req.params;
    
    const checkQuery = 'SELECT * FROM plantillas WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({error: 'Plantilla no encontrada'});
    }
    
    const plantilla = checkResult.rows[0];
    const isOwner = plantilla.creador === req.session.user.username;
    const isAdmin = req.session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({error: 'No tienes permiso para eliminar esta plantilla'});
    }
    
    const deleteQuery = 'DELETE FROM plantillas WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    res.json({success: true});
  } catch (err) {
    console.error('Error deleting plantilla:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/tools/status', async (req, res) => {
  try {
    const toolsStatus = await readJSON('tools_status.json', {
      corrector: { enabled: true, name: 'Corrector de Texto' },
      gases: { enabled: true, name: 'Gases Sanguíneos' },
      infusiones: { enabled: true, name: 'Infusiones' },
      plantillas: { enabled: true, name: 'Plantillas' },
      turnos: { enabled: true, name: 'Mis Turnos' },
      ia: { enabled: true, name: 'Asistente IA' },
      interacciones: { enabled: true, name: 'Interacciones Medicamentosas' }
    });
    res.json(toolsStatus);
  } catch (err) {
    console.error('Error getting tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.put('/api/tools/status', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const toolsStatus = req.body;
    await writeJSON('tools_status.json', toolsStatus);
    res.json({success: true, toolsStatus});
  } catch (err) {
    console.error('Error updating tools status:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.get('/api/backup/export', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      jsonFiles: {},
      database: {}
    };
    
    const jsonFiles = ['users.json', 'anuncios_global.json', 'guias_global.json', 'medications.json', 'sugerencias.json', 'maintenance.json'];
    
    for (const file of jsonFiles) {
      backup.jsonFiles[file] = await readJSON(file, []);
    }
    
    const plantillasResult = await pool.query('SELECT * FROM plantillas ORDER BY created_at DESC');
    backup.database.plantillas = plantillasResult.rows;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="medtools-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.json(backup);
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({error: 'Error al crear backup'});
  }
});

app.post('/api/backup/import', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const backup = req.body;
    
    if (!backup || !backup.version || !backup.jsonFiles) {
      return res.status(400).json({error: 'Formato de backup inválido'});
    }
    
    for (const [filename, data] of Object.entries(backup.jsonFiles)) {
      await writeJSON(filename, data);
    }
    
    if (backup.database && backup.database.plantillas) {
      await pool.query('DELETE FROM plantillas');
      
      for (const plantilla of backup.database.plantillas) {
        const query = `
          INSERT INTO plantillas (id, nombre, categoria, contenido, fecha, tamanio, global, creador, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            categoria = EXCLUDED.categoria,
            contenido = EXCLUDED.contenido,
            fecha = EXCLUDED.fecha,
            tamanio = EXCLUDED.tamanio,
            global = EXCLUDED.global,
            creador = EXCLUDED.creador,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          plantilla.id,
          plantilla.nombre,
          plantilla.categoria,
          plantilla.contenido,
          plantilla.fecha || null,
          plantilla.tamanio,
          plantilla.global,
          plantilla.creador,
          plantilla.created_at,
          plantilla.updated_at || plantilla.created_at
        ]);
      }
    }
    
    res.json({success: true, message: 'Backup importado exitosamente'});
  } catch (err) {
    console.error('Error importing backup:', err);
    res.status(500).json({error: 'Error al importar backup: ' + err.message});
  }
});

const BACKUP_DIR = path.join(__dirname, 'backups');

app.post('/api/backup/create', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      jsonFiles: {},
      database: {}
    };
    
    const jsonFiles = ['users.json', 'anuncios_global.json', 'guias_global.json', 'medications.json', 'sugerencias.json', 'maintenance.json', 'tools_status.json'];
    
    for (const file of jsonFiles) {
      backup.jsonFiles[file] = await readJSON(file, []);
    }
    
    const plantillasResult = await pool.query('SELECT * FROM plantillas ORDER BY created_at DESC');
    backup.database.plantillas = plantillasResult.rows;
    
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `medtools-backup-${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(backup, null, 2), 'utf8');
    
    const stats = await fs.stat(filepath);
    
    res.json({
      success: true,
      message: 'Backup creado exitosamente',
      backup: {
        filename,
        size: stats.size,
        created: stats.mtime.toISOString(),
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    });
  } catch (err) {
    console.error('Error creating backup on server:', err);
    res.status(500).json({error: 'Error al crear backup en el servidor'});
  }
});

app.get('/api/backup/list', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(f => f.startsWith('medtools-backup-') && f.endsWith('.json'));
    
    const backupsWithInfo = await Promise.all(
      backupFiles.map(async (filename) => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = await fs.stat(filepath);
        return {
          filename,
          size: stats.size,
          created: stats.mtime.toISOString(),
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
    );
    
    backupsWithInfo.sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(backupsWithInfo);
  } catch (err) {
    console.error('Error listing backups:', err);
    res.status(500).json({error: 'Error al listar backups'});
  }
});

app.get('/api/backup/download/:filename', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const { filename } = req.params;
    
    if (!filename.startsWith('medtools-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({error: 'Nombre de archivo inválido'});
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({error: 'Backup no encontrado'});
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (err) {
    console.error('Error downloading backup:', err);
    res.status(500).json({error: 'Error al descargar backup'});
  }
});

app.delete('/api/backup/:filename', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const { filename } = req.params;
    
    if (!filename.startsWith('medtools-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({error: 'Nombre de archivo inválido'});
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    try {
      await fs.unlink(filepath);
      res.json({success: true, message: 'Backup eliminado correctamente'});
    } catch {
      return res.status(404).json({error: 'Backup no encontrado'});
    }
  } catch (err) {
    console.error('Error deleting backup:', err);
    res.status(500).json({error: 'Error al eliminar backup'});
  }
});

app.post('/api/ai/stream', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autorizado'});
  }
  
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({error: 'Messages array requerido'});
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({error: 'Servicio de IA no configurado. Configure OPENAI_API_KEY en variables de entorno.'});
    }
    
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const systemMessage = {
      role: 'system',
      content: `Eres un asistente médico especializado en pediatría y neonatología. Proporciona información médica precisa basada en evidencia científica. Siempre recuerda:

1. No diagnostiques pacientes específicos
2. Proporciona información general basada en guías clínicas actualizadas
3. Recomienda consultar con profesionales de salud para casos individuales
4. Usa lenguaje técnico médico cuando sea apropiado
5. Cita evidencia científica cuando sea posible
6. Responde en español de manera clara, profesional y estructurada
7. Si mencionas medicamentos, incluye dosis pediátricas cuando sea relevante
8. Prioriza la seguridad del paciente en todas tus respuestas

Estructura tus respuestas de forma clara con viñetas o listas cuando sea apropiado.`
    };
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [systemMessage, ...messages],
      max_completion_tokens: 8192,
      stream: true
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({content})}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Error streaming from OpenAI:', err);
    res.write(`data: ${JSON.stringify({error: err.message})}\n\n`);
    res.end();
  }
});

app.use(express.static('.', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

Promise.all([
  initializeDatabase(),
  initializeData()
]).then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Med Tools Hub Server running at http://${HOST}:${PORT}/`);
  });
}).catch(err => {
  console.error('Error during initialization:', err);
  process.exit(1);
});
