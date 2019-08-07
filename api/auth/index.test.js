const server = require('../server');
const request = require('supertest')(server);

describe('/auth', () => {
  describe('/google GET', () => {
    it('should return 302 status', () => {
      return request.get('/auth/google')
        .expect(302);
    })

    it('should redirect to Google OAuth 2.0', () => {
      const expected = "https://accounts.google.com/o/oauth2/v2/auth";
      return request.get('/auth/google')
        .then(res => expect(res.header.location.split('?')[0]).toBe(expected));
    })
  })
})
