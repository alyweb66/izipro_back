import nodemailer from 'nodemailer';

// const logo = process.env.LOGO_EMAIL;

// Configure the SMTP carrier for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: 587,
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
  service: process.env.SERVICE_EMAIL,
  auth: {
    user: process.env.EMAIL_SERVER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const logoAttachment = {
  filename: 'logo-email.jpg',
  path: `${process.env.LOGO_PATH_EMAIL}`,
  cid: 'logoEmail',
};

// Email to send the password reset link
export async function sendPasswordResetEmail(email, resetToken) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: `${email}`,
    subject: 'Réinitialisation de mot de passe',
    html: `
    <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1 style="fontSize: 1.2rem">Réinitialisation de mot de passe</h1>

      <p>Bonjour,</p>
      <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. :</p>
      <a href="${process.env.CORS_ORIGIN}/forgot-password?token=${resetToken}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser le mot de passe</a>
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, ignorez simplement cet e-mail.</p>

      ${process.env.CORS_ORIGIN}
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the account confirmation link
export async function confirmEmail(email, confirmToken) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: `${email}`,
    subject: 'Confirmation de compte',
    html: `
    <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1 style="fontSize: 1.2rem">Confirmation de compte</h1>

      <p>Bonjour,</p>
      <p>Vous avez demandé une confirmation de compte. Cliquez sur le bouton ci-dessous pour confirmer votre compte. :</p>
      <a href="${process.env.CORS_ORIGIN}/confirm-email?token=${confirmToken}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmer le compte</a>
      <p>Si vous n'avez pas demandé de confirmation de compte, ignorez simplement cet e-mail.</p>

      ${process.env.CORS_ORIGIN}
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the password change confirmation
export async function changePasswordEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: `${email}`,
    subject: 'Changement de mot de passe',
    html: `
    <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1 style="fontSize: 1.2rem">Confirmation de changement de mot de passe</h1>

      <p>Bonjour,</p>
      <p>Votre mot de passe a bien été changé :</p>
      
      <p>Si vous n'êtes pas l'auteur de cette action, veuillez nous contacter: ${process.env.CORS_ORIGIN}</p>
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new message notification
export async function newMessageEmail(user, request, message) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: `${user.email}`,
    subject: 'Nouveau message',
    html: `
      <img src="cid:logoEmail" alt="logo" style="width: 100px; height: 100px; margin-bottom: 20px;"/>
      <h1 style="fontSize: 1.2rem">Nouveau message</h1>
      <h2 style="fontSize: 1rem"> Demande concernée : <span style="color: #028eef">${request.title}</span></h2>

      <p>Bonjour,</p>
      <p>Vous avez reçu un nouveau message le ${new Date(Number(message.created_at)).toLocaleString('fr-FR', { hour12: false })} de <span style="color: #f37c04;">${user.role === 'pro' ? user.denomination : `${user.first_name} ${user.last_name}`} </span></p>
      <a href="${process.env.CORS_ORIGIN}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Consulter le message</a>
      
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new request notification
export async function newRequestEmail(user, request) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: `${user.email}`,
    subject: 'Nouvelle demande',
    html: `
      <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1 style="fontSize: 1.2rem">Nouvelle demande</h1>
      <h2 style="fontSize: 1rem"> Demande : <span style="color: #028eef">${request.title}</span></h2>

      <p>Bonjour,</p>
      <p>Vous avez reçu une nouvelle demande le ${new Date(Number(request.created_at)).toLocaleString('fr-FR', { hour12: false })} de <span style="color: #f37c04;">${user.role === 'pro' ? user.denomination : `${user.first_name} ${user.last_name}`} </span></p>
      <a href="${process.env.CORS_ORIGIN}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Consulter la demande</a>
    `,
    attachments: [logoAttachment],
  };
  /*  <p>Description:</p>
      <p>${request.message}</p> */
  await transporter.sendMail(mailOptions);
}

export async function contactSendEmail(data) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER,
    to: process.env.EMAIL_CONTACT,
    subject: 'Nouveau message de contact',
    html: `
      <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1>Nouveau message de contact</h1>

      ${data.enterprise ? `<p>Société: ${data.enterprise}</p>`
    : `<p>Nom: ${data.last_name}</p>
      <p>Prénom: ${data.first_name}</p>`}

      <p>Email: ${data.email}</p>

      <p>Message:</p>
      <p>${data.description}</p>
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

export default { sendPasswordResetEmail, confirmEmail, changePasswordEmail };
