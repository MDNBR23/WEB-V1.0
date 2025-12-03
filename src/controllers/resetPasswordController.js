const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { readJSON, writeJSON } = require('../services/fileService');
const { sendEmail } = require('../services/emailService');

exports.resetPasswordRequest = async (req, res) => {
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
};

exports.resetPassword = async (req, res) => {
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
};

module.exports = exports;
