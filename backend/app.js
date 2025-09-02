const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Welcome to Helensvale Connect Backend!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
