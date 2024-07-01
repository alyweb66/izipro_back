import nodemailer from 'nodemailer';

const logo = 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Fanta_logo_%282009%29.jpg';

// Configure the SMTP carrier for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Email to send the password reset link
export async function sendPasswordResetEmail(email, resetToken) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${email}`,
    subject: 'Réinitialisation de mot de passe',
    html: `
      <h1>Réinitialisation de mot de passe</h1>

      <p>Bonjour,</p>
      <p>Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. :</p>
      <a href="${process.env.CORS_ORIGIN}/forgot-password?token=${resetToken}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser le mot de passe</a>
      <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, ignorez simplement cet e-mail.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the account confirmation link
export async function confirmEmail(email, confirmToken) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${email}`,
    subject: 'Confirmation de compte',
    html: `
      <h1>Confirmation de compte</h1>

      <p>Bonjour,</p>
      <p>Vous avez demandé une confirmation de compte. Cliquez sur le bouton ci-dessous pour confirmer votre compte. :</p>
      <a href="${process.env.CORS_ORIGIN}/confirm-email?token=${confirmToken}" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmer le compte</a>
      <p>Si vous n'avez pas demandé de confirmation de compte, ignorez simplement cet e-mail.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the password change confirmation
export async function changePasswordEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${email}`,
    subject: 'Changement de mot de passe',
    html: `
    <img src="
      <h1>Confirmation de changement de mot de passe</h1>

      <p>Bonjour,</p>
      <p>Votre mot de passe a bien été changé :</p>
      
      <p>Si vous n'êtes pas l'auteur de cette action, veuillez nous contacter</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new message notification
export async function newMessageEmail(user, request, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${user.email}`,
    subject: 'Nouveau message',
    html: `
      <img src="${logo}" alt="logo" style="width: 100px; height: 100px; margin-bottom: 20px;"/>
      <h1 style="fontSize: 1.2rem">Nouveau message</h1>
      <h2 style="fontSize: 1rem"> Demande concernée : <span style="color: #028eef">${request.title}</span></h2>

      <p>Bonjour,</p>
      <p>Vous avez reçu un nouveau message le ${new Date(Number(message.created_at)).toLocaleString('fr-FR', { hour12: false })} de <span style="color: #f37c04;">${user.role === 'pro' ? user.denomination : `${user.first_name} ${user.last_name}`} </span></p>
      <p>Message:</p>
      <p>${message.content ? message.content : 'Connectez vous pour consulter les images ou documents'}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new request notification
export async function newRequestEmail(user, request) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: `${user.email}`,
    subject: 'Nouvelle demande',
    html: `
      <img src="${logo}" alt="logo" style="width: 100px; height: 100px; margin-bottom: 20px;"/>
      <h1 style="fontSize: 1.2rem">Nouvelle demande</h1>
      <h2 style="fontSize: 1rem"> Demande : <span style="color: #028eef">${request.title}</span></h2>

      <p>Bonjour,</p>
      <p>Vous avez reçu une nouvelle demande le ${new Date(Number(request.created_at)).toLocaleString('fr-FR', { hour12: false })} de <span style="color: #f37c04;">${user.role === 'pro' ? user.denomination : `${user.first_name} ${user.last_name}`} </span></p>
      <p>Description:</p>
      <p>${request.message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export default { sendPasswordResetEmail, confirmEmail, changePasswordEmail };
