const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = (to, subject, html) => {
  const msg = {
    from: `Cloud Stands <cloudstandsapp@gmail.com>`,
    to,
    subject,
    html
  }
  // Switch to prevent SendGrid from failing tests or sending email
  console.log('FOOBAR')
  console.log(process.env.NODE_ENV)
  return process.env.NODE_ENV !== 'testing'
    ? sgMail.send(msg)
    : null;
};
