const express = require('express');
require('dotenv').config();

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
