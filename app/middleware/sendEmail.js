import nodemailer from "nodemailer";

// const logo = process.env.LOGO_EMAIL;

// Configure the SMTP carrier for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL,
  port: 587,
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
  service: process.env.SERVICE_EMAIL,
  auth: {
    user: process.env.EMAIL_SERVER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const logoAttachment = {
  filename: `${process.env.LOGO_FILENAME}`,
  path: `${process.env.LOGO_PATH_EMAIL}`,
  cid: "logoEmail",
};

// Email to send the password reset link
/**
 * Sends a password reset email to the specified email address.
 *
 * @param {string} email - The email address to send the password reset email to.
 * @param {Object} user - The user who will receive the email.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.first_name - The first_name of the user.
 * @param {string} user.last_name - The last_name of the user.
 * @param {string} user.role - The role of the user.
 * @param {string} user.denomination - The denomination of the user (if role is 'pro').
 * @param {string} resetToken - The token to be included in the password reset link.
 * @returns {Promise<void>} A promise that resolves when the email has been sent.
 */
export async function sendPasswordResetEmail(email, user, resetToken) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: `${email}`,
    subject: "Réinitialisation de mot de passe",
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
          <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
          <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Réinitialisation de mot de passe</h1>
          
          <p style="font-size: 1rem; color: #333;">Bonjour ${
            user.role === "pro" ? user.denomination : (user.first_name ? user.first_name : '')
          },</p>
          <p style="font-size: 1rem; color: #333;">Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          
          <a href="${process.env.CORS_ORIGIN}/forgot-password?token=${resetToken}" style="background-color: #F79323; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 1.1rem; font-weight: bold;">Réinitialiser le mot de passe</a>
          
          <p style="font-size: 1rem; color: #333;">Si vous n'avez pas demandé de réinitialisation de mot de passe, ignorez simplement cet e-mail.</p>
          
          <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the account confirmation link
/**
 * Sends a confirmation email to the user with a confirmation token.
 *
 * @param {string} email - The email address of the user to send the confirmation email to.
 * @param {string} confirmToken - The token used to confirm the user's email address.
 * @returns {Promise<void>} - A promise that resolves when the email has been sent.
 */
export async function confirmEmail(email, confirmToken) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: `${email}`,
    subject: "Confirmation de compte",
    html: `
    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
        <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
        <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Confirmation de compte</h1>
        
        <p style="font-size: 1rem; color: #333;">Bonjour,</p>
        <p style="font-size: 1rem; color: #333;">Votre inscription sur notre plateforme a été effectuée avec succès. Veuillez cliquer sur le bouton ci-dessous pour confirmer votre compte :</p>
        
        <a href="${process.env.CORS_ORIGIN}/confirm-email?token=${confirmToken}" style="background-color: #F79323; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 1.1rem; font-weight: bold;">Confirmer le compte</a>
        
        <p style="font-size: 1rem; color: #333;">Si vous n'avez pas demandé de confirmation de compte, ignorez simplement cet e-mail.</p>
        
        <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
      </div>
    </div>
  `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the password change confirmation
/**
 * Sends an email to notify the user about a password change.
 *
  * @param {Object} user - The user who will receive the email.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.first_name - The first_name of the user.
 * @param {string} user.last_name - The last_name of the user.
 * @param {string} user.role - The role of the user.
 * @param {string} user.denomination - The denomination of the user (if role is 'pro').
 * @returns {Promise<void>} - A promise that resolves when the email has been sent.
 */
export async function changePasswordEmail(user) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: `${user.email}`,
    subject: "Changement de mot de passe",
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
          <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
          <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Confirmation de changement de mot de passe</h1>
          
          <p style="font-size: 1rem; color: #333;">Bonjour ${
            user.role === "pro" ? user.denomination : (user.first_name ? user.first_name : '')
          },</p>
          <p style="font-size: 1rem; color: #333;">Votre mot de passe a bien été changé.</p>
          
          <p style="font-size: 1rem; color: #333;">Si vous n'êtes pas l'auteur de cette action, veuillez nous contacter depuis l'onglet "contact" : <a href="${process.env.CORS_ORIGIN}" style="color: #F79323; font-weight: bold;">izipro</a></p>
        
          <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new message notification
/**
 * Sends an email notification for a new message.
 *
 * @param {Object} user - The user who will receive the email.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.first_name - The first_name of the user.
 * @param {string} user.last_name - The last_name of the user.
 * @param {string} user.role - The role of the user.
 * @param {string} user.denomination - The denomination of the user (if role is 'pro').
 * @param {Object} request - The request related to the message.
 * @param {string} request.title - The title of the request.
 * @param {Object} message - The message details.
 * @param {string} message.created_at - The timestamp when the message was created.
 * @param {Object} ownerMessageData - The data of the message owner.
 * @param {string} ownerMessageData.role - The role of the message owner (e.g., 'pro').
 * @param {string} [ownerMessageData.denomination] -
 * The denomination of the message owner (if role is 'pro').
 * @param {string} [ownerMessageData.first_name] -
 * The first name of the message owner (if role is not 'pro').
 * @param {string} [ownerMessageData.last_name] -
 * The last name of the message owner (if role is not 'pro').
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
export async function newMessageEmail(
  user,
  request,
  message,
  ownerMessageData
) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: `${user.email}`,
    subject: "Nouveau message",
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
          <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
          <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Nouveau message</h1>
          <h2 style="font-size: 1rem;">Demande concernée : <span style="color: #028eef">${
            request.title
          }</span></h2>
          
          <p style="font-size: 1rem; color: #333;">Bonjour ${
            user.role === "pro" ? user.denomination : user.first_name
          },</p>
          <p style="font-size: 1rem; color: #333;">Vous avez reçu un nouveau message le ${new Date(
            Number(message.created_at)
          ).toLocaleDateString("fr-FR")} à ${new Date(
      Number(message.created_at)
    )
      .toLocaleTimeString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", "h")} de <span style="color: #f37c04;">${
      ownerMessageData.role === "pro"
        ? ownerMessageData.denomination
        : `${ownerMessageData.first_name} ${ownerMessageData.last_name}`
    }</span></p>
          
          <a href="${
            process.env.CORS_ORIGIN
          }" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Consulter le message</a>
          
          <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  };

  await transporter.sendMail(mailOptions);
}

// Email to send the new request notification
/**
 * Sends an email notification for a new request.
 *
 * @param {Object} user - The user who will receive the email.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.role - The role of the user (e.g., 'pro').
 * @param {string} [user.denomination] - The denomination of the user if the role is 'pro'.
 * @param {string} [user.first_name] - The first name of the user if the role is not 'pro'.
 * @param {Object} request - The request details.
 * @param {string} request.title - The title of the request.
 * @param {string} request.created_at - The timestamp when the request was created.
 * @param {Object} ownerRequestData - The data of the owner who created the request.
 * @param {string} ownerRequestData.role - The role of the owner (e.g., 'pro').
 * @param {string} [ownerRequestData.denomination] -
 * The denomination of the owner if the role is 'pro'.
 * @param {string} [ownerRequestData.first_name] -
 * The first name of the owner if the role is not 'pro'.
 * @param {string} [ownerRequestData.last_name] -
 * The last name of the owner if the role is not 'pro'.
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
export async function newRequestEmail(user, request, ownerRequestData) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: `${user.email}`,
    subject: "Nouvelle demande",
    html: `
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
          <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
          <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Nouvelle demande</h1>
          <h2 style="font-size: 1rem;">Demande : <span style="color: #028eef">${
            request.title
          }</span></h2>
          
          <p style="font-size: 1rem; color: #333;">Bonjour ${
            user.role === "pro" ? user.denomination : user.first_name
          },</p>
          <p style="font-size: 1rem; color: #333;">Vous avez reçu une nouvelle demande le ${new Date(
            Number(request.created_at)
          ).toLocaleDateString("fr-FR")} à ${new Date(
      Number(request.created_at)
    )
      .toLocaleTimeString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", "h")} de <span style="color: #f37c04;">${
      ownerRequestData.role === "pro"
        ? ownerRequestData.denomination
        : `${ownerRequestData.first_name} ${ownerRequestData.last_name}`
    }</span></p>
          
          <a href="${
            process.env.CORS_ORIGIN
          }" style="background-color: #F79323; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Consulter la demande</a>
          
          <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
        </div>
      </div>
    `,
    attachments: [logoAttachment],
  };
  /*  <p>Description:</p>
      <p>${request.message}</p> */
  await transporter.sendMail(mailOptions);
}

/**
 * Sends a contact email with the provided data.
 *
 * @param {Object} data - The data to be included in the email.
 * @param {string} data.email - The email address of the sender.
 * @param {string} data.description - The message content.
 * @param {string} [data.enterprise] - The enterprise name (optional).
 * @param {string} [data.last_name] -
 * The last name of the sender (optional if enterprise is provided).
 * @param {string} [data.first_name] -
 * The first name of the sender (optional if enterprise is provided).
 * @returns {Promise<void>} - A promise that resolves when the email is sent.
 */
export async function contactSendEmail(data) {
  const mailOptions = {
    from: `"izipro" <${process.env.EMAIL_SERVER}>`,
    to: process.env.EMAIL_CONTACT,
    subject: "Nouveau message de contact",
    html: `
      <img src="cid:logoEmail" alt="logo" style="width: 60px; height: 60px;"/>
      <h1 style="marginTop: 0.3rem;">Nouveau message de contact</h1>

      ${
        data.enterprise
          ? `<p>Société: ${data.enterprise}</p>`
          : `<p>Nom: ${data.last_name}</p>
      <p>Prénom: ${data.first_name}</p>`
      }

      <p>Email: <a href="mailto:${data.email}">${data.email}</a></p>

      <p>Message:</p>
      <p>${data.description}</p>
    `,
    attachments: [logoAttachment],
  };

  const result = await transporter.sendMail(mailOptions);

  if (result.rejected.length > 0) {
    throw new Error("The email could not be sent.");
  } else {
    const returnMailOptions = {
      from: `"izipro" <${process.env.EMAIL_SERVER}>`,
      to: data.email,
      subject: "Confirmation de réception",
      html: `
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <div style="background-color: white; padding: 20px; border-radius: 10px; display: inline-block; max-width: 600px;">
          <img src="cid:logoEmail" alt="logo" style="width: 80px; height: 80px; margin-bottom: 10px;"/>
          <h1 style="color: #F79323; font-size: 1.5rem; margin-top: 0.3rem;">Confirmation de réception</h1>
          
          <p style="font-size: 1rem; color: #333;">Votre message a bien été reçu. Nous vous répondrons dans les plus brefs délais.</p>
          
          <p style="font-size: 1rem; color: #333; margin: 0;">Cordialement,</p>
          <p style="font-size: 1rem; color: #333; margin: 0;">L'équipe izipro.</p>
          
          <p style="color:#8b8b8b; font-size: 0.9rem; margin-top: 20px;">Ceci est un mail automatique, veuillez ne pas répondre.</p>
        </div>
      </div>
    `,
      attachments: [logoAttachment],
    };

    await transporter.sendMail(returnMailOptions);
  }
}

export default { sendPasswordResetEmail, confirmEmail, changePasswordEmail };
