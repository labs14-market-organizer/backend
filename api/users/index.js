const router = require('express').Router({mergeParams: true});
const {protect} = require('../middleware');
const ctrl = require('./controllers');

router.get('/',
  protect,
  ctrl.getByToken
);

router.get('/:id', ctrl.getById);

module.exports = router;
