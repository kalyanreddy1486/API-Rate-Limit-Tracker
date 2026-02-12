require('dotenv').config();

const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
