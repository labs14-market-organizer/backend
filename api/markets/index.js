const router = require('express').Router();
const Markets = require("./model");
const mw = require('../middleware');
const spec = require('./validate');
const sg = require('../sendgrid');
const ctrl = require('./controllers');

router.get('/', ctrl.getMarkets);

router.get('/search',
  mw.parseQueryAddr,
  ctrl.getMarketsBySearch
)

router.get('/:id', ctrl.getMarketById);

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
  ctrl.postMarket
);

const marketPutNestOnly = {operation: ['id','day','start','end']};
router.put('/:id',
  mw.protect,
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.onlyCols(marketOnly),
  mw.onlyNestCols(marketPutNestOnly),
  spec.market, mw.validate,
  ctrl.putMarket
);

router.delete('/:id',
  mw.protect,
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  ctrl.deleteMarket
);

router.use('/:id/booths', require('./booths'))
router.use('/:id/request', require('./request'))
router.use('/:id/vendors', require('./vendors'))

module.exports = router;
