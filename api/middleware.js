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
  approvedVendor,
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
        // Grab ID of first market created by user (for now, assume they only have one)
        req.market = await db('markets')
          .select('id')
          .where({admin_id: req.user_id})
          .orderBy('id')
          .map(market => market.id);
        req.market = req.market[0];
        // Grab ID of first vendor created by user (for now, assume they only have one)
        req.vendor = await db('vendors')
          .select('id')
          .where({admin_id: req.user_id})
          .orderBy('id')
          .map(vendor => vendor.id);
        req.vendor = req.vendor[0];
        // Create new JWT that can be refreshed on frontend
        const user = {id: req.user_id};
        const exp = 1000*60*60*2; // 2 hours
        req.token = {token: genToken(user, exp), exp}
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
function parseQueryAddr(req, res, next) {
  // Parse address using 'parse-address-string' package
  return parseAddr(req.query.q, (err, addr) => {
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
    // If the query couldn't be parsed, return a 400
    return req.query === null
      ? res.status(400).json({message: "Could not parse the query properly. Try formatting as 'City, ST zipcode' or any combination."})
      : next();
  })
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

// "obj" = an object with keys equal to the parent table
//     and values equal to nested objects
// "id" = a nested key inside "obj" that's value is the name
//     of the column identifying the user on the table
// "param/body/req" = another nested key inside "obj" that's
//     value equals the key on the specified object that the
//     matching ID can be found
// "join" = a nested key inside "obj" that's value is an array
//     of more nested objects, each representing a table to join
//     *** Specify them in order of the joins ***
// "id/param/body/req" = keys nested inside "join" objects,
//     acting exactly as their namesakes above
// "table" = a nested key inside "join" objects that identifies
//     the table to be joined
// "on" = a nested key inside "join" objects that will be passed
//     as the argument within the relevant knex join
function onlyOwner(obj) {
  return async (req, res, next) => {
    const {user_id} = req; // Grab user ID from request
    // Create an array of tables representing "owners"
    const owners = Object.entries(obj);
    // Pass over all defined owners
    const results = await Promise.all(owners.map(async owner => {
      // Separate joins from target parent data
      const [table, {join, ...tbl}] = owner;
      if(!!tbl.param) {
        if(!req.params[tbl.param]) {
          return {result: null, table, id: tbl.id}
        }
      } else if(!!tbl.body) {
        if(!req.body[tbl.body]) {
          return {result: null, table, id: tbl.id}
        }
      } else {
        if(!req[tbl.req]) {
          return {result: null, table, id: tbl.id}
        }
      }
      // Create select statement without joins
      const select = [`${table}.${tbl.id}`]
      // Declare "last" outside of if/else
      let last;
      // Check if any joins were specified
      if(!!join) {
        // Define "last" now that we now at least one join exists
        last = join[join.length-1];
        select.unshift(`${last.table}.id`)
        // Add to select statement for each join
        join.forEach(joined => {
          select.push(`${joined.table}.${joined.id}`)
        })
      }
      let result = await db(table)
        // Feed in final select statement
        .select(...select)
        .modify(builder => {
          // If there are any joins, add each of them
          if(!!join) {
            join.forEach(joined => {
              builder.join(joined.table, joined.on)
            })
          }
        })
        .where(builder => {
          if(!join) {
            // If there aren't any joins, grab the specified
            //     identifier to match top table against
            if(!!tbl.param) {
              builder.where({[`${table}.id`]: req.params[tbl.param]});
            } else if(!!tbl.body) {
              builder.where({[`${table}.id`]: req.body[tbl.body]})
            } else {
              builder.where({[`${table}.id`]: req[tbl.req]})
            }
          } else {
            // If there are joins, grab the specified identifier
            //     to match the last join against
            if(!!last.param) {
              builder.where({[`${last.table}.id`]: req.params[last.param]});
            } else if(!!last.body) {
              builder.where({[`${last.table}.id`]: req.body[last.body]})
            } else {
              builder.where({[`${last.table}.id`]: req[last.req]})
            }
          }
        })
        .first();
        // Pass relevant identifiers into results array
      return {result, table, id: tbl.id};
    }))
    // Check if there were no matches
    if(!results.every(result => result.result !== undefined)) {
      return next(); // Let route handle 404s
    }
    // Attach array of owner matches onto request for other
    //     middleware or the route handler to use later
    req.owner = await results.reduce((arr, result) => {
      return !!result.result && result.result[result.id] === user_id
        ? [...arr, result.table]
        : arr;
    }, []);
    // Check if any joins exist to match/mismatch
    const hasJoin = !Object.values(obj).every(table => !table.join);
    let matchIDs, mismatches;
    if(hasJoin) {
      // Create object w/ nested arrays of IDs to match
      matchIDs = owners.reduce((newObj, owner) => {
        // Create array of IDs for each join table
        const arrIDs = owner[1].join.reduce((arr, joined, i) => {
          // Grab parent ID from join
          const {id} = joined;
          // Remove irrelevant data from owner table
          const {id: tblID, join: tblJoin, ...tbl} = owner[1];
          // If it's the first join, use owner table data
          if(i === 0) {
            return [...arr, {id, ...tbl}];
          // Otherwise, use previous join data
          } else {
            // Remove irrelevant data from previous join
            const {id: prevID, table: prevTbl, on, ...prev} = owner[1].join[i-1];
            return [...arr, {id, ...prev}];
          }
        }, [])
        // Name the array with owner table name
        return {...newObj, [owner[0]]: arrIDs}
      }, {})
      // Create object of actual parents whose IDs don't
      //     match those specified in the request
      mismatches = results.reduce((newObj, result) => {
        let arr;
        if(!!result.result) {
          arr = Object.values(matchIDs[result.table]).reduce((newArr, pair) => {
            // Separate ID from location of identifier
            const {id, ...loc} = pair;
            // Grab the place of the identifier and compare to result
            const place = Object.keys(loc)[0];
            if(place === 'param') {
              return `${result.result[id]}` !== req.params[loc[place]]
                ? [...newArr, id] // Add mismatches
                : newArr;
            } else if(place === 'body') {
              return `${result.result[id]}` !== req.body[loc[place]]
                ? [...newArr, id] // Add mismatches
                : newArr;
            } else {
              return `${result.result[id]}` !== req[loc[place]]
                ? [...newArr, id] // Add mismatches
                : newArr;
            }
          }, [])
        } else {
          arr = [];
        }
        // Name the array with owner table name
        return {...newObj, [result.table]: arr}
      }, {})
    }
    // If the user isn't a relevant owner, kick back with 403
    if(!req.owner.length) {
      res.status(403).json({message: `Only the admins of the the following associated entries are authorized to make this request: ${Object.keys(obj).join(', ')}`})
    // If there's at least one mismatched ID for a join,
    //     kick back with 400
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

// "allowed" = array of allowed columns or object with keys
//     representing an owner type and values of the columns
//     that that owner is allowed to pass
function onlyCols(allowed) {
  return (req, res, next) => {
    let finalAllowed = allowed;
    // Check if "allowed" is an object and coerce to array
    if(getType(allowed) === 'object') {
      // Grab user owner types placed on request in "onlyOwner()"
      const {owner} = req;
      if(owner === undefined) {
        return next(); // Let route handle 404s
      }
      // Create an array of allowed columns for all owner
      //     types relevant to the user
      finalAllowed = Object.entries(allowed)
        .reduce((arr, table) => {
          // Grab owner table and allowed columns
          const [tbl, cols] = table;
          // Check if the user is a relevant owner
          if(owner.includes(tbl)) {
            // Filter out columns already in the array
            const newCols = cols.filter(col => !arr.includes(col));
            // Add new columns to the array
            return [...arr, ...newCols];
          } else {
            return arr;
          }
        }, [])
    }
    // Filters through array of allowed columns to flag
    //     any that are included that shouldn't be
    const flagged = Object.keys(req.body)
      .filter(prop => !finalAllowed.includes(prop));
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

// "mktObj" = object with one key identifying where to find
//     the market ID and a value of its key in that place
// "vdrObj" = object with one key identifying where to find
//     the vendor ID and a value of its key in that place
function approvedVendor(mktObj, vdrObj) {
  return async (req, res, next) => {
    const result = await db('market_vendors')
      .where(builder => {
        // Find and use the market ID
        if(!!mktObj.param) {
          builder.where({market_id: req.params[mktObj.param]});
        } else if(!!mktObj.body) {
          builder.where({market_id: req.body[mktObj.body]});
        } else {
          builder.where({market_id: req[mktObj.req]});
        }
        // Find and use the vendor ID
        if(!!vdrObj.param) {
          builder.andWhere({vendor_id: req.params[vdrObj.param]});
        } else if(!!vdrObj.body) {
          builder.andWhere({vendor_id: req.body[vdrObj.body]});
        } else {
          builder.andWhere({vendor_id: req[vdrObj.req]});
        }
      })
    // Check if the vendor has applied to join the market
    if(!result.length) {
      res.status(403).json({message: "The vendor must accept this market's rules before completing this action."})
    // Check if any of this vendor's requests have been accepted
    } else if(result.every(request => request.status <= 0)) {
      !result.forEach(request => {
        return request.status > 0
      })
      res.status(403).json({message: "Vendors must be approved by the market owner before completing this action."})
    } else {
      next();
    }
  }
}

// "dateObj" = object representing where to find the date
// "param/body/req" = nested keys on "dateObj" with values
//     equal to the date identifier
// "today" = whether or not today is a valid date
function futureDate(dateObj, today = false) {
  return (req, res, next) => {
    // Grab the place of the date
    const datePlace = Object.keys(dateObj)[0];
    let date;
    // Grab the date from its place
    if(datePlace === 'param') {
      date = req.params[dateObj[datePlace]];
    } else if (datePlace === 'body') {
      date = req.body[dateObj[datePlace]];
    } else {
      date = req[dateObj[datePlace]];
    }
    if(!date) {
      next(); // Let other middleware handle missing data
    // Check whether today would be considered valid
    } else if (!!today) {
      // Compare the date to a moment 24 hours ago, minus one millisecond
      new Date(date) > new Date(Date.now() - ((1000*60*60*24)+1))
        ? next()
        : res.status(400).json({message: `'${dateObj[datePlace]}' must be a date no earlier than today.`})
    } else {
      // Compare the date to this moment
      new Date(date) > new Date(Date.now())
        ? next()
        : res.status(400).json({message: `'${dateObj[datePlace]}' must be a date after today.`})
    }
  }
}

// "dateObj" = object representing where to find the date
// "param/body/req" = nested keys on "dateObj" with values
//     equal to the date identifier
// "mktObj" = object representing how to find the market
// "param/body/req" = the same as for "dateObj"
function validReserveDate(dateObj, mktObj) {
  return async (req, res, next) => {
    // Grab the places of the date and market
    const datePlace = Object.keys(dateObj)[0];
    const mktPlace = Object.keys(mktObj)[0];
    let date;
    // Grab the date from its place
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
      // Map the days of the week to JS's .getDay() values
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
      // Grab the market from its place
      if(mktPlace === 'param') {
        mkt = req.params[mktObj[mktPlace]];
      } else if (mktPlace === 'body') {
        mkt = req.body[mktObj[mktPlace]];
      } else {
        mkt = req[mktObj[mktPlace]];
      }
      // Create an array of days the market is open
      const days = await db('market_days')
        .where({market_id: mkt})
        .pluck('day')
      // Use UTC to ignore user timezone
      const num = new Date(date).getUTCDay();
      // Reverse engineer the name of the day
      const day = Object.keys(nums).find(key => nums[key] === num);
      // Create an array of valid days by number
      const numDays = days.map(day => nums[day]);
      // If the specified date is not included in valid days,
      //     kick back with 403
      !numDays.includes(num)
        ? res.status(403).json({message: `This market is not open on ${day}s. Please try for one of the following days: ${days.join(', ')}`})
        : next();
    }
  }
}

// "param" = the URL parameter where the booth ID can be found
function availBooths(param) {
  return async (req, res, next) => {
    // Grab the total number of the specified booth type
    const {number} = await db('market_booths')
      .select('number')
      .where({id: req.params[param]})
      .first();
    // Grab the current total of reservations for that type
    const booths = await db('market_reserve')
      .where({booth_id: req.params[param], reserve_date: req.body.reserve_date});
    // If the booth limit has been reached, kick back a 403
    booths.length >= number
      ? res.status(403).json({message: 'All available booths have already been reserved on this date.'})
      : next();
  }
}
