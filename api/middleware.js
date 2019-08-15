const jwt = require('jsonwebtoken');
const db = require('../data/dbConfig');
const parseAddr = require("parse-address-string");
const getType = require('jest-get-type');
const genToken = require('./auth/genToken');
const {getStateCodeByStateName: stateCode} = require("us-state-codes");
const {validationResult} = require('express-validator');

module.exports = {
  verifyJWT,
  protect,
  parseQueryAddr,
  parentExists,
  onlyOwner,
  validate,
  reqCols,
  reqNestCols,
  onlyCols,
  onlyNestCols,
  futureDate,
  validReserveDate,
  availBooths
}

// Verifies JWT and stores subject on request as "user_id"
function verifyJWT(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;
  if(!token) {
    next(); // Let protect() handle route protection
  } else {
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if(!err) {
        req.user_id = decoded.subject;
        req.market = await db('markets')
          .select('id')
          .where({admin_id: req.user_id})
          .orderBy('id')
          .map(market => market.id);
        req.market = req.market[0];
        req.vendor = await db('vendors')
          .select('id')
          .where({admin_id: req.user_id})
          .orderBy('id')
          .map(vendor => vendor.id);
        req.vendor = req.vendor[0];
        const user = {id: req.user_id};
        const expire = 1000*60*60*2; // 2 hours
        // Create new JWT that can be refreshed on frontend
        req.headers.authorization = genToken(user, expire)
        next();
      } else {
        res.status(403).json({ message: 'Invalid authorization token.' })
      }
    })
  }
}

// Protects route by requiring JWT
// *** Always use after verifyJWT() ***
function protect(req, res, next) {
  !req.headers.authorization
    ? res.status(401).json({ message: 'Authorization token missing.' })
    : next();
}

// Parses query string as address
async function parseQueryAddr(req, res, next) {
  // Parse address using 'parse-address-string' package
  await parseAddr(req.query.q, (err, addr) => {
    // If there's an error, kick it down to ternary below
    if(err) {
      req.query = null;
    } else {
      // Pull city, state, and zipcode from addr object
      let {city, state, postal_code} = addr;
      // Coerce state into short form if it isn't already
      if (state && state.length > 2) {
        state = stateCode(state);
      }
      // Make sure at least one field has a value
      if (city === null && state === null && postal_code === null) {
        req.query = null
      } else {
        // Pass data into the request's query object
        req.query = {city, state, zipcode: postal_code};
      }
    }
  })
  // If the query couldn't be parsed, return a 400
  req.query === null
    ? res.status(400).json({message: "Could not parse the query properly. Try formatting as 'City, ST zipcode' or any combination."})
    : next();
}

// "obj" = an object with keys equal to the parent table and
//     values equal to the URL parameter identifying the parent
function parentExists(obj) {
  return async (req, res, next) => {
    const entries = Object.entries(obj);
    const results = await Promise.all(entries.map(async pair => {
      // Grab the parent ID
      const id = req.params[pair[1]];
      // Check if parent exists
      const result = await db(pair[0])
        .select('id')
        .where({id})
        .first();
      return [!!result, pair[0]];
    }))
    // Create an array of missing parents
    const missing = results.reduce((arr, pair) => {
      return !pair[0]
        ? [...arr, pair[1]]
        : arr;
    }, []);
    !!missing.length
      ? res.status(400).json({message: `The specified entries from the following tables don't exist: ${missing.join(', ')}`})
      : next();
  }
}

// 
function onlyOwner(obj) {
  return async (req, res, next) => {
    const {user_id} = req; // Grab user ID from request
    const owners = Object.entries(obj);
    const results = await Promise.all(owners.map(async owner => {
      const [table, {join, ...tbl}] = owner;
      const select = [`${table}.id`, `${table}.${tbl.id}`]
      let first, last;
      if(!!join) {
        join.forEach(joined => {
          select.push(`${joined.table}.${joined.id}`)
        })
        first = join[0];
        last = join[join.length-1];
      }
      let result = await db(table)
        .select(...select)
        .modify(builder => {
          if(!!join) {
            join.forEach(joined => {
              builder.join(joined.table, joined.on)
            })
          }
        })
        .where(builder => {
          if(!join) {
            if(!!tbl.param) {
              builder.where({[`${table}.id`]: req.params[tbl.param]});
            } else if(!!tbl.body) {
              builder.where({[`${table}.id`]: req.body[tbl.body]})
            } else {
              builder.where({[`${table}.id`]: req[tbl.req]})
            }
          } else {
            if(!!last.param) {
              builder.where({[`${last.table}.id`]: req.params[last.param]});
            } else if(!!last.body) {
              builder.where({[`${last.table}.id`]: req.body[last.body]})
            } else {
              builder.where({[`${last.table}.id`]: req[last.req]})
            }
          }
        });
      [result] = result;
      return {result, table, id: tbl.id};
    }))
    if(!results.every(result => !!result.result)) {
      return next(); // Let route handle 404s
    }
    req.owner = await results.reduce((arr, result) => {
      return result.result[result.id] === user_id
        ? [...arr, result.table]
        : arr;
    }, []);
    const hasJoin = !Object.values(obj).every(table => !table.join);
    let matchIDs, mismatches;
    if(hasJoin) {
      matchIDs = owners.reduce((newObj, table) => {
        const arrIDs = table[1].join.reduce((arr, joined, i) => {
          const {id} = joined;
          const {id: tblID, join: tblJoin, ...tbl} = table[1];
          if(i === 0) {
            return [...arr, {id, ...tbl}];
          } else {
            const {id: prevID, table: prevTbl, on, ...prev} = table[1].join[i-1];
            return [...arr, {id, ...prev}];
          }
        }, [])
        return {...newObj, [table[0]]: arrIDs}
      }, {})
      mismatches = results.reduce((newObj, result) => {
        const arr = Object.values(matchIDs[result.table]).reduce((newArr, pair) => {
          const {id, ...loc} = pair;
          const place = Object.keys(loc)[0];
          if(place === 'param') {
            return `${result.result[id]}` !== req.params[loc[place]]
              ? [...newArr, id]
              : newArr;
          } else if(place === 'body') {
            return `${result.result[id]}` !== req.body[loc[place]]
              ? [...newArr, id]
              : newArr;
          } else {
            return `${result.result[id]}` !== req[loc[place]]
              ? [...newArr, id]
              : newArr;
          }
        }, [])
        return {...newObj, [result.table]: arr}
      }, {})
    }
    if(!req.owner.length) {
      res.status(403).json({message: `Only the admins of the the following associated entries are authorized to make this request: ${Object.keys(obj).join(', ')}`})
    } else if(hasJoin && Object.values(mismatches).every(owner => owner.length > 0)) {
      res.status(400).json({message: 'One or more of the parent IDs does not match the ID of the relevant parent.'})
    } else {
      return next();
    }
  }
}

// Handles any invalid fields in request body via express-validator
// *** Pass immediately following an array of validator checks ***
function validate(req, res, next)  {
  const errors = validationResult(req);
  !errors.isEmpty()
    ? res.status(400).json({invalid: errors.array()})
    : next();
}

// "required" = array of required columns
// "reqID" = whether or not some field should match
//      the user ID of the user making the request
// "colID" = the name of the field in the request body
//     that should match the user ID of the user making the request
function reqCols(required, reqID = false, colID = 'id') {
  return (req, res, next) => {
    // Filters through array of required columns to flag any missing fields
    const body = Object.keys(req.body);
    let missing = required
      .filter(prop => !body.includes(prop));
    // Checks if ID is required and if user_id isn't already set on the request
    if(!!reqID && !req.user_id && !body.includes(colID)) {
      // If ID is required, but user_id isn't already on request, then adds colID field name to the array of missing values
      missing = [...missing, colID];
    }
    // Rejects request if there are missing columns
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required fields: ${missing.join(', ')}`})
      : next();
  }
}

// Requires sub-fields if parent fields are present
// *** Use reqCols() to require the parent fields themselves ***
// "reqObjs" = object w/ keys equal to parent fields in request body
// and values equal to array of strings representing required fields
function reqNestCols(reqObjs) {
  return (req, res, next) => {
    const body = Object.keys(req.body);
    // Compares request body to specified parents to see which parent fields are available to check
    const checkParents = body
      .filter(prop => Object.keys(reqObjs).includes(prop));
    // Moves on to next middleware if there are no parent fields to check
    if(!checkParents.length) {
      return next()
    }
    let missing = [];
    checkParents.forEach(parent => {
      req.body[parent].forEach(child => {
        const absent = reqObjs[parent]
          // Filter out fields that are included
          .filter(prop => !Object.keys(child).includes(prop))
          // Prepend the name of parent field for better error message
          .map(prop => `${parent}.${prop}`);
        // Add any missing fields to collection
        missing = [...missing, ...absent];
      })
    })
    // Reject request if required sub-fields are missing
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required sub-fields: ${missing.join(', ')}`})
      : next();
  }
}

function onlyCols(allowed) {
  return (req, res, next) => {
    if(getType(allowed) === 'object') {
      const {owner} = req;
      allowed = Object.entries(allowed)
        .reduce((arr, table) => {
          const [tbl, cols] = table;
          if(owner.includes(tbl)) {
            const newCols = cols.filter(col => !arr.includes(col));
            return [...arr, ...newCols];
          } else {
            return arr;
          }
        }, [])
    }
    // Filters through array of allowed columns to flag
    //     any that are included that shouldn't be
    const flagged = Object.keys(req.body)
      .filter(prop => !allowed.includes(prop));
    // Rejects request if there are any unallowed columns
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following fields in the body of this request: ${flagged.join(', ')}`
      })
    } else {
      next();
    }
  }
}

// "allowObjs" = object w/ keys equal to parent fields
//     in request body and values equal to array of strings
//     representing allowed subfields
function onlyNestCols(allowObjs) {
  return (req, res, next) => {
    const body = Object.keys(req.body);
    // Compares request body to specified parents
    // to see which parent fields are available to check
    const checkParents = body
      .filter(prop => Object.keys(allowObjs).includes(prop));
    // Moves on to next middleware if there are no parent fields to check
    if(!checkParents.length) {
      return next()
    }
    let flagged = [];
    checkParents.forEach(parent => {
        req.body[parent].forEach(child => {
          subflags = Object.keys(child)
          // Filter down to subfields that shouldn't be included
          .filter(prop => !allowObjs[parent].includes(prop))
          // Prepend the name of parent field for better error message
          .map(prop => `${parent}.${prop}`);
        // Add any missing fields to collection
        flagged = [...flagged, ...subflags];
        })
    })
    // Rejects request if there are any unallowed subfields
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following subfields in the body of this request: ${flagged.join(', ')}`
      })
    } else {
      next();
    }
  }
}

function futureDate(dateObj, today = false) {
  return (req, res, next) => {
    const datePlace = Object.keys(dateObj)[0];
    let date;
    if(datePlace === 'param') {
      date = req.params[dateObj[datePlace]];
    } else if (datePlace === 'body') {
      date = req.body[dateObj[datePlace]];
    } else {
      date = req[dateObj[datePlace]];
    }
    if(!date) {
      next(); // Let other middleware handle missing data
    } else if (!!today) {
      console.log(new Date(date) > new Date(Date.now() - ((1000*60*60*24)+1)))
      new Date(date) > new Date(Date.now() - ((1000*60*60*24)+1))
        ? next()
        : res.status(400).json({message: `'${dateObj[datePlace]}' must be a date no earlier than today.`})
    } else {
      console.log(new Date(date) > new Date(Date.now()))
      new Date(date) > new Date(Date.now())
        ? next()
        : res.status(400).json({message: `'${dateObj[datePlace]}' must be a date after today.`})
    }
    next();
  }
}

function validReserveDate(dateObj, mktObj) {
  return async (req, res, next) => {
    const datePlace = Object.keys(dateObj)[0];
    const mktPlace = Object.keys(mktObj)[0];
    let date;
    if(datePlace === 'param') {
      date = req.params[dateObj[datePlace]];
    } else if (datePlace === 'body') {
      date = req.body[dateObj[datePlace]];
    } else {
      date = req[dateObj[datePlace]];
    }
    if(!date) {
      next(); // Let other middleware handle missing data
    } else {
      const regex = /^[0-9]{4}-(((0[13578]|1[02])-(0[0-9]|1[0-9]|2[0-9]|3[0-1]))|((0[469]|11)-(0[0-9]|1[0-9]|2[0-9]|30))|(02-(0[0-9]|1[0-9]|2[0-9])))$/;
      if(!date.match(regex)) {
        return res.status(400).json({message: 'Please format the date as YYYY-MM-DD.'})
      }
      const nums = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      }
      let mkt;
      if(mktPlace === 'param') {
        mkt = req.params[mktObj[mktPlace]];
      } else if (mktPlace === 'body') {
        mkt = req.body[mktObj[mktPlace]];
      } else {
        mkt = req[mktObj[mktPlace]];
      }
      const days = await db('market_days')
        .where({market_id: mkt})
        .pluck('day')
      const num = new Date(date).getUTCDay();
      const day = Object.keys(nums).find(key => nums[key] === num);
      const numDays = days.map(day => nums[day]);
      !numDays.includes(num)
        ? res.status(403).json({message: `This market is not open on ${day}s. Please try for one of the following days: ${days.join(', ')}`})
        : next();
    }
  }
}

function availBooths(param) {
  return async (req, res, next) => {
    const [{number}] = await db('market_booths')
      .select('number')
      .where({id: req.params[param]});
    const booths = await db('market_reserve')
      .where({booth_id: req.params[param], reserve_date: req.body.reserve_date});
    booths.length >= number
      ? res.status(403).json({message: 'All available booths have already been reserved on this date.'})
      : next();
  }
}
