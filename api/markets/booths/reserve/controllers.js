const Markets = require('../../model');
const sg = require('../../../sendgrid');

module.exports = {
  postReserve,
  putReserve,
  deleteReserve,
}

function postReserve(req, res) {
  req.body = {
    ...req.body,
    booth_id: req.params.bID,
    vendor_id: req.vendor,
    paid: 0
  }
  Markets.addReserve(req.body, req.user_id)
    .then(reserve =>  {
      const date = reserve.result.reserve_date.toUTCString().slice(0,16);
      // Send an email to the market owner
      const mktMsg = [
        reserve.market.email,
        `${reserve.vendor.name} has reserved a ${reserve.market.booth_name} at ${reserve.market.name} on ${date}`,
        `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view the reservation in your upcoming schedule.</p>`
      ]
      sg(...mktMsg);
      // Send an email to the vendor
      const vdrMsg = [
        reserve.vendor.email,
        `${reserve.vendor.name} has reserved a ${reserve.market.booth_name} at ${reserve.market.name} on ${date}`,
        `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view your reservation in your upcoming schedule.</p>`
      ]
      sg(...vdrMsg);
      res.status(201).json(reserve.available)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({knex: err, message: 'The reservation could not be added to our database.'})
    })
}

function putReserve(req, res) {
  req.body = {
    ...req.body,
    booth_id: req.params.bID,
    vendor_id: req.vendor,
    updated_at: new Date()
  }
  Markets.updateReserve(req.params.rsID, req.body, req.user_id)
    .then(updated => {
      if (!!updated.result) {
        if(req.body.paid) {
          const date = updated.result.reserve_date.toUTCString().slice(0,16);
          let subject, html;
          if(updated.result.paid === 1) {
            subject = `${updated.vendor.name}'s payment for ${date} has been processed by ${updated.market.name}`;
            html = `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view the reservation in your upcoming schedule.</p>`
          } else if(updated.result.paid === 0) {
            subject = `${updated.vendor.name}'s payment for ${date} has been marked as unpaid by ${updated.market.name}`;
            html = `<p>You may now log in to your account on our website at <a href="https://www.cloudstands.com">cloudstands.com</a> and view the market's contact information.</p>`
          }
          const vdrMsg = [
            updated.vendor.email,
            subject,
            html
          ]
          sg(...vdrMsg);
        }
        res.status(200).json(updated.available);
      } else {
        res.status(404).json({ message: 'We do not have a reservation with the specified ID in our database.' });
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({knex: err, message: 'The specified market could not be updated in our database.'});
    })
}

function deleteReserve(req, res) {
  Markets.removeReserve(req.params.rsID, req.user_id)
    .then(deleted => {
      if (!!deleted.result) {
        res.status(200).json(deleted.available);
      } else {
        res.status(404).json({
          message: 'We do not have a reservation with the specified ID in our database.',
        });
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500)
        .json({knex: err, message: 'The specified reservation could not be removed from our database.'});
    })
}
