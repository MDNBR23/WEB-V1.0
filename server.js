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
    from: `"Med Tools Hub Soporte" <soporte@medtoolshub.cloud>`,
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

app.set('trust proxy', true);

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST,
  port: process.env.PGPORT || process.env.DB_PORT,
  database: process.env.PGDATABASE || process.env.DB_NAME,
  user: process.env.PGUSER || process.env.DB_USER,
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  ssl: false
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

const SESSION_SECRET = process.env.SESSION_SECRET || 'medtoolshub-secret-key-change-in-production-2025';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path.replace(/\.html$/, '');
    return res.redirect(301, cleanPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
  
  next();
});

app.use(express.static('.', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  },
  extensions: ['html']
}));

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  if (path.extname(req.path) === '') {
    const normalized = req.path.replace(/^\/+/, '');
    
    if (normalized) {
      const htmlPath = path.join(__dirname, `${normalized}.html`);
      try {
        await fs.access(htmlPath);
        return res.sendFile(htmlPath);
      } catch (err) {
        const indexPath = path.join(__dirname, normalized, 'index.html');
        try {
          await fs.access(indexPath);
          return res.sendFile(indexPath);
        } catch (err2) {
          return next();
        }
      }
    }
  }
  next();
});

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
    const createPlantillasQuery = `
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
    
    const createShiftsQuery = `
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
      )
    `;
    
    const createShiftConfigQuery = `
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
      )
    `;
    
    const createShiftsIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
    `;
    
    const createShiftConfigIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_shift_config_user_id ON shift_config(user_id);
    `;
    
    await pool.query(createPlantillasQuery);
    console.log('Database table "plantillas" initialized successfully');
    
    await pool.query(createShiftsQuery);
    console.log('Database table "shifts" initialized successfully');
    
    await pool.query(createShiftConfigQuery);
    console.log('Database table "shift_config" initialized successfully');
    
    await pool.query(createShiftsIndexQuery);
    await pool.query(createShiftConfigIndexQuery);
    console.log('Database indexes created successfully');
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
      emailVerified: true,
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
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({error: 'Ese correo electrónico ya está registrado'});
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const fullName = `${firstName} ${lastName}`;
    
    const newUser = {
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
      emailVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeJSON('users.json', users);
    
    const protocol = req.protocol || 'https';
    const host = req.get('host') || process.env.REPLIT_DEV_DOMAIN || 'localhost:5000';
    const baseUrl = `${protocol}://${host}`;
    const verificationLink = `${baseUrl}/verify-email.html?token=${verificationToken}`;
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verifica tu correo electrónico - Med Tools Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #008B8B; margin-top: 0;">¡Bienvenido a Med Tools Hub!</h1>
            <p style="font-size: 16px; color: #333;">Hola ${fullName},</p>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Gracias por registrarte en Med Tools Hub. Para completar tu registro y poder acceder a nuestra plataforma, 
              necesitas verificar tu correo electrónico haciendo clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #008B8B; color: white; padding: 14px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                Verificar mi correo electrónico
              </a>
            </div>
            <p style="font-size: 13px; color: #999; margin-top: 20px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${verificationLink}" style="color: #008B8B; word-break: break-all;">${verificationLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
            <p style="font-size: 12px; color: #666; line-height: 1.6;">
              <strong>Al verificar tu correo, aceptas nuestros Términos y Condiciones.</strong><br>
              Una vez verificado tu correo, tu registro quedará en proceso de aprobación. 
              Un administrador revisará tu solicitud y te notificaremos por correo cuando tu cuenta sea aprobada y puedas acceder a la plataforma.
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Si no solicitaste este registro, puedes ignorar este correo.
            </p>
            <p style="font-size: 12px; color: #666; margin-top: 25px;">
              Saludos,<br>
              <strong>El equipo de Med Tools Hub</strong>
            </p>
          </div>
        </div>
      `
    });
    
    if (emailResult.success) {
      res.json({
        message: 'Registro exitoso. Por favor revisa tu correo electrónico para verificar tu cuenta.',
        emailSent: true
      });
    } else {
      res.json({
        message: 'Registro exitoso pero no se pudo enviar el correo de verificación. Por favor contacta al administrador.',
        emailSent: false
      });
    }
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
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña incorrecta'});
    }
    
    if (!user.emailVerified) {
      return res.status(401).json({error: 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.'});
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
    
    const now = new Date().toISOString();
    user.lastLogin = now;
    user.lastHeartbeat = now;
    user.isOnline = true;
    await writeJSON('users.json', users);
    
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

app.post('/api/logout', async (req, res) => {
  try {
    if (req.session.user) {
      const users = await readJSON('users.json', []);
      const user = users.find(u => u.username === req.session.user.username);
      if (user) {
        user.isOnline = false;
        await writeJSON('users.json', users);
      }
    }
    req.session.destroy();
    res.json({success: true});
  } catch (err) {
    console.error('Error in logout:', err);
    req.session.destroy();
    res.json({success: true});
  }
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({authenticated: true, user: req.session.user});
  } else {
    res.json({authenticated: false});
  }
});

app.get('/api/verify-email', async (req, res) => {
  try {
    const {token} = req.query;
    
    if (!token) {
      return res.status(400).json({error: 'Token de verificación requerido'});
    }
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.verificationToken === token);
    
    if (!user) {
      return res.status(404).json({error: 'Token de verificación inválido o expirado'});
    }
    
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'Tu correo electrónico ya había sido verificado anteriormente.',
        alreadyVerified: true
      });
    }
    
    user.emailVerified = true;
    user.verificationToken = null;
    
    await writeJSON('users.json', users);
    
    res.json({
      success: true,
      message: 'Correo electrónico verificado exitosamente. Tu registro está ahora pendiente de aprobación por el administrador.'
    });
  } catch (err) {
    console.error('Error in verify-email:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/resend-verification', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({error: 'No autorizado'});
  }
  
  try {
    const {username} = req.body;
    
    if (!username) {
      return res.status(400).json({error: 'Usuario requerido'});
    }
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'El correo ya está verificado.',
        alreadyVerified: true
      });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    
    await writeJSON('users.json', users);
    
    const protocol = req.get('host').includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${req.get('host')}`;
    const verificationLink = `${baseUrl}/verify-email.html?token=${verificationToken}`;
    
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Verificación de correo electrónico - Med Tools Hub',
      text: `Hola ${user.name || user.username},\n\nPor favor verifica tu correo electrónico haciendo clic en el siguiente enlace:\n${verificationLink}\n\nSaludos,\nEl equipo de Med Tools Hub`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#008B8B,#20B2AA);color:#fff;padding:30px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:28px;">Med Tools Hub</h1>
          </div>
          <div style="background:#fff;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="color:#1f2937;margin-top:0;">Verificación de correo electrónico</h2>
            <p style="color:#4b5563;line-height:1.6;">Hola <strong>${user.name || user.username}</strong>,</p>
            <p style="color:#4b5563;line-height:1.6;">Se ha solicitado reenviar el enlace de verificación de tu correo electrónico. Por favor haz clic en el botón a continuación para verificar tu cuenta:</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${verificationLink}" style="display:inline-block;background:#008B8B;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Verificar mi correo</a>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">Si no solicitaste este correo, puedes ignorarlo de forma segura.</p>
            <p style="color:#4b5563;margin-top:30px;">
              Saludos,<br>
              <strong>El equipo de Med Tools Hub</strong>
            </p>
          </div>
        </div>
      `
    });
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Correo de verificación enviado exitosamente.'
      });
    } else {
      res.status(500).json({
        error: 'No se pudo enviar el correo de verificación.',
        details: emailResult.error
      });
    }
  } catch (err) {
    console.error('Error in resend-verification:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/heartbeat', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === req.session.user.username);
    
    if (user) {
      user.lastHeartbeat = new Date().toISOString();
      user.isOnline = true;
      await writeJSON('users.json', users);
    }
    
    res.json({success: true});
  } catch (err) {
    console.error('Error in heartbeat:', err);
    res.status(500).json({error: 'Error en el servidor'});
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
    
    const resetToken = crypto.randomInt(100000, 1000000).toString();
    const resetExpiry = Date.now() + 600000;
    
    user.resetToken = resetToken;
    user.resetExpiry = resetExpiry;
    
    await writeJSON('users.json', users);
    
    const emailContent = `Hola ${user.name || user.username},

Has solicitado restablecer tu contraseña en Med Tools Hub.

Tu código de recuperación es: ${resetToken}

Este código es válido por 10 minutos.

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
    .code { background: #f0f9ff; border: 2px solid #008080; border-radius: 8px; padding: 20px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #008080; }
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
      <p>Este código es válido por <strong>10 minutos</strong>.</p>
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
      console.error('Failed to send recovery email:', emailResult.error);
      res.status(500).json({
        error: 'No se pudo enviar el correo de recuperación. Por favor contacta al administrador o intenta más tarde.'
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
    const HEARTBEAT_TIMEOUT = 5 * 60 * 1000;
    const now = Date.now();
    let modified = false;
    
    users.forEach(u => {
      if (u.isOnline) {
        if (!u.lastHeartbeat) {
          u.isOnline = false;
          modified = true;
        } else {
          const lastHeartbeatTime = new Date(u.lastHeartbeat).getTime();
          if (isNaN(lastHeartbeatTime) || now - lastHeartbeatTime > HEARTBEAT_TIMEOUT) {
            u.isOnline = false;
            modified = true;
          }
        }
      }
    });
    
    if (modified) {
      await writeJSON('users.json', users);
    }
    
    const sanitized = users.map(u => ({
      username: u.username,
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      institucion: u.institucion,
      role: u.role,
      status: u.status,
      cat: u.cat,
      avatar: u.avatar,
      createdAt: u.createdAt,
      isOnline: u.isOnline || false,
      lastLogin: u.lastLogin,
      lastHeartbeat: u.lastHeartbeat
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
    
    const previousStatus = user.status;
    
    Object.keys(updates).forEach(key => {
      if (key !== 'username' && key !== 'password') {
        if (username === 'admin' && (key === 'status' || key === 'role')) {
          return;
        }
        user[key] = updates[key];
      }
    });
    
    if (updates.firstName || updates.lastName) {
      const firstName = updates.firstName || user.firstName || '';
      const lastName = updates.lastName || user.lastName || '';
      user.name = `${firstName} ${lastName}`.trim();
    }
    
    await writeJSON('users.json', users);
    
    if (previousStatus !== 'aprobado' && user.status === 'aprobado' && user.email) {
      const protocol = req.protocol || 'https';
      const host = req.get('host') || process.env.REPLIT_DEV_DOMAIN || 'localhost:5000';
      const baseUrl = `${protocol}://${host}`;
      
      const emailResult = await sendEmail({
        to: user.email,
        subject: '¡Tu cuenta ha sido aprobada! - Med Tools Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #008B8B; margin-top: 0;">¡Bienvenido a Med Tools Hub!</h1>
              <p style="font-size: 16px; color: #333;">Hola ${user.name || user.username},</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                ¡Excelentes noticias! Tu cuenta ha sido aprobada por nuestro equipo de administración.
                Ya puedes acceder a todas las funcionalidades de Med Tools Hub.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}" 
                   style="background-color: #008B8B; color: white; padding: 14px 30px; text-decoration: none; 
                          border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                  Iniciar Sesión
                </a>
              </div>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Ahora puedes iniciar sesión con tus credenciales y disfrutar de:
              </p>
              <ul style="font-size: 14px; color: #666; line-height: 1.8;">
                <li>Acceso completo al Vademecum Neonatal y Pediátrico</li>
                <li>Herramientas de cálculo médico especializadas</li>
                <li>Guías clínicas actualizadas</li>
                <li>Comunidad de profesionales de la salud</li>
              </ul>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 25px;">
                Saludos,<br>
                <strong>El equipo de Med Tools Hub</strong>
              </p>
            </div>
          </div>
        `
      });
      
      if (!emailResult.success) {
        console.error('Failed to send approval email to:', user.email);
      }
    }
    
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
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
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
    
    if (user.email) {
      const emailContent = `Hola ${user.name || user.username},

Tu contraseña en Med Tools Hub ha sido cambiada exitosamente.

Fecha y hora del cambio: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}

Si no fuiste tú quien realizó este cambio, por favor contacta inmediatamente con el soporte o restablece tu contraseña.

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
    .alert { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0; color: #0c5460; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Med Tools Hub</h1>
      <p>Notificación de Seguridad</p>
    </div>
    <div class="content">
      <p>Hola <strong>${user.name || user.username}</strong>,</p>
      <p>Tu contraseña en Med Tools Hub ha sido cambiada exitosamente.</p>
      <div class="info">
        <strong>📅 Fecha y hora del cambio:</strong><br>
        ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
      </div>
      <div class="alert">
        <strong>⚠️ Importante:</strong><br>
        Si no fuiste tú quien realizó este cambio, por favor contacta inmediatamente con el soporte o restablece tu contraseña.
      </div>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático, por favor no responder.</p>
      <p>contacto@medtoolshub.cloud</p>
    </div>
  </div>
</body>
</html>`;

      await sendEmail({
        to: user.email,
        subject: 'Contraseña Cambiada - Med Tools Hub',
        text: emailContent,
        html: htmlContent
      });
    }
    
    res.json({success: true, message: 'Contraseña actualizada correctamente'});
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
});

app.post('/api/delete-account', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const {password} = req.body;
    
    if (!password) {
      return res.status(400).json({error: 'Contraseña requerida para confirmar'});
    }
    
    const username = req.session.user.username;
    
    if (username === 'admin') {
      return res.status(403).json({error: 'No se puede eliminar la cuenta de administrador'});
    }
    
    const users = await readJSON('users.json', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña incorrecta'});
    }
    
    const filtered = users.filter(u => u.username !== username);
    await writeJSON('users.json', filtered);
    
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Cuenta eliminada - Med Tools Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #008B8B; margin-top: 0;">Cuenta eliminada</h1>
              <p style="font-size: 16px; color: #333;">Hola ${user.name || user.username},</p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Tu cuenta en Med Tools Hub ha sido eliminada exitosamente según tu solicitud.
                Todos tus datos personales han sido eliminados de nuestros sistemas.
              </p>
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Lamentamos verte partir. Si cambias de opinión en el futuro, siempre serás bienvenido a registrarte nuevamente.
              </p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Si no solicitaste esta eliminación, contacta inmediatamente al administrador.
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 25px;">
                Gracias por haber sido parte de Med Tools Hub,<br>
                <strong>El equipo de Med Tools Hub</strong>
              </p>
            </div>
          </div>
        `
      });
    }
    
    req.session.destroy();
    res.json({success: true, message: 'Tu cuenta ha sido eliminada correctamente'});
  } catch (err) {
    console.error('Error deleting account:', err);
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
      respondida: false,
      vista: false
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
      suggestions[index].vista = false;
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

app.patch('/api/sugerencias/mark-seen', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({error: 'No autenticado'});
  }
  
  try {
    const suggestions = await readJSON('sugerencias.json', []);
    let modified = false;
    
    suggestions.forEach(s => {
      if (s.username === req.session.user.username && s.respondida && !s.vista) {
        s.vista = true;
        modified = true;
      }
    });
    
    if (modified) {
      await writeJSON('sugerencias.json', suggestions);
    }
    
    res.json({success: true});
  } catch (err) {
    console.error('Error marking sugerencias as seen:', err);
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
      version: '1.1',
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
    
    const shiftsResult = await pool.query('SELECT * FROM shifts ORDER BY shift_date DESC');
    backup.database.shifts = shiftsResult.rows;
    
    const shiftConfigResult = await pool.query('SELECT * FROM shift_config ORDER BY id');
    backup.database.shift_config = shiftConfigResult.rows;
    
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
    
    if (backup.database && backup.database.shifts) {
      await pool.query('DELETE FROM shifts');
      
      for (const shift of backup.database.shifts) {
        const query = `
          INSERT INTO shifts (id, user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            entity_name = EXCLUDED.entity_name,
            shift_date = EXCLUDED.shift_date,
            shift_type = EXCLUDED.shift_type,
            hours = EXCLUDED.hours,
            hourly_rate = EXCLUDED.hourly_rate,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          shift.id,
          shift.user_id,
          shift.entity_name,
          shift.shift_date,
          shift.shift_type,
          shift.hours || 0,
          shift.hourly_rate || 0,
          shift.notes || '',
          shift.created_at,
          shift.updated_at || shift.created_at
        ]);
      }
    }
    
    if (backup.database && backup.database.shift_config) {
      await pool.query('DELETE FROM shift_config');
      
      for (const config of backup.database.shift_config) {
        const query = `
          INSERT INTO shift_config (id, user_id, ops_entity_name, ops_frequency_days, ops_hours, ops_hourly_rate, last_ops_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO UPDATE SET
            ops_entity_name = EXCLUDED.ops_entity_name,
            ops_frequency_days = EXCLUDED.ops_frequency_days,
            ops_hours = EXCLUDED.ops_hours,
            ops_hourly_rate = EXCLUDED.ops_hourly_rate,
            last_ops_date = EXCLUDED.last_ops_date,
            updated_at = EXCLUDED.updated_at
        `;
        await pool.query(query, [
          config.id,
          config.user_id,
          config.ops_entity_name || null,
          config.ops_frequency_days || 6,
          config.ops_hours || 12,
          config.ops_hourly_rate || 0,
          config.last_ops_date || null,
          config.created_at,
          config.updated_at || config.created_at
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
      version: '1.1',
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
    
    const shiftsResult = await pool.query('SELECT * FROM shifts ORDER BY shift_date DESC');
    backup.database.shifts = shiftsResult.rows;
    
    const shiftConfigResult = await pool.query('SELECT * FROM shift_config ORDER BY id');
    backup.database.shift_config = shiftConfigResult.rows;
    
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
    
    if (!process.env.OLLAMA_HOST) {
      return res.status(503).json({error: 'Servicio de IA no configurado. Configure OLLAMA_HOST en variables de entorno.'});
    }
    
    const systemPrompt = `Eres un asistente médico especializado en pediatría y neonatología. Tu objetivo es ayudar de manera clara, directa y útil.

REGLAS IMPORTANTES:
- Responde de forma conversacional y natural
- Ajusta la longitud de tu respuesta a la pregunta: preguntas simples = respuestas breves, preguntas complejas = respuestas detalladas
- Sé directo y ve al punto
- No des disclaimers largos en cada respuesta
- Proporciona información médica general basada en evidencia
- No diagnostiques pacientes específicos
- Recomienda consultar profesionales cuando sea necesario
- Usa lenguaje técnico solo cuando sea apropiado
- Si mencionas medicamentos, incluye dosis pediátricas relevantes

Responde de manera profesional pero amigable, como un colega médico experimentado.`;
    
    let conversationPrompt = systemPrompt + '\n\n';
    for (const msg of messages) {
      if (msg.role === 'user') {
        conversationPrompt += `Usuario: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        conversationPrompt += `Asistente: ${msg.content}\n\n`;
      }
    }
    conversationPrompt += 'Asistente: ';
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const ollamaModel = process.env.OLLAMA_MODEL || 'tinyllama';
    
    const response = await fetch(`${process.env.OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: ollamaModel,
        prompt: conversationPrompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({content: json.response})}\n\n`);
          }
          if (json.done) {
            res.write('data: [DONE]\n\n');
          }
        } catch (e) {
          console.error('Error parsing Ollama chunk:', e);
        }
      }
    }
    
    res.end();
  } catch (err) {
    console.error('Error streaming from Ollama:', err);
    res.write(`data: ${JSON.stringify({error: err.message})}\n\n`);
    res.end();
  }
});

app.get('/api/shifts', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM shifts WHERE user_id = $1';
    const params = [req.session.userId];
    
    if (startDate && endDate) {
      query += ' AND shift_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY shift_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ shifts: result.rows });
  } catch (err) {
    console.error('Error fetching shifts:', err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

app.post('/api/shifts', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { entity_name, shift_date, shift_type, hours, hourly_rate, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO shifts (user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.session.userId, entity_name, shift_date, shift_type, hours || 0, hourly_rate || 0, notes || '']
    );
    
    res.json({ shift: result.rows[0], success: true });
  } catch (err) {
    console.error('Error creating shift:', err);
    res.status(500).json({ error: 'Error al crear turno' });
  }
});

app.put('/api/shifts/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { id } = req.params;
    const { entity_name, shift_date, shift_type, hours, hourly_rate, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE shifts 
       SET entity_name = $1, shift_date = $2, shift_type = $3, hours = $4, hourly_rate = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [entity_name, shift_date, shift_type, hours, hourly_rate, notes, id, req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    res.json({ shift: result.rows[0], success: true });
  } catch (err) {
    console.error('Error updating shift:', err);
    res.status(500).json({ error: 'Error al actualizar turno' });
  }
});

app.delete('/api/shifts/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM shifts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting shift:', err);
    res.status(500).json({ error: 'Error al eliminar turno' });
  }
});

app.get('/api/shifts/summary', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        entity_name,
        COUNT(*) as shift_count,
        SUM(hours) as total_hours,
        SUM(hours * hourly_rate) as total_amount,
        AVG(hourly_rate) as avg_rate
      FROM shifts 
      WHERE user_id = $1`;
    
    const params = [req.session.userId];
    
    if (startDate && endDate) {
      query += ' AND shift_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    
    query += ' GROUP BY entity_name ORDER BY total_amount DESC';
    
    const result = await pool.query(query, params);
    
    const totalQuery = `
      SELECT 
        COUNT(*) as total_shifts,
        SUM(hours) as total_hours,
        SUM(hours * hourly_rate) as total_amount
      FROM shifts 
      WHERE user_id = $1` + (startDate && endDate ? ' AND shift_date BETWEEN $2 AND $3' : '');
    
    const totalResult = await pool.query(totalQuery, params);
    
    res.json({ 
      byEntity: result.rows,
      totals: totalResult.rows[0]
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

app.get('/api/shifts/config', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const result = await pool.query(
      'SELECT * FROM shift_config WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      const defaultConfig = await pool.query(
        `INSERT INTO shift_config (user_id, ops_enabled, ops_frequency_days, ops_hours, ops_hourly_rate)
         VALUES ($1, false, 7, 12, 0) RETURNING *`,
        [req.session.userId]
      );
      return res.json({ config: defaultConfig.rows[0] });
    }
    
    res.json({ config: result.rows[0] });
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

app.post('/api/shifts/config', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const { ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate } = req.body;
    
    const result = await pool.query(
      `INSERT INTO shift_config (user_id, ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         ops_enabled = $2,
         ops_frequency_days = $3,
         ops_entity_name = $4,
         ops_hours = $5,
         ops_hourly_rate = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.session.userId, ops_enabled, ops_frequency_days, ops_entity_name, ops_hours, ops_hourly_rate]
    );
    
    res.json({ config: result.rows[0], success: true });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

app.post('/api/shifts/generate-ops', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const config = await pool.query(
      'SELECT * FROM shift_config WHERE user_id = $1',
      [req.session.userId]
    );
    
    if (config.rows.length === 0 || !config.rows[0].ops_enabled) {
      return res.status(400).json({ error: 'OPS no está habilitado' });
    }
    
    const cfg = config.rows[0];
    const lastDate = cfg.last_ops_date ? new Date(cfg.last_ops_date) : new Date();
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + cfg.ops_frequency_days);
    
    const today = new Date();
    const shiftsToCreate = [];
    
    while (nextDate <= today) {
      shiftsToCreate.push({
        user_id: req.session.userId,
        entity_name: cfg.ops_entity_name || 'OPS',
        shift_date: nextDate.toISOString().split('T')[0],
        shift_type: 'OPS',
        hours: cfg.ops_hours,
        hourly_rate: cfg.ops_hourly_rate,
        notes: 'Generado automáticamente'
      });
      nextDate.setDate(nextDate.getDate() + cfg.ops_frequency_days);
    }
    
    if (shiftsToCreate.length > 0) {
      for (const shift of shiftsToCreate) {
        await pool.query(
          `INSERT INTO shifts (user_id, entity_name, shift_date, shift_type, hours, hourly_rate, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [shift.user_id, shift.entity_name, shift.shift_date, shift.shift_type, shift.hours, shift.hourly_rate, shift.notes]
        );
      }
      
      await pool.query(
        'UPDATE shift_config SET last_ops_date = $1 WHERE user_id = $2',
        [shiftsToCreate[shiftsToCreate.length - 1].shift_date, req.session.userId]
      );
    }
    
    res.json({ success: true, generated: shiftsToCreate.length, shifts: shiftsToCreate });
  } catch (err) {
    console.error('Error generating OPS shifts:', err);
    res.status(500).json({ error: 'Error al generar turnos OPS' });
  }
});

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
