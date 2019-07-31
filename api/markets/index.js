const router = require('express').Router();
const Markets = require("./model");
const {protect, parseQueryAddr, onlyOwner, reqCols, reqNestCols, validate, onlyCols, onlyNestCols} = require('../middleware');
const spec = require('./validate');

router.get('/', (req, res ) => {
   Markets.find()
    .then(markets => {
      !markets.length
        ? res.status(404).json({ message: 'No markets could be found in our database.' })
        : res.status(200).json(markets);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'An error occurred while accessing the markets database.' });
    });
});

router.get('/search',
  parseQueryAddr,
  (req, res)  => {
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
)

router.get('/:id', (req, res ) => {
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
});

const marketReq = ['name']
const marketOnly = ['admin_id', 'name', 'description', 'operation', 'address', 'city', 'state', 'zipcode', 'type', 'website', 'facebook', 'twitter', 'instagram']
const marketNestReq = {operation: ['day', 'start', 'end']};
const marketPostNestOnly = {operation: ['day', 'start', 'end']};
router.post('/',
  protect,
  reqCols(marketReq, true, 'admin_id'),
  reqNestCols(marketNestReq),
  onlyCols(marketOnly),
  onlyNestCols(marketPostNestOnly),
  spec.market, validate,
  (req, res) => {
    if(!!req.user_id) {
      req.body.admin_id = req.user_id;
    }
    Markets.add(req.body)
      .then(added => res.status(201).json(added))
      .catch(err => {
          res.status(500)
            .json({knex: err, message: 'The market could not be added to our database.' });
      });
});

const marketPutNestOnly = {operation: ['id','day','start','end']};
router.put('/:id',
  protect,
  onlyOwner('markets', 'admin_id')(),
  onlyCols(marketOnly),
  onlyNestCols(marketPutNestOnly),
  spec.market, validate,
  (req, res) => {
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
});

router.delete('/:id',
  protect,
  onlyOwner('markets', 'admin_id')(),
  (req, res) => {
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
});

// ***
const boothReq = ['type', 'number']
const boothOnly = ['type', 'number', 'price', 'size', 'description']
router.post('/:id/booths',
  protect,
  onlyOwner('markets', 'admin_id')(),
  reqCols(boothReq),
  onlyCols(boothOnly),
  spec.booth, validate,
  (req, res) => {
    req.body.market_id = req.params.id;
    Markets.addBooth(req.body)
      .then(added => {
        res.status(201).json(added);
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The booth type could not be added to our database.'})
      })
  }
)

// ***
router.put('/:id/booths/:bID',
  protect,
  onlyOwner('markets', 'admin_id')
    ('market_booths', 'market_id', {'markets.id': 'market_booths.market_id'}, 'bID'),
  onlyCols(boothOnly),
  spec.booth, validate,
  (req, res) => {
    req.body.market_id = req.params.id;
    Markets.updateBooth(req.params.id, req.body)
    .then(updated => {
      if (!!updated) {
      res.status(200).json(updated);
      } else {
        res.status(404).json({ message: 'We do not have a booth type with the specified ID in our database.' });
      }
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'The specified booth type could not be updated in our database.'});
    })
  }
)

// ***
router.delete('/:id/booths/:bID',
  protect,
  onlyOwner('markets', 'admin_id')
    ('market_booths', 'market_id', {'markets.id': 'market_booths.market_id'}, 'bID'),
  (req, res) => {
    Markets.removeBooth(req.params.bID)
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
)

module.exports = router;
