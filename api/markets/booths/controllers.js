const Markets = require('./model');

module.exports = {
  postBooth,
  putBooth,
  deleteBooth,
  getBoothsByDate,
}

function postBooth(req, res) {
  req.body.market_id = req.params.id;
  Markets.addBooth(req.body)
    .then(booth => {
      res.status(201).json(booth.market);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'The booth type could not be added to our database.'})
    })
}

function putBooth(req, res) {
  req.body.market_id = req.params.id;
  Markets.updateBooth(req.params.bID, req.body)
  .then(booth => {
    if (!!booth.updated) {
      res.status(200).json(booth.market);
    } else {
      res.status(404).json({ message: 'We do not have a booth type with the specified ID in our database.' });
    }
  })
  .catch(err => {
    res.status(500).json({knex: err, message: 'The specified booth type could not be updated in our database.'});
  })
}

function deleteBooth(req, res) {
  Markets.removeBooth(req.params.bID)
    .then(booth => {
      if (!!booth.deleted) {
        res.status(200).json(booth.market);
      } else {
        res.status(404).json({
          message: 'We do not have a booth type with the specified ID in our database.',
        });
      }
    })
    .catch(err => {
      res.status(500)
        .json({knex: err, message: 'The specified booth type could not be removed from our database.'});
    })
}

function getBoothsByDate(req, res) {
  Markets.findReserveByDate(req.params.id, req.params.dt, req.user_id)
  .then(booths => {
    !booths.length
      ? res.status(404).json({ message: 'No booths could be found in our database for that date.' })
      : res.status(200).json(booths);
  })
  .catch(err => {
    res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
  });
}
