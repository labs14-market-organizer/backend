const router = require('express').Router();
const mw = require('../../middleware');
const spec = require('../validate');
const ctrl = require('./controllers');

router.get('/',
  mw.parentExists({markets: 'id'}),
  ctrl.getVendors
)

router.get('/date/:dt',
  mw.parentExists({markets: 'id'}),
  mw.validReserveDate({param: 'dt'},{param: 'id'}),
  ctrl.getVendorsByDate
)

module.exports = router;
