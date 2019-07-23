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
   Markets.add(req.body)
        .then(added => {
            res.status(200).json(added);
        })
        .catch(err => {
            res
                .status(500)
                .json({err, message: 'We have an Error' });
        });
});

router.put('/:id', async (req, res) => {
    try {
      const market = await Markets.update(req.params.id, req.body);
      if (market) {
        res.status(200).json(market);
      } else {
        res.status(404).json({ message: 'The market could not be found' });
      }
    } catch (error) {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error updating the market',
      });
    }
  });
  
  router.delete('/:id', (req, res) => {
    Markets.remove(req.params.id)
      .then(count => {
        if (count > 0) {
          res.status(204).end();
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
