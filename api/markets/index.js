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

module.exports = router;
