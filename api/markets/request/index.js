const router = require('express').Router();
const mw = require('../../middleware');
const spec = require('../validate');
const ctrl = require('./controllers');

const requestReqPost = []
router.post('/',
  mw.protect,
  mw.onlyOwner({vendors: {id: 'admin_id', req: 'vendor'}}),
  mw.parentExists({markets: 'id'}),
  mw.onlyCols(requestReqPost),
  spec.request, mw.validate,
  ctrl.postRequest
)

const requestReqPut = ['status'];
const requestOnly = ['status'];
router.put('/:rqID',
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'}}),
  mw.reqCols(requestReqPut),
  mw.onlyCols(requestOnly),
  spec.request, mw.validate,
  ctrl.putRequest
)

router.delete('/:rqID',
  mw.protect,
  mw.parentExists({markets: 'id'}),
  mw.onlyOwner({markets: {id: 'admin_id', param: 'id'},vendors: {id: 'admin_id', req: 'vendor'}}),
  spec.request, mw.validate,
  ctrl.deleteRequest
)

module.exports = router;
