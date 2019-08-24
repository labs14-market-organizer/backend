const router = require('express').Router();
const mw = require('../../middleware');
const spec = require('../validate');
const ctrl = require('./controllers');

const boothReq = ['name', 'number']
const boothOnly = ['name', 'number', 'price', 'size', 'description']
router.post('/',
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.reqCols(boothReq),
  mw.onlyCols(boothOnly),
  spec.booth, mw.validate,
  ctrl.postBooth
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
router.put('/:bID',
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner(boothOwner),
  mw.onlyCols(boothOnly),
  spec.booth, mw.validate,
  ctrl.putBooth
)

router.delete('/:bID',
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner(boothOwner),
  ctrl.deleteBooth
)

router.get('/date/:dt',
  mw.parentExists({markets: 'id'}),
  mw.validReserveDate({param: 'dt'},{param: 'id'}),
  ctrl.getBoothsByDate
)

router.use('/:bID/reserve', require('./reserve'));

module.exports = router;
