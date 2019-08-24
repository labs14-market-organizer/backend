const Markets = require('../model');

module.exports = {
  getVendors,
  getVendorsByDate,
}

function getVendors(req, res) {
  let args = [req.params.id]
  if(!!req.query.q) {
    args.push(req.query.q)
  }
  Markets.findVendors(...args)
  .then(vendors => {
    !vendors.length
      ? res.status(404).json({ message: 'No vendors could be found in our database for that market.' })
      : res.status(200).json(vendors);
  })
  .catch(err => {
    res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
  });
}

function getVendorsByDate(req, res) {
  let args = [req.params.id, req.params.dt]
  if(!!req.query.q) {
    args.push(req.query.q)
  }
  Markets.findVendorsByDate(...args)
  .then(vendors => {
    !vendors.length
      ? res.status(200).json(['No vendors are reserved for this date.'])
      : res.status(200).json(vendors);
  })
  .catch(err => {
    res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
  });
}
