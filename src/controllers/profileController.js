const bcrypt = require('bcryptjs');
const { query } = require('../services/dbService');
const { sendEmail } = require('../services/emailService');

exports.getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT username, name, email, phone, institucion, cat, avatar, role, status, created_at as "createdAt"
       FROM users WHERE username = $1`,
      [req.session.user.username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({error: 'Error en el servidor'});
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const username = req.session.user.username;
    
    const allowedFields = ['name', 'email', 'phone', 'institucion', 'cat', 'avatar'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({error: 'No hay campos para actualizar'});
    }
    
    values.push(username);
    await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE username = $${paramIndex}`,
      values
    );
    
    if (updates.name) req.session.user.name = updates.name;
    if (updates.cat) req.session.user.cat = updates.cat;
    
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
    
    const result = await query('SELECT * FROM users WHERE username = $1', [req.session.user.username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña actual incorrecta'});
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, user.username]);
    
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
        <strong>Fecha y hora del cambio:</strong><br>
        ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
      </div>
      <div class="alert">
        <strong>Importante:</strong><br>
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
    
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    
    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({error: 'Contraseña incorrecta'});
    }
    
    await query('DELETE FROM users WHERE username = $1', [username]);
    
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
