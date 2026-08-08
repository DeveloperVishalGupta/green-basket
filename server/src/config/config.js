export default {
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    email: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD,
  },
};
