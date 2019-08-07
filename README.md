
# Cloudstand-backend
Back-end for labs14-Market Organizer.

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
-$ yarn test

- Navigate to http://localhost:5000 <br>

### Node.js/Express.js Flexibility

-Express is a fast, assertive, essential and moderate web framework of Node.js. You can assume express as a layer built on the top of the Node.js that helps manage a server and routes. It provides a robust set of features to develop web and mobile applications.

## Endpoints

#### Auth Routes

| Method | Endpoint                | Access Control | Description                                |
| ------ | ----------------------- | -------------- | ------------------------------------------ |
| GET    | `/auth/google`          | none           | Redirects user to Google for secure login  |
| GET    | `/auth/google/callback` | Google         | Handles redirects from Google & updates DB |

#### User Routes

| Method | Endpoint        | Access Control      | Description                    |
| ------ | --------------- | ------------------- | ------------------------------ |
| GET    | `/user`     | logged in user | Returns info on logged in user.     |
| GET    | `/user/:id` | none                | Returns info on specific user. |

#### Market Routes

| Method | Endpoint       | Access Control      | Description                      |
| ------ | -------------- | ------------------- | -------------------------------- |
| GET    | `/markets`     | none                | Returns info on all markets.     |
| GET    | `/markets/:id` | none                | Returns info on specific market. |
| POST   | `/markets/`    | market admin                | Creates new market.              |
| PUT    | `/markets/:id` | market admin                | Updates specific market.         |
| DELETE | `/markets/:id` | market admin                | Deletes specific market.           |

#### Vendor Routes

| Method | Endpoint       | Access Control      | Description                      |
| ------ | -------------- | ------------------- | -------------------------------- |
| GET    | `/vendors`     | none                | Returns info on all vendors.     |
| GET    | `/vendors/:id` | none                | Returns info on specific vendor. |
| POST   | `/vendors/`    | vendor admin                | Creates new vendor.              |
| PUT    | `/vendors/:id` | vendor admin                | Updates specific vendor.         |
| DELETE | `/vendors/:id` | vendor admin                | Deletes specific vendor.           |

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
}
```

#### USERS
Top-level information on user accounts

---

```
{
  id: INTEGER, auto-incrementing
  email: STRING, the user's preferred email address
  // more to come
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

## Actions

### Auth

`google()` -> Determines if a Google user already has an account, creates an account (if needed), and returns the user

### Users

`find()` -> Returns all users
`findById(id)` -> Returns user with specified ID in the `users` table

### Vendors

`find()` -> Returns all vendors
`findById()` -> Returns vendor with specified ID in the `vendors` table
`add()` -> Adds vendor to `vendor` table
`update()` -> Updates vendor with specified ID in the `vendors` table
`remove()` -> Deletes vendor with specified ID in the `vendors` table

## 3️⃣ Environment Variables

In order for the app to function correctly, the user must set up their own environment variables.

create a .env file that includes the following:

    *  DB_ENV - specify `development` while in development and `production` in production/staging
    *  BE_URL - the URL of the backend you're using
    *  FE_URL - the URL of the frontend you're using
    *  JWT_SECRET - the secret used on the JWTs sent back to the frontend
    *  DB_TEST - required in development only, the `postgres://` URL of your test database
    *  DB_DEV - required in development only, the `postgres://` URL of your development database
    *  GOOGLE_ID - This is provided in the Credentials section of the Google Developer Console
    *  GOOGLE_SECRET - This is also provided in the Credentials section of the Google Developer Console
    
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
