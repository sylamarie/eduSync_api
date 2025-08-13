const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

router.use('/', swaggerUi.serve);
router.get('/', (req, res) => {
  const swaggerDoc = JSON.parse(JSON.stringify(swaggerDocument));

  // Force match the request's protocol and host
  swaggerDoc.host = req.get('host');
  swaggerDoc.schemes = [req.protocol === 'http' && req.get('host').includes('onrender.com') ? 'https' : req.protocol];

  res.send(swaggerUi.generateHTML(swaggerDoc));
});

module.exports = router;