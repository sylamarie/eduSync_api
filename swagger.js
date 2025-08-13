const swaggerAutogen = require('swagger-autogen')();

const doc = {
  swagger: '2.0',
  info: {
    title: 'EduSync API',
    description: "API for managing a school's student information system. It allows authenticated staff to manage student records, courses, and enrollments.",
    version: '1.0.0',
  },
  // Leave host/schemes empty — Swagger UI will auto-detect from browser
  host: '',
  schemes: [],
  basePath: '/',
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

swaggerAutogen(outputFile, routes, doc);