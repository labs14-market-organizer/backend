const router = require('express').Router();
const Vendors = require("./model"); 

router.get('/', (req, res) => {
  Vendors.find()
    .then(vendors => {
      res.status(200).json(vendors);
    })
    .catch(err => {
      res.status(500).json({ message: 'An error occurred while accessing the vendors database.'})
    })
});

router.get('/:id', (req, res) => {
  const {id} = req.params;
  Vendors.findById(id)
    .then(vendor => {
      res.status(200).json(vendor);
    })
    .catch(err => {
      res.status(500).json({ message: 'An error occurred while accessing the vendors database.'})
    })
});

router.post('/', (req, res) => {
  Vendors.add(req.body)
    .then(added => {
      res.status(200).json(added);
    })
    .catch(err => {
      res.status(500).json({ message: 'The vendor could not be added to our database.'})
    })
})

module.exports = router;
