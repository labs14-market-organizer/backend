const Vendors = require("./model");

module.exports = {
  getVendors,
  getVendorById,
  postVendor,
  putVendor,
  removeVendor,
}

function getVendors(req, res) {
  Vendors.find()
    .then(vendors => {
      !vendors.length
        ? res.status(404).json({ message: 'No vendors could be found in our database.' })
        : res.status(200).json(vendors);
    })
    .catch(err => {
      res.status(500).json({
        knex: err,
        message: 'An error occurred while accessing the vendors database.'
      })
    })
}

function getVendorById(req, res) {
  const {id} = req.params;
  Vendors.findById(id)
    .then(vendor => {
      !vendor
        ? res.status(404).json({ message: 'We do not have a vendor with the specified ID in our database.' })
        : res.status(200).json(vendor);
    })
    .catch(err => {
      res.status(500).json({
        knex: err,
        message: 'An error occurred while accessing the vendors database.'
      })
    })
}

function postVendor(req, res) {
  if(!!req.user_id) {
    req.body.admin_id = req.user_id;
  }
  Vendors.add(req.body)
    .then(added => {
      res.status(201).json(added[0]);
    })
    .catch(err => {
      res.status(500).json({
        knex: err,
        message: 'The vendor could not be added to our database.'
      })
    })
}

function putVendor(req, res) {
  const {id} = req.params;
  req.body.updated_at = new Date();
  Vendors.update(id, req.body)
    .then(updated => {
      !updated.length
        ? res.status(404).json({ message: 'We do not have a vendor with the specified ID in our database.' })
        : res.status(200).json(updated[0]);
    })
    .catch(err => {
      res.status(500).json({
        knex: err,
        message: 'The specified vendor could not be updated in our database.'
      })
    })
}

function removeVendor(req, res) {
  const {id} = req.params;
  Vendors.remove(id)
    .then(deleted => {
      !deleted.length
        ? res.status(404).json({ message: 'We do not have a vendor with the specified ID in our database.' })
        : res.status(200).json(deleted[0]);
    })
    .catch(err => {
      res.status(500).json({
        knex: err,
        message: 'The specified vendor could not be removed from our database.'
      })
    })
}