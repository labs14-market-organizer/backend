const server = require('../../server');
const request = require('supertest')(server);
const knex = require('../../../db/config');

const loginSQ = request.get('/auth/square');

describe('/auth/square', () => {
  beforeAll(async () => await knex.seed.run());
  
  it('should return 302 status', () => {
    return loginSQ.expect(302);
  })

  it('should redirect to Square OAuth 2.0', () => {
    const expected = "https://connect.squareup.com/oauth2/authorize";
    return loginSQ.then(res => expect(res.header.location.split('?')[0]).toBe(expected));
  })
})
