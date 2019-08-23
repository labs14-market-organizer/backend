const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = (to, subject, html) => {
  const msg = {
    from: `Cloud Stands <cloudstandsapp@gmail.com>`,
    to,
    subject,
    html
  }
  return sgMail.send(msg);
};
