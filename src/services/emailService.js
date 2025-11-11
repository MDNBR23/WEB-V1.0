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

module.exports = { sendEmail };
