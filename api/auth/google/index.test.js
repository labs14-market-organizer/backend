const server = require('../../server');
const request = require('supertest')(server);
const knex = require('../../../db/config');

const loginGL = request.get('/auth/google');

describe('auth/google GET', () => {
  beforeAll(async () => await knex.seed.run());

  it('should return 302 status', () => {
    return loginGL.expect(302);
  })

  it('should redirect to Google OAuth 2.0', () => {
    const expected = "https://accounts.google.com/o/oauth2/v2/auth";
    return loginGL.then(res => expect(res.header.location.split('?')[0]).toBe(expected));
  })
})
