const router = require('express').Router();
const {protect} = require('../middleware');
const Users = require("./model"); 

router.get('/', protect, (req, res ) => {
    const id = req.user_id;
    Users.findById(id)
    .then(user => {
        !user
            ? res.status(404).json({message: 'No user with that ID exists in our database'})
            : res.status(200).json(user);
    })
    .catch(err => {
        res
            .status(500).json({ message: 'This is a error message' });
    });
});

router.get('/:id', (req, res ) => {
    const {id} = req.params;
   Users.findById(id)
    .then(user => {
        !user
            ? res.status(404).json({message: 'No user with that ID exists in our database'})
            : res.status(200).json(user);
        })
        .catch(err => {
            res
                .status(500).json({ message: 'This is a error message' });
        });
});

// router.post('/', (req,res) => {
//    Users.add(req.body)
//         .then(added => {
//             res.status(200).json(added);
//         })
//         .catch(err => {
//             res
//                 .status(500)
//                 .json({ message: 'We have an Error' });
//         });
// });

module.exports = router;
