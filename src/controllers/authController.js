const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { readJSON, writeJSON } = require('../services/fileService');
const { sendEmail } = require('../services/emailService');

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
    
    req.session.userId = user.username;
    req.session.user = {
      username: user.username,
      role: user.role,
      name: user.name,
      cat: user.cat,
      status: user.status
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
};

exports.logout = async (req, res) => {
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
};

exports.getSession = (req, res) => {
  if (req.session.user) {
    res.json({authenticated: true, user: req.session.user});
  } else {
    res.json({authenticated: false});
  }
};

exports.verifyEmail = async (req, res) => {
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
};

exports.resendVerification = async (req, res) => {
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
};

module.exports = exports;
