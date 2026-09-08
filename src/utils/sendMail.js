import nodemailer from 'nodemailer';

const config = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config);

/**
 * Утиліта для надсилання листа з посиланням для скиду паролю
 */
export const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};
