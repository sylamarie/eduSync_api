const swaggerAutogen = require('swagger-autogen')();

// Determine the host based on environment
const isProduction = process.env.NODE_ENV === 'production';
const host = isProduction 
  ? process.env.RENDER_EXTERNAL_HOSTNAME || 'edusync-api-7p52.onrender.com'
  : `localhost:${process.env.PORT || 3000}`;

const doc = {
  info: {
    title: 'EduSync API',
    description: "API for managing a school's student information system. It allows authenticated staff to manage student records, courses, and enrollments.",
    version: '1.0.0'
  },
  host: host,
  schemes: isProduction ? ['https'] : ['http']
};

const outputFile = './swagger.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);