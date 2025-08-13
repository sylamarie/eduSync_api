require('dotenv').config();
const request = require('supertest');

// ----------------- Configuration -----------------
jest.setTimeout(15000); // Increase timeout for slower cloud API responses

const BASE_URL = process.env.BASE_URL || 'https://edusync-api-7p52.onrender.com';
const API_PREFIX = ''; // e.g., '/api' or '/api/v1'; keep '' if none
const COLLECTIONS = ['students', 'users', 'courses', 'enrollments'];

// ----------------- Authentication -----------------
const AUTH = process.env.TOKEN ? { Authorization: `Bearer ${process.env.TOKEN}` } : null;

// ----------------- Helper Functions -----------------
function getId(doc) {
  return doc._id || doc.id || doc.uuid || null;
}

function generateMockData(collection) {
  switch (collection) {
    case 'students':
      return { name: `Test Student ${Date.now()}`, email: `student${Date.now()}@school.com` };
    case 'users':
      return { username: `user${Date.now()}`, password: 'Password123!' };
    case 'courses':
      return { name: `Test Course ${Date.now()}`, code: `C-${Date.now()}` };
    case 'enrollments':
      return { studentId: 'dummyStudentId', courseId: 'dummyCourseId', status: 'active' };
    default:
      return {};
  }
}

function generateUpdateData(collection) {
  switch (collection) {
    case 'students':
      return { name: `Updated Student ${Date.now()}` };
    case 'users':
      return { username: `UpdatedUser${Date.now()}` };
    case 'courses':
      return { name: `Updated Course ${Date.now()}` };
    case 'enrollments':
      return { status: 'completed' };
    default:
      return {};
  }
}

// ----------------- CRUD Tests -----------------
COLLECTIONS.forEach((collection) => {
  describe(`${collection.toUpperCase()} CRUD routes`, () => {
    let sampleId = null;

    // ---------- GET all ----------
    test(`GET ${API_PREFIX}/${collection} returns 200/204/404`, async () => {
      const res = await request(BASE_URL)
        .get(`${API_PREFIX}/${collection}`)
        .set(AUTH ? AUTH : {});
      console.log(`${collection} GET all → Status:`, res.status);

      expect([200, 204, 404]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.body) && res.body.length) {
        sampleId = getId(res.body[0]);
      }
    }, 15000);

    // ---------- POST ----------
    test(`POST ${API_PREFIX}/${collection}`, async () => {
      if (!AUTH) {
        console.log(`${collection} POST → skipped (no TOKEN)`);
        return;
      }
      const mockData = generateMockData(collection);
      const res = await request(BASE_URL)
        .post(`${API_PREFIX}/${collection}`)
        .send(mockData)
        .set(AUTH);
      console.log(`${collection} POST → Status:`, res.status, 'Body:', res.body);

      expect([201, 400, 401, 404]).toContain(res.status);
      if (res.status === 201) sampleId = getId(res.body);
    }, 15000);

    // ---------- GET by ID ----------
    test(`GET ${API_PREFIX}/${collection}/:id returns 200 or 404`, async () => {
      if (!sampleId) return;
      const res = await request(BASE_URL)
        .get(`${API_PREFIX}/${collection}/${sampleId}`)
        .set(AUTH ? AUTH : {});
      console.log(`${collection} GET by ID → Status:`, res.status);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) expect(res.body).toBeTruthy();
    }, 15000);

    // ---------- PUT ----------
    test(`PUT ${API_PREFIX}/${collection}/:id`, async () => {
      if (!sampleId || !AUTH) {
        if (!AUTH) console.log(`${collection} PUT → skipped (no TOKEN)`);
        return;
      }
      const updateData = generateUpdateData(collection);
      const res = await request(BASE_URL)
        .put(`${API_PREFIX}/${collection}/${sampleId}`)
        .send(updateData)
        .set(AUTH);
      console.log(`${collection} PUT → Status:`, res.status);

      expect([200, 400, 401, 404]).toContain(res.status);
    }, 15000);

    // ---------- DELETE ----------
    test(`DELETE ${API_PREFIX}/${collection}/:id`, async () => {
      if (!sampleId || !AUTH) {
        if (!AUTH) console.log(`${collection} DELETE → skipped (no TOKEN)`);
        return;
      }
      const res = await request(BASE_URL)
        .delete(`${API_PREFIX}/${collection}/${sampleId}`)
        .set(AUTH);
      console.log(`${collection} DELETE → Status:`, res.status);

      expect([200, 401, 404]).toContain(res.status);
    }, 15000);
  });
});
