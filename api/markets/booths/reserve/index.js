const router = require('express').Router();
const mw = require('../../../middleware');
const spec = require('../../validate');
const ctrl = require('./controllers');

const approveMkt = {param: 'id'}
const approveVdr = {req: 'vendor'}
const reserveReqPost = ['reserve_date']
const reserveOnlyPost = ['reserve_date']
router.post('/',
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner({vendors: {id: 'admin_id', req: 'vendor'}}),
  mw.approvedVendor(approveMkt, approveVdr),
  mw.reqCols(reserveReqPost),
  mw.onlyCols(reserveOnlyPost),
  mw.futureDate({body: 'reserve_date'}, true),
  mw.validReserveDate({body: 'reserve_date'},{param: 'id'}),
  mw.availBooths('bID'),
  spec.reserve, mw.validate,
  ctrl.postReserve
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
router.put('/:rsID',
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner(reserveOwner),
  mw.onlyCols(reserveOnlyPut),
  mw.futureDate({body: 'reserve_date'}, true),
  mw.validReserveDate({body: 'reserve_date'},{param: 'id'}),
  spec.reserve, mw.validate,
  ctrl.putReserve
)

router.delete('/:rsID',
  mw.protect,
  mw.parentExists({markets: 'id', market_booths: 'bID'}),
  mw.onlyOwner(reserveOwner),
  spec.reserve, mw.validate,
  ctrl.deleteReserve
)

module.exports = router;
