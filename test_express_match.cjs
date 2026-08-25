const express = require('express');
const app = express();
app.get('*all', (req, res) => res.send('ok'));
app.listen(3002, () => {
  require('http').get('http://localhost:3002/some/path', (res) => {
    console.log('Status:', res.statusCode);
    process.exit(0);
  });
});
