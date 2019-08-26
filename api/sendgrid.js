const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = (to, subject, html) => {
  const msg = {
    from: `Cloud Stands <cloudstandsapp@gmail.com>`,
    to,
    subject,
    html
  }
<<<<<<< HEAD
  console.log(process.env.NODE_ENV)
=======
  // Switch to prevent SendGrid from failing tests or sending email
>>>>>>> 927269b6a1d96a235597350e6b331eb74b1c15b4
  return process.env.NODE_ENV !== 'testing'
    ? sgMail.send(msg)
    : null;
};
