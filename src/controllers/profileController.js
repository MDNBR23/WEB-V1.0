const bcrypt = require('bcryptjs');
const { readJSON, writeJSON } = require('../services/fileService');
const { sendEmail } = require('../services/emailService');

exports.getProfile = async (req, res) => {
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
};

exports.updateProfile = async (req, res) => {
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
};

exports.changePassword = async (req, res) => {
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
};

exports.deleteAccount = async (req, res) => {
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
};

module.exports = exports;
