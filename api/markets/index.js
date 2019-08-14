const router = require('express').Router();
const Markets = require("./model");
const {protect, parseQueryAddr, parentExists, onlyOwner, reqCols, reqNestCols, validate, onlyCols, onlyNestCols} = require('../middleware');
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

const marketReq = ['name', 'email', 'phone']
const marketOnly = ['admin_id','rules', 'name', 'description', 'operation', 'address', 'city', 'state', 'zipcode', 'type', 'website', 'facebook', 'twitter', 'instagram', 'email', 'phone']
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
  onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
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
  onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
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

// Market_vendors endpoints
// const requestReqPost = []
router.post('/:id/request',
  protect,
  parentExists({markets: 'id'}),
  // onlyCols(requestReqPost),
  spec.request, validate,
  (req, res) => {
    req.body = {
      ...req.body,
      market_id: req.params.id,
      vendor_id: req.vendor,
      status: 1 // Currently only have public markets
    }
    Markets.addRequest(req.body)
      .then(added => {
        res.status(201).json(added);
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The request could not be added to our database.'})
      })
  }
)

const requestReqPut = ['status'];
const requestOnly = ['status'];
router.put('/:id/request/:rqID',
  protect,
  parentExists({markets: 'id'}),
  onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  reqCols(requestReqPut),
  onlyCols(requestOnly),
  spec.request, validate,
  (req, res) => {
    req.body = {
      ...req.body,
      market_id: req.params.id,
      vendor_id: req.vendor,
      updated_at: new Date()
    }
    Markets.updateRequest(req.params.rqID, req.body)
      .then(updated => {
        if (!!updated) {
          res.status(200).json(updated);
        } else {
          res.status(404).json({ message: 'We do not have a request with the specified ID in our database.' });
        }
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The specified request could not be updated in our database.'});
      })
  }
)

router.delete('/:id/request/:rqID',
  protect,
  parentExists({markets: 'id'}),
  onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  spec.request, validate,
  (req, res) => {
    Markets.removeRequest(req.params.rqID)
      .then(deleted => {
        if (!!deleted) {
          res.status(200).json(deleted);
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
)

// Booth POST, PUT, & DELETE endpoints
const boothReq = ['name', 'number']
const boothOnly = ['name', 'number', 'price', 'size', 'description']
router.post('/:id/booths',
  protect,
  parentExists({markets: 'id'}),
  onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  reqCols(boothReq),
  onlyCols(boothOnly),
  spec.booth, validate,
  (req, res) => {
    req.body.market_id = req.params.id;
    Markets.addBooth(req.body)
      .then(booth => {
        res.status(201).json(booth.market);
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The booth type could not be added to our database.'})
      })
  }
)

const boothOwner = {
  markets: {
    id: 'admin_id',
    param: 'id',
    join: [{
      table: 'market_booths',
      id: 'market_id',
      param: 'bID',
      on: {'markets.id': 'market_booths.market_id'}
    }]
  }
}
router.put('/:id/booths/:bID',
  protect,
  parentExists({markets: 'id'}),
  onlyOwner(boothOwner),
  onlyCols(boothOnly),
  spec.booth, validate,
  (req, res) => {
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
)

router.delete('/:id/booths/:bID',
  protect,
  parentExists({markets: 'id'}),
  onlyOwner(boothOwner),
  (req, res) => {
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
)

// Reservation POST, PUT, & DELETE endpoints
const reserveReqPost = ['reserve_date']
const reserveOnlyPost = ['reserve_date']
router.post('/:id/booths/:bID/reserve/',
  protect,
  parentExists({markets: 'id', market_booths: 'bID'}),
  onlyOwner({vendors: {id: 'admin_id', req: 'vendor'}}),
  reqCols(reserveReqPost),
  onlyCols(reserveOnlyPost),
  spec.reserve, validate,
  (req, res) => {
    req.body = {
      ...req.body,
      booth_id: req.params.bID,
      vendor_id: req.vendor,
      paid: 0
    }
    Markets.addReserve(req.body)
      .then(reserve =>  {
        res.status(201).json(reserve)
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The reservation could not be added to our database.'})
      })
  }
)

const reserveOwner = {
  markets: {
    id: 'admin_id',
    param: 'id',
    join: [
      {
        table: 'market_booths',
        id: 'market_id',
        param: 'bID',
        on: {'markets.id': 'market_booths.market_id'}
      },
      {
        table: 'market_reserve',
        id: 'booth_id',
        param: 'rsID',
        on: {'market_booths.id': 'market_reserve.booth_id'}
      },
    ]
  },
  vendors: {
    id: 'admin_id',
    req: 'vendor',
    join: [{
      table: 'market_reserve',
      id: 'vendor_id',
      param: 'rsID',
      on: {'vendors.id': 'market_reserve.vendor_id'}
    }]
  }
}
const reserveOnlyPut = {
  markets: ['paid'],
  vendors: ['reserve_date']
}
router.put('/:id/booths/:bID/reserve/:rsID',
  protect,
  parentExists({markets: 'id', market_booths: 'bID'}),
  onlyOwner(reserveOwner),
  onlyCols(reserveOnlyPut),
  spec.reserve, validate,
  (req, res) => {
    req.body = {
      ...req.body,
      booth_id: req.params.bID,
      vendor_id: req.vendor,
      updated_at: new Date()
    }
    Markets.updateReserve(req.params.rsID, req.body)
      .then(updated => {
        if (!!updated) {
          res.status(200).json(updated);
        } else {
          res.status(404).json({ message: 'We do not have a reservation with the specified ID in our database.' });
        }
      })
      .catch(err => {
        res.status(500).json({knex: err, message: 'The specified market could not be updated in our database.'});
      })
  }
)

router.delete('/:id/booths/:bID/reserve/:rsID',
  protect,
  parentExists({markets: 'id', market_booths: 'bID'}),
  onlyOwner(reserveOwner),
  spec.reserve, validate,
  (req, res) => {
    Markets.removeReserve(req.params.rsID)
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
