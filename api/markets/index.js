const router = require('express').Router();

const Markets = require("./model"); 

router.get('/', (req, res ) => {
   Markets.find()
        .then(markets => {
            res.status(200).json(markets);
        })
        .catch(err => {
            res
                .status(500).json({err, message: 'This is a error message' });
        });
});

router.get('/:id', (req, res ) => {
    const id = req.params.id
   Markets.findById(id)
        .then(markets => {
            res.status(200).json(markets);
        })
        .catch(err => {
            res
                .status(500).json({ message: 'This is a error message' });
        });
});

router.post('/', (req,res) => {
   if(!!req.user_id) {
      req.body.admin_id = req.user_id;
    }
   Markets.add(req.body)
        .then(added => {
            res.status(201).json(added[0]);
        })
        .catch(err => {
            res
                .status(500)
                .json({err, message: 'We have an Error' });
        });
});

router.put('/:id', async (req, res) => {
    req.body.updated_at = new Date();
    try {
      const market = await Markets.update(req.params.id, req.body);
      if (market) {
      res.status(200).json(market[0]);
      } else {
        res.status(404).json({ message: 'The market could not be found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error updating the market',
      });
    }
  });
  
  router.delete('/:id', (req, res) => {
    Markets.remove(req.params.id)
      .then(deleted => {
        if (!!deleted.length) {
          res.status(200).json(deleted[0]);
        } else {
          res.status(404).json({
            message: 'That Market does not exist, perhaps it was deleted already',
          });
        }
      })
      .catch(error => {
        res
          .status(500)
          .json({ message: 'We ran into an error removing the Market' });
      })
  });

module.exports = router;
