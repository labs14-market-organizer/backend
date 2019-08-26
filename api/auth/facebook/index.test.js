const server = require('../../server');
const request = require('supertest')(server);
const knex = require('../../../db/config');

const loginFB = request.get('/auth/facebook');

describe('/auth/facebook GET', () => {
  beforeAll(async () => await knex.seed.run());
  
  it('should return 302 status', () => {
    return loginFB.expect(302);
  })

  it('should redirect to Facebook OAuth 2.0', () => {
    const expected = "https://www.facebook.com/v3.2/dialog/oauth";
    return loginFB.then(res => expect(res.header.location.split('?')[0]).toBe(expected));
  })
})
