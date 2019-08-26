const server = require('./server.js');
const request = require('supertest')(server);

describe('test environment', () => {
  it('runs', () => {
    expect(true).toBe(true);
  })
})

describe('server', () => {
  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request.get('/')
        .expect(200);
    })

    it('should return provided welcome message', () => {
      const expected = {"message": "Hello from Cloud Stands."};
      return request.get('/')
        .then(res => expect(res.body).toEqual(expected));
    })
  })
})
