const sg = require('../../sendgrid');

module.exports = {
  welcome,
}

function welcome(to) {
  console.log('EMAIL')
  const subject = `Thank you for joining Cloud Stands`;
  const html = `<p>Please log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and create your market or vendor profile to get started.</p>`;
  return sg(to, subject, html);
}