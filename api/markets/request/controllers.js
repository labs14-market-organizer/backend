const Markets = require('./model');
const sg = require('../../sendgrid');

module.exports = {
  postRequest,
  putRequest,
  deleteRequest,
}

function postRequest(req, res) {
  req.body = {
    ...req.body,
    market_id: req.params.id,
    vendor_id: req.vendor,
    status: 1 // Currently only have public markets
  }
  Markets.addRequest(req.body)
    .then(added => {
      // Send an email to the market owner
      const mktMsg = [
        added.market.email,
        `${added.vendor.name} has joined ${added.market.name}!`,
        `<p>Please log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view their vendor profile for contact information and other details.</p>`
      ]
      sg(...mktMsg);
      // Send an email to the vendor
      const vdrMsg = [
        added.vendor.email,
        `${added.vendor.name} has joined ${added.market.name}!`,
        `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and reserve a booth at ${added.market.name}.</p>`
      ]
      sg(...vdrMsg);
      res.status(201).json(added.result);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'The request could not be added to our database.'})
    })
}

function putRequest(req, res) {
  req.body = {
    ...req.body,
    market_id: req.params.id,
    updated_at: new Date()
  }
  Markets.updateRequest(req.params.rqID, req.body)
    .then(updated => {
      if (!!updated.result) {
        if(req.body.status) {
          let subject, html;
          if(updated.result.status === 1) {
            subject = `${updated.vendor.name} has been approved by ${updated.market.name}`;
            html = `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and reserve a booth at ${updated.market.name}.</p>`;
          } else if(updated.result.status === -1) {
            subject = `${updated.vendor.name} has been rejected by ${updated.market.name}`;
            html = `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and search for other markets to join.</p>`;
          } else if(updated.result.status === 0) {
            subject = `${updated.vendor.name}'s status at ${updated.market.name} has been changed to pending`;
            html = `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> to contact ${updated.market.name} or search for other markets to join.</p>`;
          }
          const vdrMsg = [
            updated.vendor.email,
            subject,
            html
          ]
          sg(...vdrMsg);
        }
        res.status(200).json(updated.result);
      } else {
        res.status(404).json({ message: 'We do not have a request with the specified ID in our database.' });
      }
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'The specified request could not be updated in our database.'});
    })
}

function deleteRequest(req, res) {
  Markets.removeRequest(req.params.rqID)
    .then(deleted => {
      if (!!deleted.result) {
        const mktMsg = [
          deleted.market.email,
          `${deleted.vendor.name}'s request to join ${deleted.market.name} has been deleted`,
          `<p>If you believe this was in error, please log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view their profile for contact information and other details.</p>`
        ]
        sg(...mktMsg);
        const vdrMsg = [
          deleted.vendor.email,
          `${deleted.vendor.name}'s request to join ${deleted.market.name} has been deleted`,
          `<p>If you believe this was in error, please log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view their profile for contact information and other details.</p>`
        ]
        sg(...vdrMsg);
        res.status(200).json(deleted.result);
      } else {
        res.status(404).json({
          message: 'We do not have a request with the specified ID in our database.',
        });
      }
    })
    .catch(err => {
      res.status(500)
        .json({knex: err, message: 'The specified request could not be removed from our database.'});
    })
}