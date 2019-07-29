const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require("passport");
const {verifyJWT} = require('./middleware');
​
const server = express();
​
const userRouter = require('./users');
const authRouter = require('./auth');
const vendorRouter = require('./vendors');
const marketsRouter = require('./markets/index');
​
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(passport.initialize());
​
server.use("/auth", verifyJWT, authRouter);
server.use("/user", verifyJWT, userRouter);
server.use("/vendors", verifyJWT, vendorRouter);
server.use("/markets", verifyJWT, marketsRouter);
​
//Server Test Message
server.get('/', (req, res) => {
    res.status(200).send({ message: 'Hello from CloudStands.'})
});
​
module.exports = server; 