const Markets = require('./model');

module.exports = {
  getMarkets,
  getMarketsBySearch,
  getMarketById,
  postMarket,
  putMarket,
  deleteMarket,
}

function getMarkets(req, res ) {
  Markets.find()
   .then(markets => {
     !markets.length
       ? res.status(404).json({ message: 'No markets could be found in our database.' })
       : res.status(200).json(markets);
   })
   .catch(err => {
     res.status(500).json({knex: err, message: 'An error occurred while accessing the markets database.' });
   });
}

function getMarketsBySearch(req, res) {
  const {query} = req;
  Markets.search(query)
  .then(markets => {
    !markets.length
    ? res.status(404).json({ message: 'No markets could be found in our database that matched the search criteria.' })
    : res.status(200).json(markets);
  })
  .catch(err => {
      res.status(500).json({knex: err, message: 'This is a error message' });
  });
}

function getMarketById(req, res) {
  const id = req.params.id
  Markets.findById(id)
    .then(market => {
      !market
        ? res.status(404).json({message: 'We do not have a market with the specified ID in our database.'})
        : res.status(200).json(market);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'An error occurred while accessing the markets database.'});
    });
}

function postMarket(req, res) {
  if(!!req.user_id) {
    req.body.admin_id = req.user_id;
  }
  // Only public markets for the moment
  req.body = {...req.body, type: 1}
  Markets.add(req.body)
    .then(added => res.status(201).json(added))
    .catch(err => {
        res.status(500)
          .json({knex: err, message: 'The market could not be added to our database.' });
    });
}

function putMarket(req, res) {
  req.body.updated_at = new Date();
  Markets.update(req.params.id, req.body)
    .then(updated => {
      if (!!updated) {
      res.status(200).json(updated);
      } else {
        res.status(404).json({ message: 'We do not have a market with the specified ID in our database.' });
      }
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'The specified market could not be updated in our database.'});
    })
}

function deleteMarket(req, res) {
  Markets.remove(req.params.id)
    .then(deleted => {
      if (!!deleted) {
        res.status(200).json(deleted);
      } else {
        res.status(404).json({
          message: 'We do not have a market with the specified ID in our database.',
        });
      }
    })
    .catch(err => {
      res.status(500)
        .json({knex: err, message: 'The specified market could not be removed from our database.'});
    })
}
