require('dotenv').config();
const server = require('./api/server.js');

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`\n*** Your server is now running on port ${port} ***\n`)
})