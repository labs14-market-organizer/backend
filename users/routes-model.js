// module.exports = {
//     find,
//     findById,
//     add,
//     update,
//     remove,
// };

// function find() {
//     return db(‘users’);
// }

// function findById(id) {
//     return db(‘users’)
//         .where({ id: id })
//         .first();
// }

// function add(users) {
//     return db(‘users’)
//         .insert(users)
//         .then(([id]) => {
//             return findById(id)
//         })
// }

// function update() {
//     return db(‘users’)
//         .where({ id })
//         .update(changes)
//         .then(count => {
//             if (count > 0) {
//                 return findById(id)
//             } else {
//                 return null
//             }
//         });
// }

// function remove() {
//     return db(‘users’)
//         .where(id)
//         .del();
// }
