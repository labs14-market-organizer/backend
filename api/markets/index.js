const router = require('express').Router();
const Markets = require("./model");
const mw = require('../middleware');
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
  mw.parseQueryAddr,
  (req, res)  => {
      const {query} = req;
      Markets.search(query)
      .then(markets => {
        !markets.length
        ? res.status(404).json({ message: 'No markets could be found in our database that matched the search criteria.' })
        : res.status(200).json(markets);
    })
    .catch(err => {
      console.error(err)
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
  mw.protect,
  mw.reqCols(marketReq, true, 'admin_id'),
  mw.reqNestCols(marketNestReq),
  mw.onlyCols(marketOnly),
  mw.onlyNestCols(marketPostNestOnly),
  spec.market, mw.validate,
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
  mw.protect,
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.onlyCols(marketOnly),
  mw.onlyNestCols(marketPutNestOnly),
  spec.market, mw.validate,
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
  mw.protect,
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
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
        console.error(err)
        res.status(500)
          .json({knex: err, message: 'The specified market could not be removed from our database.'});
      })
});

// Market_vendors endpoints
const requestReqPost = []
router.post('/:id/request',
  mw.protect,
  mw.onlyOwner({vendors: {id: 'admin_id', req: 'vendor'}}),
  mw.parentExists({markets: 'id'}),
  mw.onlyCols(requestReqPost),
  spec.request, mw.validate,
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
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.reqCols(requestReqPut),
  mw.onlyCols(requestOnly),
  spec.request, mw.validate,
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
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'},vendors: {id: 'admin_id', req: 'vendor'}}),
  spec.request, mw.validate,
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
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.reqCols(boothReq),
  mw.onlyCols(boothOnly),
  spec.booth, mw.validate,
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
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner(boothOwner),
  mw.onlyCols(boothOnly),
  spec.booth, mw.validate,
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
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner(boothOwner),
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

// Reservation endpoints
router.get('/:id/booths/date/:dt',
  mw.parentExists({markets: 'id'}),
  mw.validReserveDate({param: 'dt'},{param: 'id'}),
  (req, res) => {
    Markets.findReserveByDate(req.params.id, req.params.dt)
    .then(booths => {
      !booths.length
        ? res.status(404).json({ message: 'No booths could be found in our database for that date.' })
        : res.status(200).json(booths);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
    });
  }
)

const approveMkt = {param: 'id'}
const approveVdr = {req: 'vendor'}
const reserveReqPost = ['reserve_date']
const reserveOnlyPost = ['reserve_date']
router.post('/:id/booths/:bID/reserve/',
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner({vendors: {id: 'admin_id', req: 'vendor'}}),
  // mw.approvedVendor(approveMkt, approveVdr),
  mw.reqCols(reserveReqPost),
  mw.onlyCols(reserveOnlyPost),
  mw.futureDate({body: 'reserve_date'}, true),
  mw.validReserveDate({body: 'reserve_date'},{param: 'id'}),
  mw.availBooths('bID'),
  spec.reserve, mw.validate,
  (req, res) => {
    req.body = {
      ...req.body,
      booth_id: req.params.bID,
      vendor_id: req.vendor,
      paid: 0
    }
    Markets.addReserve(req.body)
      .then(reserve =>  {
        res.status(201).json(reserve.available)
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
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner(reserveOwner),
  mw.onlyCols(reserveOnlyPut),
  mw.futureDate({body: 'reserve_date'}, true),
  mw.validReserveDate({body: 'reserve_date'},{param: 'id'}),
  spec.reserve, mw.validate,
  (req, res) => {
    req.body = {
      ...req.body,
      booth_id: req.params.bID,
      vendor_id: req.vendor,
      updated_at: new Date()
    }
    Markets.updateReserve(req.params.rsID, req.body)
      .then(updated => {
        if (!!updated.result) {
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
)

router.delete('/:id/booths/:bID/reserve/:rsID',
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner(reserveOwner),
  spec.reserve, mw.validate,
  (req, res) => {
    Markets.removeReserve(req.params.rsID)
      .then(deleted => {
        if (!!deleted.result.length) {
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
)

router.get('/:id/vendors',
  mw.parentExists({markets: 'id'}),
  mw.validReserveDate({param: 'dt'},{param: 'id'}),
  (req, res) => {
    let args = [req.params.id]
    if(!!req.query.q) {
      args.push(req.query.q)
    }
    Markets.findVendors(...args)
    .then(vendors => {
      !vendors.length
        ? res.status(404).json({ message: 'No vendors could be found in our database for that date.' })
        : res.status(200).json(vendors);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
    });
  }
)

router.get('/:id/vendors/date/:dt',
  mw.parentExists({markets: 'id'}),
  mw.validReserveDate({param: 'dt'},{param: 'id'}),
  (req, res) => {
    let args = [req.params.id, req.params.dt]
    if(!!req.query.q) {
      args.push(req.query.q)
    }
    Markets.findVendorsByDate(...args)
    .then(vendors => {
      !vendors.length
        ? res.status(404).json({ message: 'No vendors could be found in our database for that date.' })
        : res.status(200).json(vendors);
    })
    .catch(err => {
      res.status(500).json({knex: err, message: 'An error occurred while retrieving booths from the database.' });
    });
  }
)

module.exports = router;
