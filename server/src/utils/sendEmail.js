import nodemailer from "nodemailer";
import config from "../config/config.js";

console.log("111SMTP_HOST:", config);
// console.log("SMTP_PORT:", process.env.SMTP_PORT);
// console.log("SMTP_EMAIL:", process.env.SMTP_EMAIL);
// console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.email,
    pass: config.smtp.password,
  },
});

const sendEmail = async ({ email, subject, html }) => {
  await transporter.sendMail({
    from: `"Green Basket" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,
    html,
  });
};

export default sendEmail;
