require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('return location lat, long, query', async() => {

      const expectation = {
        'latitude': '42.3602534',
        'longitude': '-71.0582912',
        'formatted_query': 'Boston, Suffolk County, Massachusetts, USA'
      };

      const data = await fakeRequest(app)
        .get('/location?search=boston')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
