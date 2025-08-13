const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Dynamically set host/schemes at runtime
router.use('/', swaggerUi.serve);
router.get('/', (req, res) => {
  // Clone the swagger document so we don't mutate the original file
  const swaggerDoc = JSON.parse(JSON.stringify(swaggerDocument));

  // Auto-detect host and scheme from request
  swaggerDoc.host = req.get('host');
  swaggerDoc.schemes = [req.protocol];

  res.send(swaggerUi.generateHTML(swaggerDoc));
});

module.exports = router;