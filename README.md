# Cloud Stands - Back-End
Back-end for labs14-market-organizer.

# API Documentation

#### Backend deployed on [Heroku](https://cloudstands.herokuapp.com).<br>

## Getting started

The complete application is build with Node.js, Express.js 
<br>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

To get the server running locally:

- Clone this repo <br>
$ git clone https://github.com/labs14-market-organizer/backend.git <br>
$ cd backend <br>

- Install the dependencies: <br>
$ yarn install

- Run the development server: <br>
$ yarn server

- To run the tests: <br>
$ yarn test

- Navigate to http://localhost:5000 <br>

### Node.js/Express.js Flexibility

Express is a fast, assertive, essential, and moderate web framework of Node.js. You can assume Express is a layer built on the top of Node.js that helps manage a server and its routes. It provides a robust set of features to develop web and mobile applications.

## Endpoints

#### Auth Routes

| Method | Endpoint                 | Access Control | Description                                  |
| ------ | ------------------------ | -------------- | -------------------------------------------- |
| GET    | `/auth/google`           | none           | Redirects user to Google for secure login    |
| GET    | `/auth/google/callback`  | Google         | Handles redirects from Google & updates DB   |
| GET    | `/auth/facebook`         | none           | Redirects user to Facebook for secure login  |
| GET    | `/auth/facebok/callback` | Facebook       | Handles redirects from Facebook & updates DB |

#### User Routes

| Method | Endpoint    | Access Control | Description                     |
| ------ | ----------- | -------------- | ------------------------------  |
| GET    | `/user`     | logged in user | Returns info on logged in user. |
| GET    | `/user/:id` | none           | Returns info on specific user.  |

#### Vendor Routes

| Method | Endpoint       | Access Control | Description                      |
| ------ | -------------- | -------------- | -------------------------------- |
| GET    | `/vendors`     | none           | Returns info on all vendors.     |
| GET    | `/vendors/:id` | none           | Returns info on specific vendor. |
| POST   | `/vendors/`    | logged in user | Creates new vendor.              |
| PUT    | `/vendors/:id` | vendor admin   | Updates specific vendor.         |
| DELETE | `/vendors/:id` | vendor admin   | Deletes specific vendor.         |

#### Market Routes

| Method | Endpoint                   | Access Control | Description                                  |
| ------ | -------------------------- | -------------- | -------------------------------------------- |
| GET    | `/markets`                 | none           | Returns info on all markets.                 |
| GET    | `/markets/search`          | none           | Returns info on markets matching `?q=` query |
| GET    | `/markets/:id`             | none           | Returns info on specific market.             |
| POST   | `/markets/`                | logged in user | Creates new market.                          |
| PUT    | `/markets/:id`             | market admin   | Updates specific market.                     |
| DELETE | `/markets/:id`             | market admin   | Deletes specific market.                     |
| POST   | `/markets/:id/booths`      | market admin   | Creates new booth at an existing market.     |
| PUT    | `/markets/:id/booths/:bID` | market admin   | Updates a booth at an existing market.       |
| DELETE | `/markets/:id/booths/:bID` | market admin   | Deletes a booth at an existing market.       |

# Data Model

#### USER_AUTH
Data needed for user to sign-in from linked OAuth providers

---

```
{
  id: INTEGER, auto-incrementing
  user_id: INTEGER, foreign key to `users` table
  provider: STRING, the name of the OAuth provider
  prov_user: STRING, the provider's ID for the user
  created_at: TIMESTAMP WITH TIMEZONE
  updated_at: TIMESTAMP WITH TIMEZONE
}
```

#### USERS
Top-level information on user accounts

---

```
{
  id: INTEGER, auto-incrementing
  email: STRING, the user's preferred email address
  created_at: TIMESTAMP WITH TIMEZONE
  updated_at: TIMESTAMP WITH TIMEZONE
}
```

#### VENDORS
Vendor profile data

---

```
{
  id: INTEGER, auto-incrementing
  admin_id: INTEGER, foreign key to USERS table
  name: STRING
  description: TEXT 
  items: ARRAY of STRINGs
  electricity: BOOLEAN
  ventilation: BOOLEAN
  loud: BOOLEAN
  other_special: TEXT
  website: STRING
  facebook: STRING
  twitter: STRING
  instagram: STRING
  created_at: TIMESTAMP WITH TIMEZONE
  updated_at: TIMESTAMP WITH TIMEZONE
}
```

#### MARKETS
Market profile data

---

```
{
  id: INTEGER, auto-incrementing
  admin_id: INTEGER, foreign key to USERS table
  name: STRING
  description: TEXT 
  address: STRING
  city: STRING
  state: STRING
  zipcode: STRING
  type: INTEGER
  website: STRING
  facebook: STRING
  twitter: STRING
  instagram: STRING
  created_at: TIMESTAMP WITH TIMEZONE
  updated_at: TIMESTAMP WITH TIMEZONE
}
```

#### MARKET_BOOTHS
Market booth types, per market

---

```
{
  id: INTEGER, auto-incrementing
  market_id: INTEGER, foreign key to MARKETS table
  name: STRING
  number: INTEGER
  price: NUMERIC (precision 8, scale 2)
  size: ARRAY of INTEGERS
  description: TEXT
}
```

#### MARKET_DAYS
Market hours of operation, by day

---

```
{
  id: INTEGER, auto-incrementing
  market_id: INTEGER, foreign key to MARKETS table
  day: STRING,
  start: TIME WITHOUT TIMEZONE
  end: TIME WITHOUT TIMEZONE
}
```

## Actions

### Middleware
- `verifyJWT()` -> Verifies any JWT passed in the Authorization header of a request and denies invalid tokens
- `protect()` -> Always used after `verifyJWT`, protects routes by checking if a JWT exists in the Authorization header
- `parseQueryAddr()` -> Parses a query string passed to the route on `q` as an address, pulling out the city, state, and zipcode into separate variables and placed on the request's `query` object
- `parentExists(table, param)()` -> Curried function that checks whether the target asset is actually a child of the parent specified in the route's path by checking against the parent's `table` with the specified `param` in the route
- `onlyOwner(table, tableID, paramID1)(joinTbl, joinID, joinOn, paramID2)()` -> Twice curried function that checks whether the user making the request is the owner of the target asset or its parent, respectively
- `validate()` -> Immediately following an `express-validator` array of validators (from a `validate.js` file within the router's directory), checks the request body for valid data
- `reqCols(required, reqID, colID)()` -> Curried function that checks the request body against an array of `required` columns, and can optionally check if one column (`colID`) needs to match the ID of the user making the request by setting `reqID` to true
- `reqNestCols(reqObjs)()` -> Checks nested fields on the request body against a `reqObjs` object that specifies an array of required fields that should be nested within the parent specified by their key
- `onlyCols(allowed)()` -> Rejects requests that try to pass any values not whitelisted in the `allowed` array of fields
- `onlyNestCols(allowObjs)()` -> Rejects requests that try to pass any nested values not whitelisted on the specified parents within the `allowObjs` object

### Auth

- `google()` -> Determines if a Google user already has an account, creates an account (if needed), and returns the user
- `facebook()` -> Determines if a Facebook user already has an account, creates an account (if needed), and returns the user

### Users

- `findById(id)` -> Returns user with specified ID in the `users` table

### Vendors

- `find()` -> Returns all vendors
- `findById()` -> Returns vendor with specified ID in the `vendors` table
- `add()` -> Adds vendor to `vendor` table
- `update()` -> Updates vendor with specified ID in the `vendors` table
- `remove()` -> Deletes vendor with specified ID in the `vendors` table

### Markets

- `find()` -> Returns all markets
- `search()` -> Searches markets by city, state, and/or zip code based on parsed address string
- `findById()` -> Returns market with specified ID in the `markets` table
- `add()` -> Adds market to `markets` table
- `update()` -> Updates market with specified ID in the `markets` table
- `remove()` -> Deletes market with specified ID in the `markets` table
- `addBooth()` -> Adds booth to `market_booths` table
- `updateBooth()` -> Updates market with specified ID in the `market_booths` table
- `removeBooth()` -> Deletes market with specified ID in the `market_booths` table


## Environment Variables

In order for the app to function correctly, the user must set up their own environment variables.

create a .env file that includes the following:

    *  NODE_ENV - specify `development` while in development and `production` in production/staging
    *  BE_URL - the URL of the backend you're using
    *  FE_URL - the URL of the frontend you're using
    *  JWT_SECRET - the secret used on the JWTs sent back to the frontend
    *  DB_TEST - required in development only, the `postgres://` URL of your test database
    *  DB_DEV - required in development only, the `postgres://` URL of your development database
    *  GOOGLE_ID - This is provided in the Credentials section of the Google Developer Console
    *  GOOGLE_SECRET - This is also provided in the Credentials section of the Google Developer Console
    *  FACEBOOK_ID - This is provided in the Basic Settings section of the Facebook Developers dashboard
    *  FACEBOOK_SECRET - This is also provided in the Basic Settings section of the Facebook Developers dashboard
    
## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](./code_of_conduct.md). Please follow it in all your interactions with the project.

### Issue/Bug Request

 **If you are having an issue with the existing project code, please submit a bug report under the following guidelines:**
 - Check first to see if your issue has already been reported.
 - Check to see if the issue has recently been fixed by attempting to reproduce the issue using the latest master branch in the repository.
 - Create a live example of the problem.
 - Submit a detailed bug report including your environment & browser, steps to reproduce the issue, actual and expected outcomes,  where you believe the issue is originating from, and any potential solutions you have considered.

### Feature Requests

We would love to hear from you about new features which would improve this app and further the aims of our project. Please provide as much detail and information as possible to show us why you think your new feature should be implemented.

### Pull Requests

If you have developed a patch, bug fix, or new feature that would improve this app, please submit a pull request. It is best to communicate your ideas with the developers first before investing a great deal of time into a pull request to ensure that it will mesh smoothly with the project.

Remember that this project is licensed under the MIT license, and by submitting a pull request, you agree that your work will be, too.

#### Pull Request Guidelines

- Ensure any install or build dependencies are removed before the end of the layer when doing a build.
- Update the README.md with details of changes to the interface, including new plist variables, exposed ports, useful file locations and container parameters.
- Ensure that your code conforms to our existing code conventions and test coverage.
- Include the relevant issue number, if applicable.
- You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

### Attribution

These contribution guidelines have been adapted from [this good-Contributing.md-template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).

## Documentation

See [Frontend Documentation](https://github.com/labs14-market-organizer/frontend) for details on the frontend of our project.
