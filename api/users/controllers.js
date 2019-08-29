const Users = require("./model"); 

module.exports = {
  getByToken,
  getById,
}

function getByToken(req, res) {
  const id = req.user_id;
  Users.findById(id)
    .then(user => {
      !user
        ? res.status(404).json({message: 'No user with that ID exists in our database'})
        : res.status(200).json({...user, ...req.token});
    })
    .catch(err => {
      res.status(500).json({ message: 'An error occurred while retrieving the user from the database.' });
    });
}

function getById(req, res) {
  const {id} = req.params;
  Users.findById(id)
    .then(user => {
      !user
        ? res.status(404).json({message: 'No user with that ID exists in our database'})
        : res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json({ message: 'An error occurred while retrieving the user from the database.' });
    });
}
