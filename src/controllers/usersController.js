const { readJSON, writeJSON } = require('../services/fileService');
const { sendEmail } = require('../services/emailService');

exports.getUsers = async (req, res) => {
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
};

exports.updateUser = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
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
};

module.exports = exports;
