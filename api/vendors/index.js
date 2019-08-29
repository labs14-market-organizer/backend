const router = require('express').Router({mergeParams: true});
const mw = require('../middleware');
const spec = require('./validate');
const ctrl = require('./controllers');

router.get('/', ctrl.getVendors);

router.get('/:id', ctrl.getVendorById);

const postReq = ['name','email', 'phone']
const vendorOnly = ['admin_id', 'name', 'description', 'items', 'electricity', 'ventilation', 'loud', 'other_special', 'website', 'facebook', 'twitter', 'instagram', 'email', 'phone']
router.post('/',
  mw.protect,
  mw.reqCols(postReq, true, 'admin_id'),
  mw.onlyCols(vendorOnly),
  spec.vendor, mw.validate,
  ctrl.postVendor
)

router.put('/:id',
  mw.protect,
  mw.onlyOwner({vendors: {id: 'admin_id', param: 'id'}}),
  mw.onlyCols(vendorOnly),
  spec.vendor, mw.validate,
  ctrl.putVendor
)

router.delete('/:id',
  mw.protect,
  mw.onlyOwner({vendors: {id: 'admin_id', param: 'id'}}),
  ctrl.removeVendor
)

module.exports = router;
