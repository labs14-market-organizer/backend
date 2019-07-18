const request = require('supertest');
const server = require('./server.js');

describe('test environment', () => {
  it('runs', () => {
    expect(true).toBe(true);
  })
})

describe('server', () => {
  describe('/ GET', () => {
    it('should return 200 status', () => {
      return request(server)
        .get('/')
        .expect(200);
    })

    it('should return provided welcome message', () => {
      const expected = {"message": "Hello from CloudStands."};
      return request(server)
        .get('/')
        .then(res => expect(res.body).toEqual(expected));
    })
  })
})
