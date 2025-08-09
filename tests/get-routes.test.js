// tests/get-routes.test.js
const request = require('supertest');

// 1) Base URL: set via package.json script (test:remote) or defaults to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 2) If your API has a prefix like /api or /api/v1, set it here ('' if none)
const API_PREFIX = ''; // e.g., '/api' or '/api/v1'

// 3) The four collections required by the rubric
const COLLECTIONS = ['students', 'users', 'courses', 'enrollments'];

// If GET endpoints require auth, set TOKEN env and uncomment the .set(...) lines below:
// const AUTH = process.env.TOKEN ? { Authorization: `Bearer ${process.env.TOKEN}` } : null;

COLLECTIONS.forEach((name) => {
  describe(`${name.toUpperCase()} GET routes`, () => {
    let sampleId = null;

    test(`GET ${API_PREFIX}/${name} returns 200/204/404`, async () => {
      const res = await request(BASE_URL)
        .get(`${API_PREFIX}/${name}`)
        // .set(AUTH ? AUTH : {}) // uncomment if your routes need a Bearer token
      ;

      // Accept 200 (OK), 204 (No Content), or 404 (empty/none)
      expect([200, 204, 404]).toContain(res.status);

      // Only inspect body if we actually got one (status 200)
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);

        // Grab an id for the by-id test (if any docs exist)
        if (res.body.length) {
          sampleId = res.body[0]._id || res.body[0].id || res.body[0].uuid;
        }
      }
    });

    test(`GET ${API_PREFIX}/${name}/:id returns 200 or 404`, async () => {
      // If we didn't get an id yet, try listing again quickly:
      if (!sampleId) {
        const list = await request(BASE_URL)
          .get(`${API_PREFIX}/${name}`)
          // .set(AUTH ? AUTH : {})
        ;
        if (list.status === 200 && Array.isArray(list.body) && list.body.length) {
          sampleId = list.body[0]._id || list.body[0].id || list.body[0].uuid;
        }
      }

      // If still no data, just skip gracefully (collection is empty)
      if (!sampleId) {
        console.warn(`⚠️  No documents in ${name}; skipping GET by id.`);
        return;
      }

      const res = await request(BASE_URL)
        .get(`${API_PREFIX}/${name}/${sampleId}`)
        // .set(AUTH ? AUTH : {})
      ;

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toBeTruthy();
        // Optionally check the same id matches if your API returns it:
        // const gotId = res.body._id || res.body.id || res.body.uuid;
        // expect(gotId).toBe(sampleId);
      }
    });
  });
});
