const router = require('express').Router();
​
const Users = require("./model"); 
​
router.get('/', (req, res ) => {
    const id = req.user_id;
    Users.findById(id)
    .then(users => {
        res.status(200).json(users);
    })
    .catch(err => {
        res
            .status(500).json({ message: 'This is a error message' });
    });
});
​
router.get('/:id', (req, res ) => {
    const {id} = req.params;
   Users.findById(id)
        .then(users => {
            res.status(200).json(users);
        })
        .catch(err => {
            res
                .status(500).json({ message: 'This is a error message' });
        });
});
​
router.post('/', (req,res) => {
   Users.add(req.body)
        .then(added => {
            res.status(200).json(added);
        })
        .catch(err => {
            res
                .status(500)
                .json({ message: 'We have an Error' });
        });
});
​
module.exports = router;
