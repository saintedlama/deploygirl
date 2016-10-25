const path = require('path');

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../app');

const db = require('../../lib/db');
const buildDeployPackage = require('../../lib/build-deploy-package');
const fakeFixture = path.join(__dirname, 'fixtures', 'fake');

function resetDb() {
  db.get('applications')
    .remove()
    .value();
}

describe('api', function() {
  beforeEach(resetDb);

  describe('/applications', function() {
    it('should list empty applications array if no applications created', (done) => {
      request(app)
        .get('/applications')
        .auth('', 'c3po')
        .expect('Content-Type', /json/)
        .expect(200, [])
        .end(done);
    });

    it('should return status 404 for a non existing application', (done) => {
      const id = 'app1';

      request(app)
        .get(`/applications/${id}`)
        .auth('', 'c3po')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done);
    });

    it('should create an application', (done) => {
      const id = 'app1';

      request(app)
        .put(`/applications/${id}`)
        .auth('', 'c3po')
        .expect('Content-Type', /json/)
        .expect(200, { id, deployments: [] })
        .end(done);
    });

    it('should create an application with additional put body fields', (done) => {
      const id = 'app_fields';
      const fields = { field1: 1, field2: 2 };

      request(app)
        .put(`/applications/${id}`)
        .auth('', 'c3po')
        .send(fields)
        .expect('Content-Type', /json/)
        .expect(200, Object.assign({}, fields, { id, deployments: [] }))
        .end(done);
    });

    it('should not allow creating a duplicate application id', (done) => {
      const id = 'app_exists';

      createApplication(id, () => {
        request(app)
          .put(`/applications/${id}`)
          .auth('', 'c3po')
          .expect('Content-Type', /json/)
          .expect(409)
          .end(done);
      });
    });

    it('should list all applications', (done) => {
      const id = 'app_list';

      createApplication(id, { detail: true }, () => {
        request(app)
          .get('/applications')
          .auth('', 'c3po')
          .expect('Content-Type', /json/)
          .expect(200, [{ id }])
          .end(done);
      });
    });

    it('should get detail for an application', (done) => {
      const id = 'app_detail';

      createApplication(id, { detail: true }, () => {
        request(app)
          .get(`/applications/${id}`)
          .auth('', 'c3po')
          .expect('Content-Type', /json/)
          .expect(200, { id, detail: true, deployments: [] })
          .end(done);
      });
    });
  });

  describe('/applications/deployments', function() {
    this.timeout(20000);

    it('should return 400 if no deployment package was sent', (done) => {
      request(app)
        .post(`/applications/deploytest/deployments`)
        .auth('', 'c3po')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(done);
    });

    it('should deploy a valid deployment package', (done) => {
      buildDeployPackage(fakeFixture, (err, deployPackage) => {
        expect(err).to.not.exist;

        request(app)
          .post(`/applications/deploytest/deployments`)
          .attach('deployment', deployPackage)
          .auth('', 'c3po')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            expect(err).to.not.exist;

            expect(res.body.stdout).to.exist;
            expect(res.body.stderr).to.exist;

            done();
          });
      });
    });

    it('should list deployments', (done) => {
      buildDeployPackage(fakeFixture, (err, deployPackage) => {
        expect(err).to.not.exist;

        request(app)
          .post(`/applications/deploytest/deployments`)
          .attach('deployment', deployPackage)
          .auth('', 'c3po')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err) => {
            expect(err).to.not.exist;

            request(app)
              .get(`/applications/deploytest/deployments`)
              .auth('', 'c3po')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect(err).to.not.exist;

                expect(res.body.length).to.equal(1);
                expect(res.body[0].state).to.equal('success');

                done();
              });
          });
      });
    });
  });

  describe('auth', function() {
    it('should return 401 status for unauthenticated requests', (done) => {
      request(app)
        .get(`/applications`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });

    it('should return 401 status for wrong credentials', (done) => {
      request(app)
        .get(`/applications`)
        .auth('', 'asdasdasdas')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });

    it('should ignore user name in basic auth', (done) => {
      request(app)
        .get(`/applications`)
        .auth('hugo', 'c3po')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
    });

    it('should accept API key as key query parameter', (done) => {
      request(app)
        .get(`/applications?key=c3po`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
    });
  });
});

function createApplication(id, fields, next) {
  if (typeof fields == 'function') {
    next = fields;
    fields = {};
  }

  request(app)
    .put(`/applications/${id}`)
    .auth('', 'c3po')
    .send(fields)
    .expect('Content-Type', /json/)
    .expect(200, Object.assign({}, fields, { id, deployments: [] }))
    .end((err) => {
      expect(err).to.not.exist;

      next(err);
    });
}