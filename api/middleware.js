const jwt = require('jsonwebtoken');
const db = require('../data/dbConfig');
const parseAddr = require("parse-address-string");
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
  onlyNestCols
}

// Verifies JWT and stores subject on request as "user_id"
function verifyJWT(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;
  if(!token) {
    next(); // Let protect() handle route protection
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if(!err) {
        req.user_id = decoded.subject;
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
            builder.where({[`${table}.id`]: req.params[tbl.param]});
          } else {
            builder.where({[`${last.table}.id`]: req.params[last.param]})
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
    const matchParamID = owners.reduce((newObj, table) => {
      const params = table[1].join.reduce((arr, joined, i) => {
        return i === 0
          ? [...arr, [joined.id, table[1].param]]
          : [...arr, [joined.id, table[1].join[i-1].param]]
      }, [])
      return {...newObj, [table[0]]: params}
    }, {})
    const mismatches = results.reduce((newObj, result) => {
      const arr = Object.values(matchParamID[result.table]).reduce((newArr, pair) => {
        const [col, param] = pair;
        return `${result.result[col]}` !== req.params[param]
          ? [...newArr, col]
          : newArr;
      }, [])
      return {...newObj, [result.table]: arr}
    }, {})
    if(!req.owner.length) {
      res.status(403).json({message: `Only the admins of the the following associated entries are authorized to make this request: ${Object.keys(obj).join(', ')}`})
    } else if(Object.values(mismatches).every(owner => owner.length > 0)) {
      res.status(400).json({message: 'One or more of the parent IDs in the URL does not match the ID of the relevant parent.'})
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

// "allowed" = array of columns that the user is allowed to specify in the request body
function onlyCols(allowed) {
  return (req, res, next) => {
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
